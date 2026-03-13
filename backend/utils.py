from google import genai
from config import Config

# Create a sync client for the Gemini Developer API
client = genai.Client(api_key=Config.GEMINI_KEY)

def analyze_job_fit(job_title, job_desc, resume_content):
    """
    Analyzes job fit for a TY WCE student targeting 25 LPA+ offers.
    Focuses on Diversity Hiring, WCE Alumni presence, and high-ticket salary data.
    """
    
    prompt = f"""
    Context: Female CSE Student, 3rd Year (TY), Walchand College of Engineering (WCE).
    Target: Summer 2026 Internship leading to a 25 LPA+ Full-time Role.

    Role: {job_title}
    Job Description: {job_desc[:2000]}
    User Resume (LaTeX/Text): {resume_content[:1500]}

    Instructions for Analysis:
    1. DIVERSITY HIRING: Identify if this company has specific tracks for women in tech (e.g., Microsoft Codess, Amazon WoW, Adobe SheCodes, etc.).
    2. SALARY BENCHMARK: Estimate if the full-time CTC for this role is in the 15-25+ LPA bracket for India-based roles (Pune/Bangalore/Remote).
    3. WCE ALUMNI: Mention if this company is a frequent recruiter at WCE or has a strong WCE alumni base.
    4. RESUME UPGRADES: Provide 3 high-impact bullet points (plain text, no LaTeX code) that highlight System Design, Scalability, or advanced DSA relevant to this specific JD.
    5. SUMMER ALIGNMENT: Verify if the internship timeline (May-July 2026) fits the academic break.
    6. STARTUP POTENTIAL: Identify if this is a high-growth startup (Series A-C stage, funded, 50-500 employees) in India's ecosystem. Look for indicators like YCombinator, Elevation Capital, Accel, Sequoia backing and domains like fintech, deeptech, SaaS, edtech, or AI/ML.

    Return ONLY a valid JSON object with this structure:
    {{
      "score": 0-100,
      "is_summer_role": true/false,
      "is_startup": true/false,
      "avg_offer": "e.g., 22-28 LPA CTC",
      "company_insight": "Insight on work culture, diversity tracks, WCE presence, and startup stage.",
      "resume_points": ["Point 1", "Point 2", "Point 3"],
      "justification": "Why this matches a 25LPA+ goal for a WCE student.",
      "fit_level": "Excellent/Good/Average/Poor"
    }}
    """
    
    try:
        # Generate content using the official client
        response = client.models.generate_content(
            model='gemini-2.5-flash-lite',
            contents=prompt
        )

        # The SDK exposes the final text via `response.text`
        text = getattr(response, 'text', str(response))
        clean_json = text.replace('```json', '').replace('```', '').strip()
        return clean_json
        
    except Exception as e:
        # Fallback in case of API failure or Rate Limits
        print(f"     Gemini API Error: {e}")
        return '{"score": 0, "company_insight": "Error analyzing job.", "resume_points": []}'