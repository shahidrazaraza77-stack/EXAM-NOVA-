import { NextRequest, NextResponse } from "next/server";
import { safeGenerateContent } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { markdownText } = await request.json();

    if (!markdownText || !markdownText.trim()) {
      return NextResponse.json({ error: "markdownText is required" }, { status: 400 });
    }

    const prompt = `
You are an expert AI Resume Parser.
Convert the following resume (which is in markdown format) into the exact structured JSON schema required by our Form Builder.

Strict JSON Schema:
{
  "personalInfo": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "github": "string",
    "summary": "string"
  },
  "skills": {
    "technical": ["string"],
    "tools": ["string"],
    "soft": ["string"],
    "languages": ["string"]
  },
  "experience": [
    {
      "company": "string",
      "role": "string",
      "duration": "string",
      "responsibilities": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "techStack": "string",
      "description": "string",
      "githubLink": "string",
      "liveLink": "string"
    }
  ],
  "education": [
    {
      "college": "string",
      "degree": "string",
      "year": "string",
      "cgpa": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ]
}

Instructions:
1. Extract and map all details from the markdown text to the corresponding keys.
2. For experience responsibilities, combine bullet points into a single string separated by newlines.
3. For project techStack, combine technologies into a comma-separated string (e.g. "React, Next.js").
4. Return ONLY the raw JSON block. Do not include markdown code block formatting (\`\`\`json or \`\`\`).

Input Markdown Resume:
"""
${markdownText}
"""
`;

    const textResponse = await safeGenerateContent(prompt);
    
    // Clean response to extract raw JSON
    const cleanedJson = textResponse
      .replace(/```json\s*/gi, "")
      .replace(/```\s*$/gm, "")
      .trim();

    const parsedData = JSON.parse(cleanedJson);

    return NextResponse.json({ structuredData: parsedData });
  } catch (error: any) {
    console.error("Error parsing markdown to JSON:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse resume text" },
      { status: 500 }
    );
  }
}
