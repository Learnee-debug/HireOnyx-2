const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize once at module level
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

exports.analyzeResume = async (req, res) => {
  try {
    const { resume_text, job_title, job_description, requirements, skills_required } = req.body;

    // Input validation
    if (!resume_text?.trim() || !job_title?.trim() || !job_description?.trim()) {
      return res.status(400).json({ success: false, error: 'resume_text, job_title, and job_description are required.' });
    }

    // Guard against excessively long inputs
    if (resume_text.length > 15000) {
      return res.status(400).json({ success: false, error: 'Resume text is too long. Max 15,000 characters.' });
    }

    const skillsList = Array.isArray(skills_required)
      ? skills_required.join(', ')
      : (typeof skills_required === 'string' ? skills_required : '');

    const prompt = `You are an expert technical recruiter. Analyze this resume against the job.
Respond ONLY with valid JSON. No markdown. No backticks. No explanation outside the JSON.

Required JSON structure (strictly follow this):
{
  "match_score": <integer 0-100>,
  "strengths": [<exactly 3 short strings, each under 60 chars>],
  "gaps": [<exactly 3 short strings, each under 60 chars>],
  "recommendation": "<one concise sentence under 120 chars>"
}

JOB TITLE: ${job_title}

JOB DESCRIPTION:
${job_description.slice(0, 2000)}

REQUIREMENTS:
${(requirements || '').slice(0, 1000)}

REQUIRED SKILLS: ${skillsList}

CANDIDATE RESUME:
${resume_text.slice(0, 8000)}`;

    const result = await model.generateContent(prompt);

    // Null check on response
    const text = result?.response?.text?.();
    if (!text) {
      throw new Error('Empty response from AI model');
    }

    // Strip markdown code fences if present
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      // Try to extract JSON from the text
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Validate response shape
    if (typeof parsed.match_score !== 'number' || !Array.isArray(parsed.strengths) || !Array.isArray(parsed.gaps)) {
      throw new Error('AI response has unexpected structure');
    }

    return res.json({ success: true, data: parsed });
  } catch (err) {
    console.error('AI analyze error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to analyze resume. Please try again.' });
  }
};
