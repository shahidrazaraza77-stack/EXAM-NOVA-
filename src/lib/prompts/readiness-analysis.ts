export const READINESS_ANALYSIS_PROMPT = `You are an expert placement readiness analyst. Analyze the following user scores and provide a comprehensive readiness assessment.

User Scores:
- Resume Score: {resumeScore}/100
- Aptitude Score: {aptitudeScore}/100
- Coding Score: {codingScore}/100
- Interview Score: {interviewScore}/100
- Overall Readiness: {overallReadiness}/100

Company Readiness Data:
{companyReadiness}

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "readinessLevel": "excellent/good/fair/poor",
  "readinessSummary": "2-3 sentence summary of overall placement readiness",
  "companyReadiness": [
    { "company": "company name", "readiness": number (0-100), "confidence": "high/medium/low" }
  ],
  "improvementSuggestions": [
    "specific actionable suggestion"
  ]
}`;
