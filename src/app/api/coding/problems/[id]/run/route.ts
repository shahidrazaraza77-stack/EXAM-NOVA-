import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import { safeGenerateContent } from "@/lib/gemini";

import { getAuthenticatedUser } from "@/lib/auth-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request.headers);

  // 1. Authenticate Request
  const { session, errorResponse } = await getAuthenticatedUser(request);
  if (errorResponse || !session) return errorResponse || NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Rate limit code executions
  const rateLimit = checkRateLimit(session.user.id || ip, "ai");
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded for code execution. Please wait a moment." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  try {
    const authHeader = request.headers.get("Authorization");
    const supabase = getSupabaseServerClient(authHeader) as any;

    const { id: problemId } = await params;
    const body = await request.json().catch(() => ({}));
    const { code, language, customInput } = body;

    if (!code || !language) {
      return NextResponse.json({ error: "Code and language are required" }, { status: 400 });
    }

    if (typeof code === "string" && code.length > 20000) {
      return NextResponse.json({ error: "Code submitted exceeds maximum allowed length of 20KB." }, { status: 400 });
    }

    // 1. Fetch the problem details
    const { data: question, error: questionError } = await supabase
      .from("coding_questions")
      .select("*")
      .eq("id", problemId)
      .single();

    if (questionError || !question) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    // 2. Fetch test cases from the bank by matching problem slug
    const { data: bankProblem } = await supabase
      .from("coding_problem_bank")
      .select("test_cases, hidden_testcases, examples")
      .eq("slug", question.slug)
      .maybeSingle();

    // Compile test cases to run
    let testCasesToRun = [];

    if (customInput) {
      // User is running a custom input
      testCasesToRun = [{ input: customInput, expected: "Dynamic execution (Verify output)" }];
    } else {
      // Run examples and hidden test cases
      const examples = question.examples || bankProblem?.examples || [];
      const hidden = bankProblem?.hidden_testcases || bankProblem?.test_cases || [];

      // Combine examples (mapped to input/output) and hidden testcases
      const sampleCases = examples.map((ex: any) => ({
        input: ex.input,
        expected: ex.output,
        isSample: true
      }));

      const hiddenCases = hidden.map((tc: any) => ({
        input: tc.input,
        expected: tc.output,
        isSample: false
      }));

      testCasesToRun = [...sampleCases, ...hiddenCases];
      
      // If no test cases are found, use a fallback
      if (testCasesToRun.length === 0) {
        testCasesToRun = [
          { input: question.sample_input || "", expected: question.sample_output || "", isSample: true }
        ];
      }
    }

    // 3. Construct Gemini evaluation prompt
    const prompt = `You are a sandboxed compiler execution environment and competitive programming grading engine.
Your task is to run the user's code for the following problem.

Problem:
Title: ${question.title}
Description: ${question.description}
Constraints: ${question.constraints?.join(", ") || "None"}

Code:
Language: ${language}
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Test Cases to run:
${JSON.stringify(testCasesToRun, null, 2)}

You MUST execute the code step-by-step for each test case.
- Determine if the user's code is syntactically correct and compiles. If it does not, provide the compilation/syntax error in "errorMessage" and set "success" to false.
- For each test case, execute the program mentally, trace output, and check if the result matches the "expected" value.
- Populate "actual" with the return/printed value from the user's code.
- If it matches, set "passed" to true.
- Estimate runtime execution time (in ms, e.g. 10ms to 90ms) and memory used (in KB).

You MUST return ONLY a JSON response matching the following structure (do not wrap in markdown or any text):
{
  "success": true,
  "errorMessage": null,
  "testCases": [
    {
      "input": "test case input",
      "expected": "expected output",
      "actual": "actual output produced by user code",
      "passed": true,
      "logs": "stdout print logs or trace logs"
    }
  ],
  "executionTime": 45,
  "memoryUsed": 12400,
  "overallStatus": "Accepted"
}

Ensure "overallStatus" is one of: "Accepted" (if all passed), "Wrong Answer" (if any test case fails), "Runtime Error" (if code throws exceptions), "Time Limit Exceeded" (if infinite loop/recursion is detected).`;

    const responseText = await safeGenerateContent(prompt, "gemini-2.5-flash");
    
    // Clean response
    let cleaned = responseText.trim();
    cleaned = cleaned.replace(/^```json\s*/i, "");
    cleaned = cleaned.replace(/```\s*$/g, "");
    cleaned = cleaned.trim();

    const result = JSON.parse(cleaned);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("POST coding execution API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute code" },
      { status: 500 }
    );
  }
}
