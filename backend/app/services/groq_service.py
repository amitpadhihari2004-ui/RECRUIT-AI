import json

from typing import Any, Dict, List

from groq import Groq
from fastapi import HTTPException

from app.config.groq import GROQ_API_KEY


# =========================================================
# GROQ CLIENT
# =========================================================

client = Groq(
    api_key=GROQ_API_KEY
)


class GroqService:

    # =====================================================
    # CLEAN GROQ JSON RESPONSE
    # =====================================================

    @staticmethod
    def _clean_json_response(
        response: str
    ) -> Any:

        if not response:

            raise ValueError(
                "Groq returned an empty response."
            )

        response = response.strip()

        # -------------------------------------------------
        # Remove Markdown code fences
        # -------------------------------------------------

        if response.startswith("```json"):

            response = response[
                len("```json"):
            ]

        elif response.startswith("```JSON"):

            response = response[
                len("```JSON"):
            ]

        elif response.startswith("```"):

            response = response[
                len("```"):
            ]

        if response.endswith("```"):

            response = response[:-3]

        response = response.strip()

        # -------------------------------------------------
        # Direct JSON
        # -------------------------------------------------

        try:

            return json.loads(
                response
            )

        except json.JSONDecodeError:

            pass

        # -------------------------------------------------
        # Extract JSON Array
        # -------------------------------------------------

        array_start = response.find("[")

        array_end = response.rfind("]")

        if (
            array_start != -1
            and array_end != -1
            and array_end > array_start
        ):

            array_text = response[
                array_start:
                array_end + 1
            ]

            try:

                return json.loads(
                    array_text
                )

            except json.JSONDecodeError:

                pass

        # -------------------------------------------------
        # Extract JSON Object
        # -------------------------------------------------

        object_start = response.find("{")

        object_end = response.rfind("}")

        if (
            object_start != -1
            and object_end != -1
            and object_end > object_start
        ):

            object_text = response[
                object_start:
                object_end + 1
            ]

            try:

                return json.loads(
                    object_text
                )

            except json.JSONDecodeError:

                pass

        raise ValueError(
            "Unable to parse Groq response as JSON."
        )

    # =====================================================
    # GENERIC GROQ JSON REQUEST
    # =====================================================

    @staticmethod
    def generate_json(
        prompt: str,
        system_message: str,
        model: str = "llama-3.1-8b-instant",
        temperature: float = 0,
        max_tokens: int = 4096
    ) -> Any:

        if not prompt:

            raise HTTPException(
                status_code=400,
                detail="Groq prompt is empty."
            )

        try:

            completion = (
                client.chat.completions.create(

                    model=model,

                    messages=[
                        {
                            "role": "system",
                            "content": system_message
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],

                    temperature=temperature,

                    max_tokens=max_tokens
                )
            )

        except Exception as e:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Groq API request failed: "
                    f"{str(e)}"
                )
            )

        # -------------------------------------------------
        # Get Response
        # -------------------------------------------------

        try:

            response = (
                completion
                .choices[0]
                .message
                .content
            )

        except Exception:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Groq returned an empty response."
                )
            )

        if not response:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Groq returned an empty response."
                )
            )

        response = response.strip()

        # -------------------------------------------------
        # Parse JSON
        # -------------------------------------------------

        try:

            return (
                GroqService
                ._clean_json_response(
                    response
                )
            )

        except ValueError as e:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Groq returned invalid JSON: "
                    f"{str(e)}"
                )
            )

    # =====================================================
    # SAFE LIST
    # =====================================================

    @staticmethod
    def _safe_list(
        value: Any
    ) -> List[Any]:

        if isinstance(
            value,
            list
        ):

            return value

        return []

    # =====================================================
    # SAFE STRING
    # =====================================================

    @staticmethod
    def _safe_string(
        value: Any
    ) -> str:

        if isinstance(
            value,
            str
        ):

            return value.strip()

        return ""

    # =====================================================
    # SAFE SCORE
    # =====================================================

    @staticmethod
    def _safe_score(
        value: Any,
        minimum: int = 0,
        maximum: int = 100
    ) -> int:

        try:

            score = int(
                float(value)
            )

        except (
            ValueError,
            TypeError
        ):

            score = 0

        return max(
            minimum,
            min(
                maximum,
                score
            )
        )

    # =====================================================
    # NORMALIZE SKILLS
    # =====================================================

    @staticmethod
    def _normalize_skills(
        skills: Any
    ) -> List[str]:

        if not isinstance(
            skills,
            list
        ):

            return []

        normalized = []

        seen = set()

        for skill in skills:

            if not isinstance(
                skill,
                str
            ):

                continue

            skill = skill.strip()

            if not skill:

                continue

            key = skill.lower()

            if key in seen:

                continue

            seen.add(key)

            normalized.append(
                skill
            )

        return normalized

    # =====================================================
    # RESUME ANALYSIS
    # =====================================================

    @staticmethod
    def analyze_resume(
        resume_text: str
    ) -> Dict[str, Any]:

        if (
            not resume_text
            or not resume_text.strip()
        ):

            raise HTTPException(
                status_code=400,
                detail="Resume text is empty."
            )

        # -------------------------------------------------
        # Normalize resume
        # -------------------------------------------------

        cleaned_text = " ".join(
            resume_text.split()
        ).strip()

        # -------------------------------------------------
        # Prompt
        # -------------------------------------------------

        prompt = f"""
You are Recruit AI's professional Resume Analysis Engine.

Analyze the candidate resume using a FIXED and CONSISTENT
evaluation methodology.

Your analysis must be deterministic and evidence-based.

==================================================
IMPORTANT RULES
==================================================

1. Analyze ONLY information actually present in the resume.

2. NEVER invent:
   - skills
   - education
   - experience
   - companies
   - projects
   - certifications
   - dates
   - achievements

3. Do not give marks because something sounds impressive.

4. Do not assume information that is not explicitly available.

5. Use the exact same scoring methodology every time.

6. Return ONLY valid JSON.

7. Do NOT return markdown.

8. Do NOT return explanations outside JSON.

9. Use whole numbers only for scores.

10. Do not evaluate:
   - gender
   - age
   - religion
   - nationality
   - photograph
   - name
   - other unrelated personal characteristics

==================================================
FIXED SCORING FRAMEWORK
==================================================

TOTAL = 100

Skills              = 25
Education           = 15
Experience          = 20
Projects            = 15
Certifications      = 10
Formatting          = 5
Communication       = 5
ATS Compatibility   = 5

==================================================
OUTPUT
==================================================

Return exactly:

{{
    "personal_information": {{
        "name": "",
        "email": "",
        "phone": "",
        "location": ""
    }},

    "skills": [],

    "soft_skills": [],

    "education": [],

    "experience": [],

    "projects": [],

    "certifications": [],

    "languages": [],

    "resume_summary": "",

    "strengths": [],

    "weaknesses": [],

    "missing_skills": [],

    "career_recommendations": [],

    "score_breakdown": {{
        "skills": 0,
        "education": 0,
        "experience": 0,
        "projects": 0,
        "certifications": 0,
        "formatting": 0,
        "communication": 0,
        "ats_compatibility": 0
    }},

    "resume_score": 0
}}

==================================================
RESUME
==================================================

{cleaned_text}
"""

        result = GroqService.generate_json(

            prompt=prompt,

            system_message=(
                "You are Recruit AI's deterministic "
                "professional ATS resume analyzer. "
                "Return ONLY valid JSON."
            ),

            model="llama-3.1-8b-instant",

            temperature=0,

            max_tokens=4096
        )

        if not isinstance(
            result,
            dict
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "Resume analysis must "
                    "be a JSON object."
                )
            )

        # -------------------------------------------------
        # Score breakdown
        # -------------------------------------------------

        breakdown = result.get(
            "score_breakdown",
            {}
        )

        if not isinstance(
            breakdown,
            dict
        ):

            breakdown = {}

        score_fields = [
            "skills",
            "education",
            "experience",
            "projects",
            "certifications",
            "formatting",
            "communication",
            "ats_compatibility"
        ]

        maximum_scores = {

            "skills": 25,

            "education": 15,

            "experience": 20,

            "projects": 15,

            "certifications": 10,

            "formatting": 5,

            "communication": 5,

            "ats_compatibility": 5
        }

        total = 0

        for field in score_fields:

            value = GroqService._safe_score(

                breakdown.get(
                    field,
                    0
                ),

                0,

                maximum_scores[field]
            )

            breakdown[field] = value

            total += value

        result["score_breakdown"] = (
            breakdown
        )

        # Always calculate final score
        # from the breakdown.

        result["resume_score"] = total

        # -------------------------------------------------
        # Personal information
        # -------------------------------------------------

        personal_information = (
            result.get(
                "personal_information",
                {}
            )
        )

        if not isinstance(
            personal_information,
            dict
        ):

            personal_information = {}

        result["personal_information"] = {

            "name":
                GroqService._safe_string(
                    personal_information.get(
                        "name"
                    )
                ),

            "email":
                GroqService._safe_string(
                    personal_information.get(
                        "email"
                    )
                ),

            "phone":
                GroqService._safe_string(
                    personal_information.get(
                        "phone"
                    )
                ),

            "location":
                GroqService._safe_string(
                    personal_information.get(
                        "location"
                    )
                )
        }

        # -------------------------------------------------
        # List fields
        # -------------------------------------------------

        list_fields = [

            "skills",

            "soft_skills",

            "education",

            "experience",

            "projects",

            "certifications",

            "languages",

            "strengths",

            "weaknesses",

            "missing_skills",

            "career_recommendations"
        ]

        for field in list_fields:

            result[field] = (
                GroqService._safe_list(
                    result.get(
                        field,
                        []
                    )
                )
            )

        # -------------------------------------------------
        # Skills
        # -------------------------------------------------

        result["skills"] = (
            GroqService._normalize_skills(
                result["skills"]
            )
        )

        result["soft_skills"] = (
            GroqService._normalize_skills(
                result["soft_skills"]
            )
        )

        result["missing_skills"] = (
            GroqService._normalize_skills(
                result["missing_skills"]
            )
        )

        # -------------------------------------------------
        # Summary
        # -------------------------------------------------

        result["resume_summary"] = (
            GroqService._safe_string(
                result.get(
                    "resume_summary"
                )
            )
        )

        return result

    # =====================================================
    # JOB RECOMMENDATION
    # =====================================================

    @staticmethod
    def recommend_jobs(
        resume_analysis,
        jobs,
        limit=5
    ) -> List[Dict[str, Any]]:

        if not isinstance(
            resume_analysis,
            dict
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid resume analysis."
            )

        if not isinstance(
            jobs,
            list
        ):

            raise HTTPException(
                status_code=400,
                detail="Invalid jobs data."
            )

        if not jobs:

            return []

        try:

            limit = int(
                limit
            )

        except (
            ValueError,
            TypeError
        ):

            limit = 5

        limit = max(
            1,
            min(
                10,
                limit
            )
        )

        # -------------------------------------------------
        # Candidate
        # -------------------------------------------------

        resume_data = {

            "skills":
                GroqService._normalize_skills(
                    resume_analysis.get(
                        "skills",
                        []
                    )
                ),

            "soft_skills":
                GroqService._normalize_skills(
                    resume_analysis.get(
                        "soft_skills",
                        []
                    )
                ),

            "education":
                GroqService._safe_list(
                    resume_analysis.get(
                        "education",
                        []
                    )
                ),

            "experience":
                GroqService._safe_list(
                    resume_analysis.get(
                        "experience",
                        []
                    )
                ),

            "projects":
                GroqService._safe_list(
                    resume_analysis.get(
                        "projects",
                        []
                    )
                ),

            "certifications":
                GroqService._safe_list(
                    resume_analysis.get(
                        "certifications",
                        []
                    )
                ),

            "missing_skills":
                GroqService._normalize_skills(
                    resume_analysis.get(
                        "missing_skills",
                        []
                    )
                ),

            "career_recommendations":
                GroqService._safe_list(
                    resume_analysis.get(
                        "career_recommendations",
                        []
                    )
                )
        }

        # -------------------------------------------------
        # Jobs
        # -------------------------------------------------

        jobs_data = []

        for job in jobs:

            if not isinstance(
                job,
                dict
            ):

                continue

            job_id = str(
                job.get(
                    "job_id",
                    ""
                )
            ).strip()

            if not job_id:

                continue

            jobs_data.append({

                "job_id":
                    job_id,

                "title":
                    job.get(
                        "title",
                        ""
                    ),

                "department":
                    job.get(
                        "department",
                        ""
                    ),

                "location":
                    job.get(
                        "location",
                        ""
                    ),

                "employment_type":
                    job.get(
                        "employment_type",
                        ""
                    ),

                "experience_required":
                    job.get(
                        "experience_required",
                        ""
                    ),

                "salary":
                    job.get(
                        "salary",
                        ""
                    ),

                "description":
                    job.get(
                        "description",
                        ""
                    ),

                "skills":
                    GroqService._normalize_skills(
                        job.get(
                            "skills",
                            []
                        )
                    ),

                "requirements":
                    GroqService._safe_list(
                        job.get(
                            "requirements",
                            []
                        )
                    )
            })

        if not jobs_data:

            return []

        prompt = f"""
You are Recruit AI's professional AI Job Recommendation Engine.

Compare the candidate's analyzed resume with the available jobs.

IMPORTANT:

- Return ONLY valid JSON.
- Never invent jobs.
- Only use provided job_id values.
- Never invent candidate skills.
- Do not recommend unrelated jobs.
- Maximum {limit} recommendations.
- Sort highest score first.
- No duplicate job IDs.

MATCHING FRAMEWORK:

Skills Match          = 40%
Experience Relevance  = 20%
Projects Relevance    = 15%
Education Relevance   = 10%
Requirements Match    = 10%
Career Direction      = 5%

Total = 100%

Score:

90-100 = Excellent
80-89  = Strong
70-79  = Good
60-69  = Moderate
0-59   = Weak

==================================================
CANDIDATE PROFILE
==================================================

{json.dumps(
    resume_data,
    ensure_ascii=False
)}

==================================================
AVAILABLE JOBS
==================================================

{json.dumps(
    jobs_data,
    ensure_ascii=False
)}

==================================================
OUTPUT
==================================================

Return ONLY:

[
    {{
        "job_id": "EXACT_JOB_ID",
        "match_score": 85,
        "matched_skills": [],
        "missing_skills": [],
        "recommendation_reason": ""
    }}
]
"""

        result = GroqService.generate_json(

            prompt=prompt,

            system_message=(
                "You are Recruit AI's objective "
                "job recommendation engine. "
                "Return ONLY valid JSON."
            ),

            model="llama-3.1-8b-instant",

            temperature=0,

            max_tokens=4096
        )

        if not isinstance(
            result,
            list
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "Groq recommendation response "
                    "must be a JSON array."
                )
            )

        valid_job_ids = {

            str(
                job["job_id"]
            )

            for job in jobs_data
        }

        recommendations = []

        seen_job_ids = set()

        for item in result:

            if not isinstance(
                item,
                dict
            ):

                continue

            job_id = str(
                item.get(
                    "job_id",
                    ""
                )
            ).strip()

            if job_id not in valid_job_ids:

                continue

            if job_id in seen_job_ids:

                continue

            seen_job_ids.add(
                job_id
            )

            match_score = (
                GroqService._safe_score(
                    item.get(
                        "match_score",
                        0
                    )
                )
            )

            matched_skills = (
                GroqService._normalize_skills(
                    item.get(
                        "matched_skills",
                        []
                    )
                )
            )

            missing_skills = (
                GroqService._normalize_skills(
                    item.get(
                        "missing_skills",
                        []
                    )
                )
            )

            reason = (
                GroqService._safe_string(
                    item.get(
                        "recommendation_reason",
                        ""
                    )
                )
            )

            recommendations.append({

                "job_id":
                    job_id,

                "match_score":
                    match_score,

                "matched_skills":
                    matched_skills,

                "missing_skills":
                    missing_skills,

                "recommendation_reason":
                    reason
            })

        recommendations.sort(

            key=lambda x:
                x["match_score"],

            reverse=True
        )

        return recommendations[:limit]

    # =====================================================
    # INTERVIEW AI JSON
    # =====================================================
    #
    # Shared method for:
    #
    # InterviewQuestionService
    # InterviewEvaluationService
    #
    # =====================================================

    @staticmethod
    def interview_json(
        prompt: str,
        temperature: float = 0.2,
        max_tokens: int = 4096
    ) -> Any:

        return GroqService.generate_json(

            prompt=prompt,

            system_message=(
                "You are Recruit AI's professional "
                "AI Interview Engine. "
                "Return ONLY valid JSON. "
                "Do not return Markdown."
            ),

            model="llama-3.3-70b-versatile",

            temperature=temperature,

            max_tokens=max_tokens
        )



