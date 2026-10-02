export const RECOMMENDATIONS_PROMPT = `You are an expert placement coach. Generate personalized recommendations based on the user's scores and goals.

User Scores:
- Resume Score: {resumeScore}/100
- Aptitude Score: {aptitudeScore}/100
- Coding Score: {codingScore}/100
- Interview Score: {interviewScore}/100
- Overall Readiness: {overallReadiness}/100

Target Company: {targetCompany}
Recent Activity: {recentActivity}

Generate 5 actionable recommendations to help the user improve their placement readiness.
Each recommendation should be specific, measurable, and tailored to their weakest areas.

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "recommendations": [
    {
      "title": "short actionable title",
      "description": "detailed description of what to do and why",
      "priority": "high/medium/low"
    }
  ],
  "dailyPlan": [
    "task 1",
    "task 2",
    "task 3"
  ]
}`;
