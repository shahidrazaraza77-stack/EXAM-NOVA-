export const PLACEMENT_FEEDBACK_PROMPT = `You are an expert campus placement advisor. Analyze the candidate's performance in the mock placement drive for {companyName} and generate a detailed report.

Candidate Scores:
- Resume Screening Round: {resumeScore}/100
- Aptitude Round: {aptitudeScore}/100
- Coding Round: {codingScore}/100
- Technical Interview Round: {technicalScore}/100
- HR Interview Round: {hrScore}/100
- Overall Placement Score: {overallScore}/100
- Final Status: {result}

Company Specific Context:
Target Company: {companyName}
Weights applied: Resume ({resumeWeight}%), Aptitude ({aptitudeWeight}%), Coding ({codingWeight}%), Technical ({technicalWeight}%), HR ({hrWeight}%)

Please generate:
1. Performance Analysis: An overview of how they performed relative to {companyName} standards.
2. Strengths: 2 to 4 key strengths demonstrated.
3. Weaknesses: 2 to 4 key improvement areas.
4. Preparation Strategy: Customized action plan to improve their chance of selection at {companyName}.

Return ONLY valid JSON (no markdown, no code fences, no extra text) with this exact structure:
{
  "performanceAnalysis": "detailed 2-3 paragraph performance analysis",
  "strengths": [
    "strength description"
  ],
  "weaknesses": [
    "weakness description"
  ],
  "preparationStrategy": "detailed 1-2 paragraph preparation roadmap"
}`;
