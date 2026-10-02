export const SKILL_GAP_PROMPT = `You are an expert placement analyst. Analyze the following user scores and identify skill gaps.

User Scores:
- Resume Score: {resumeScore}/100
- Aptitude Score: {aptitudeScore}/100
- Coding Score: {codingScore}/100
- Interview Score: {interviewScore}/100
- Overall Readiness: {overallReadiness}/100

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "weakestSkill": "name of the weakest skill area",
  "weakestScore": number,
  "strongestSkill": "name of the strongest skill area",
  "strongestScore": number,
  "skillGaps": [
    { "skill": "skill name", "gap": "description of the gap", "priority": "high/medium/low" }
  ],
  "analysis": "2-3 sentence overall analysis of the user's skill profile"
}`;
