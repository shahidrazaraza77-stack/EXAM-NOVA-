import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

async function validateAdmin(request: NextRequest): Promise<{ userId: string | null; errorResponse?: NextResponse }> {
  const authHeader = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!authHeader) return { userId: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(authHeader);
  if (error || !user) return { userId: null, errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await (supabaseAdmin.from("profiles") as any).select("role").eq("id", user.id).single();
  if ((profile as any)?.role !== "admin") return { userId: null, errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { userId: user.id };
}

export async function GET(request: NextRequest) {
  const { userId, errorResponse } = await validateAdmin(request);
  if (errorResponse) return errorResponse;

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const status = url.searchParams.get("status");
  const module_type = url.searchParams.get("module_type");
  const offset = (page - 1) * limit;

  let query = (supabaseAdmin.from("ai_generation_logs") as any)
    .select("*, profiles!ai_generation_logs_admin_id_fkey(full_name, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq("generation_status", status);
  if (module_type) query = query.eq("module_type", module_type);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count, page, limit });
}

export async function POST(request: NextRequest) {
  const { userId, errorResponse } = await validateAdmin(request);
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const { module_type, generation_prompt, generation_params, generation_count, generation_status, generated_content } = body;

  if (!module_type) return NextResponse.json({ error: "module_type is required" }, { status: 400 });

  const { data, error } = await (supabaseAdmin.from("ai_generation_logs") as any)
    .insert({
      admin_id: userId,
      module_type,
      generation_prompt,
      generation_params: generation_params || {},
      generation_count: generation_count || 0,
      generation_status: generation_status || "completed",
      generated_content: generated_content || null
    })
    .select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const { userId, errorResponse } = await validateAdmin(request);
  if (errorResponse) return errorResponse;

  const body = await request.json().catch(() => ({}));
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "id and status are required" }, { status: 400 });

  const validStatuses = ["pending", "completed", "failed", "draft", "review", "approved", "published"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` }, { status: 400 });
  }

  const supabase = supabaseAdmin as any;

  // 1. Fetch log content first
  const { data: log, error: logError } = await supabase
    .from("ai_generation_logs")
    .select("*")
    .eq("id", id)
    .single();

  if (logError || !log) {
    return NextResponse.json({ error: "AI generation log not found" }, { status: 404 });
  }

  // 2. Perform publishing copy logic if transitioning to published status
  if (status === "published" && log.generation_status !== "published") {
    const moduleType = log.module_type;
    const content = log.generated_content;
    const params = log.generation_params || {};

    if (moduleType === "aptitude" && content) {
      const topicName = params.topic || "General";
      const difficulty = params.difficulty || "Medium";
      const category = topicName.toLowerCase().includes("reasoning") || topicName.toLowerCase().includes("logical")
        ? "logical"
        : topicName.toLowerCase().includes("verbal") || topicName.toLowerCase().includes("english")
        ? "verbal"
        : "quantitative";

      // Resolve topicId
      let topicId: string | null = null;
      const { data: existingTopic } = await supabase
        .from("aptitude_topics")
        .select("id")
        .ilike("name", topicName)
        .maybeSingle();

      if (existingTopic) {
        topicId = existingTopic.id;
      } else {
        const { data: newTopic, error: topicErr } = await supabase
          .from("aptitude_topics")
          .insert({
            name: topicName,
            category,
            description: `AI-generated topic folder for ${topicName}`,
            icon: "Brain"
          })
          .select("id")
          .single();
        
        if (!topicErr && newTopic) {
          topicId = newTopic.id;
        }
      }

      // Read from generated content bank
      const questionsList = content.bank || content.questions || (Array.isArray(content) ? content : []);

      for (const q of questionsList) {
        // Prevent duplicates
        const { data: existingQ } = await supabase
          .from("aptitude_questions")
          .select("id")
          .eq("question", q.question)
          .eq("topic_id", topicId)
          .maybeSingle();

        if (!existingQ) {
          await supabase.from("aptitude_questions").insert({
            topic_id: topicId,
            question: q.question,
            option_a: q.option_a || q.options?.[0] || "Option A",
            option_b: q.option_b || q.options?.[1] || "Option B",
            option_c: q.option_c || q.options?.[2] || "Option C",
            option_d: q.option_d || q.options?.[3] || "Option D",
            correct_answer: q.correct_answer || q.answer || "A",
            explanation: q.explanation || "",
            difficulty: q.difficulty || difficulty,
            companies: q.companies || []
          });
        }
      }
    } else if (moduleType === "coding" && content) {
      const topicName = params.topics?.[0] || params.topic || "General";
      const difficulty = params.difficulty || "Medium";

      // Resolve topicId
      let topicId: string | null = null;
      const { data: existingTopic } = await supabase
        .from("coding_topics")
        .select("id")
        .ilike("name", topicName)
        .maybeSingle();

      if (existingTopic) {
        topicId = existingTopic.id;
      } else {
        const { data: newTopic, error: topicErr } = await supabase
          .from("coding_topics")
          .insert({
            name: topicName,
            description: `AI-generated problems folder for ${topicName}`
          })
          .select("id")
          .single();
        
        if (!topicErr && newTopic) {
          topicId = newTopic.id;
        }
      }

      const problemsList = content.problems || content.bank || (Array.isArray(content) ? content : []);

      for (const p of problemsList) {
        const slug = p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

        // Prevent duplicates
        const { data: existingP } = await supabase
          .from("coding_questions")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (!existingP) {
          await supabase.from("coding_questions").insert({
            topic_id: topicId,
            title: p.title,
            slug,
            description: p.description,
            difficulty: p.difficulty || difficulty,
            constraints: p.constraints || [],
            sample_input: p.sample_input || p.examples?.[0]?.input || "",
            sample_output: p.sample_output || p.examples?.[0]?.output || "",
            explanation: p.explanation || p.examples?.[0]?.explanation || "",
            companies: p.companies || [],
            starter_code: p.starter_code || {},
            optimal_solutions: p.optimal_solutions || {},
            complexity: p.complexity || { time: "O(N)", space: "O(1)" },
            examples: p.examples || [],
            acceptance_rate: p.acceptance_rate || "50.0%"
          });
        }
      }
    } else if (moduleType === "mock-test" && content) {
      const testData = content.bank || content;
      if (testData && testData.test_type?.toLowerCase() === "aptitude") {
        const { data: existingTest } = await supabase
          .from("aptitude_tests")
          .select("id")
          .eq("title", testData.title)
          .maybeSingle();

        if (!existingTest) {
          const { data: actTest } = await supabase
            .from("aptitude_tests")
            .insert({
              title: testData.title,
              description: testData.description || "AI-generated placement exam.",
              duration_minutes: testData.duration_minutes || 60,
              difficulty: testData.difficulty || "Medium"
            })
            .select()
            .single();

          if (actTest && Array.isArray(testData.questions)) {
            const { data: defaultTopic } = await supabase
              .from("aptitude_topics")
              .select("id")
              .limit(1)
              .single();

            for (const q of testData.questions) {
              const { data: actQ } = await supabase
                .from("aptitude_questions")
                .insert({
                  topic_id: defaultTopic?.id || null,
                  question: q.question,
                  option_a: q.options?.[0] || "A",
                  option_b: q.options?.[1] || "B",
                  option_c: q.options?.[2] || "C",
                  option_d: q.options?.[3] || "D",
                  correct_answer: q.answer || "A",
                  explanation: q.explanation || "",
                  difficulty: testData.difficulty || "Medium",
                  companies: []
                })
                .select()
                .single();

              if (actQ) {
                await supabase
                  .from("test_questions")
                  .insert({
                    test_id: actTest.id,
                    question_id: actQ.id
                  });
              }
            }
          }
        }
      }
    }
  }

  // 3. Update log status in the DB
  const { data, error } = await supabase
    .from("ai_generation_logs")
    .update({ generation_status: status }).eq("id", id).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
