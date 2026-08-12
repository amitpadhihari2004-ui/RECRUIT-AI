import json
from typing import Dict, Any, List, Optional

from fastapi import HTTPException, status

from app.services.groq_service import GroqService


class InterviewQuestionService:
    """
    Recruit AI Interview Question Service.

    Supports two modes:

    1. Initial question-set generation
       --------------------------------
       Generates 10 questions:

       Technical   -> 1-5
       HR          -> 6-8
       Behavioral  -> 9-10

    2. Adaptive interview generation
       --------------------------------
       Generates ONE question at a time based on:

       - Candidate resume
       - Job description
       - Interview type
       - Previous questions
       - Previous answers
       - Previous scores
       - Current question number

    The adaptive mode is intended for the real-time
    AI interview flow.
    """

    TOTAL_QUESTIONS = 10

    # =========================================================
    # SAFE DICT
    # =========================================================

    @staticmethod
    def _safe_dict(value: Any) -> dict:

        if isinstance(value, dict):
            return value

        return {}

    # =========================================================
    # SAFE STRING
    # =========================================================

    @staticmethod
    def _safe_string(
        value: Any,
        default: str = ""
    ) -> str:

        if value is None:
            return default

        value = str(value).strip()

        return value if value else default

    # =========================================================
    # NORMALIZE SKILLS
    # =========================================================

    @staticmethod
    def _normalize_skills(
        skills: Any
    ) -> str:

        if isinstance(skills, list):

            values = []

            for skill in skills:

                if skill is None:
                    continue

                text = str(skill).strip()

                if text:
                    values.append(text)

            return ", ".join(values)

        return str(skills or "").strip()

    # =========================================================
    # NORMALIZE REQUIREMENTS
    # =========================================================

    @staticmethod
    def _normalize_requirements(
        requirements: Any
    ) -> str:

        if isinstance(requirements, list):

            values = []

            for requirement in requirements:

                if requirement is None:
                    continue

                text = str(requirement).strip()

                if text:
                    values.append(
                        f"- {text}"
                    )

            return "\n".join(values)

        return str(
            requirements or ""
        ).strip()

    # =========================================================
    # JOB CONTEXT
    # =========================================================

    @staticmethod
    def _build_job_context(
        job: dict
    ) -> Dict[str, str]:

        job = (
            InterviewQuestionService
            ._safe_dict(job)
        )

        return {

            "title":
                InterviewQuestionService
                ._safe_string(
                    job.get("title"),
                    "Not specified"
                ),

            "department":
                InterviewQuestionService
                ._safe_string(
                    job.get("department"),
                    "Not specified"
                ),

            "experience":
                InterviewQuestionService
                ._safe_string(
                    job.get(
                        "experience_required",
                        job.get("experience")
                    ),
                    "Not specified"
                ),

            "skills":
                InterviewQuestionService
                ._normalize_skills(
                    job.get(
                        "skills",
                        []
                    )
                ),

            "requirements":
                InterviewQuestionService
                ._normalize_requirements(
                    job.get(
                        "requirements",
                        []
                    )
                ),

            "description":
                InterviewQuestionService
                ._safe_string(
                    job.get("description"),
                    "Not specified"
                )
        }

    # =========================================================
    # GENERATE COMPLETE QUESTION SET
    #
    # EXISTING / COMPATIBILITY METHOD
    # =========================================================

    @staticmethod
    def generate_questions(
        resume_analysis: dict,
        job: dict,
        interview_type: str = "Technical"
    ) -> Dict[str, Any]:

        # =====================================================
        # SAFE INPUTS
        # =====================================================

        resume_analysis = (
            InterviewQuestionService
            ._safe_dict(
                resume_analysis
            )
        )

        job = (
            InterviewQuestionService
            ._safe_dict(job)
        )

        interview_type = (
            InterviewQuestionService
            ._safe_string(
                interview_type,
                "Technical"
            )
        )

        # =====================================================
        # JOB CONTEXT
        # =====================================================

        job_context = (
            InterviewQuestionService
            ._build_job_context(job)
        )

        # =====================================================
        # RESUME
        # =====================================================

        resume_text = json.dumps(
            resume_analysis,
            indent=2,
            ensure_ascii=False,
            default=str
        )

        # =====================================================
        # PROMPT
        # =====================================================

        prompt = f"""
You are Recruit AI's Expert AI Interviewer.

Create a professional and personalized interview
question set for a candidate.

The questions must be based on:

1. Candidate resume analysis
2. Job information
3. Interview type

Do not evaluate protected or irrelevant personal
characteristics.

============================================================
INTERVIEW TYPE
============================================================

{interview_type}

============================================================
JOB
============================================================

Title:
{job_context["title"]}

Department:
{job_context["department"]}

Experience:
{job_context["experience"]}

Skills:
{job_context["skills"]}

Requirements:
{job_context["requirements"]}

Description:
{job_context["description"]}

============================================================
RESUME ANALYSIS
============================================================

{resume_text}

============================================================
QUESTION STRUCTURE
============================================================

Generate exactly 10 questions.

Technical:
5 questions

HR:
3 questions

Behavioral:
2 questions

Technical IDs:
1-5

HR IDs:
6-8

Behavioral IDs:
9-10

============================================================
TECHNICAL
============================================================

Technical questions must:

- Match the job.
- Match resume skills where relevant.
- Test actual technical knowledge.
- Test practical implementation.
- Test debugging.
- Test problem solving.
- Include realistic scenarios.
- Progress from moderate to difficult.

Do not ask unrelated technologies.

============================================================
HR
============================================================

Evaluate:

- Motivation
- Interest in role
- Career goals
- Professional expectations
- Communication
- Team compatibility

Do not ask protected-personal questions.

============================================================
BEHAVIORAL
============================================================

Evaluate:

- Problem solving
- Teamwork
- Adaptability
- Conflict handling
- Decision making
- Leadership
- Handling pressure

Prefer realistic scenarios.

============================================================
IMPORTANT
============================================================

Do not generate answers.

Do not generate explanations.

Do not use:

- Gender
- Religion
- Caste
- Race
- Nationality
- Age
- Photograph
- Name
- Protected characteristics

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

{{
    "technical_questions": [
        {{
            "question_id": 1,
            "question": ""
        }},
        {{
            "question_id": 2,
            "question": ""
        }},
        {{
            "question_id": 3,
            "question": ""
        }},
        {{
            "question_id": 4,
            "question": ""
        }},
        {{
            "question_id": 5,
            "question": ""
        }}
    ],

    "hr_questions": [
        {{
            "question_id": 6,
            "question": ""
        }},
        {{
            "question_id": 7,
            "question": ""
        }},
        {{
            "question_id": 8,
            "question": ""
        }}
    ],

    "behavioral_questions": [
        {{
            "question_id": 9,
            "question": ""
        }},
        {{
            "question_id": 10,
            "question": ""
        }}
    ]
}}
"""

        # =====================================================
        # CALL GROQ
        # =====================================================

        try:

            questions = (
                GroqService
                .interview_json(
                    prompt=prompt,
                    temperature=0.2,
                    max_tokens=4096
                )
            )

        except HTTPException:
            raise

        except Exception as e:

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Failed to generate interview "
                    f"questions: {str(e)}"
                )
            )

        # =====================================================
        # VALIDATE
        # =====================================================

        return (
            InterviewQuestionService
            ._validate_question_set(
                questions
            )
        )

    # =========================================================
    # ADAPTIVE NEXT QUESTION
    # =========================================================

    @staticmethod
    def generate_next_question(
        resume_analysis: dict,
        job: dict,
        interview_type: str,
        question_number: int,
        previous_questions: Optional[List[Dict[str, Any]]] = None,
        previous_answers: Optional[List[Dict[str, Any]]] = None,
        previous_scores: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Generate ONE interview question dynamically.

        The next question is based on the candidate's
        previous performance.

        Example:

        Question 1
             ↓
        Candidate answer
             ↓
        AI evaluates answer
             ↓
        Question 2 generated
             ↓
        Candidate answer
             ↓
        AI evaluates answer
             ↓
        Question 3 generated
             ↓
        ...

        This creates an adaptive interview instead of
        displaying a fixed question list.
        """

        # =====================================================
        # VALIDATE QUESTION NUMBER
        # =====================================================

        try:

            question_number = int(
                question_number
            )

        except (
            TypeError,
            ValueError
        ):

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Invalid interview question number."
                )
            )

        if (
            question_number < 1
            or question_number > 10
        ):

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Question number must be between "
                    "1 and 10."
                )
            )

        # =====================================================
        # SAFE INPUTS
        # =====================================================

        resume_analysis = (
            InterviewQuestionService
            ._safe_dict(
                resume_analysis
            )
        )

        job = (
            InterviewQuestionService
            ._safe_dict(job)
        )

        interview_type = (
            InterviewQuestionService
            ._safe_string(
                interview_type,
                "Technical"
            )
        )

        previous_questions = (
            previous_questions
            if isinstance(
                previous_questions,
                list
            )
            else []
        )

        previous_answers = (
            previous_answers
            if isinstance(
                previous_answers,
                list
            )
            else []
        )

        previous_scores = (
            previous_scores
            if isinstance(
                previous_scores,
                list
            )
            else []
        )

        # =====================================================
        # JOB CONTEXT
        # =====================================================

        job_context = (
            InterviewQuestionService
            ._build_job_context(job)
        )

        # =====================================================
        # RESUME
        # =====================================================

        resume_text = json.dumps(
            resume_analysis,
            indent=2,
            ensure_ascii=False,
            default=str
        )

        # =====================================================
        # PREVIOUS QUESTIONS
        # =====================================================

        previous_questions_text = json.dumps(
            previous_questions,
            indent=2,
            ensure_ascii=False,
            default=str
        )

        # =====================================================
        # PREVIOUS ANSWERS
        # =====================================================

        previous_answers_text = json.dumps(
            previous_answers,
            indent=2,
            ensure_ascii=False,
            default=str
        )

        # =====================================================
        # PREVIOUS SCORES
        # =====================================================

        previous_scores_text = json.dumps(
            previous_scores,
            indent=2,
            ensure_ascii=False,
            default=str
        )

        # =====================================================
        # DETERMINE CATEGORY
        # =====================================================

        if question_number <= 5:

            category = "Technical"

        elif question_number <= 8:

            category = "HR"

        else:

            category = "Behavioral"

        # =====================================================
        # ADAPTIVE DIFFICULTY
        # =====================================================

        difficulty_instruction = """
Start with moderate difficulty.
"""

        if previous_scores:

            numeric_scores = []

            for score_item in previous_scores:

                if not isinstance(
                    score_item,
                    dict
                ):
                    continue

                score = (
                    score_item.get("score")
                )

                try:
                    score = float(score)
                    numeric_scores.append(
                        score
                    )
                except (
                    TypeError,
                    ValueError
                ):
                    continue

            if numeric_scores:

                average_score = (
                    sum(numeric_scores)
                    / len(numeric_scores)
                )

                if average_score >= 8:

                    difficulty_instruction = """
The candidate is performing strongly.

Increase the difficulty.

Ask a deeper, more practical,
scenario-based question.

Test advanced understanding and
problem solving.
"""

                elif average_score <= 4:

                    difficulty_instruction = """
The candidate is struggling.

Keep the next question moderate
and focused on fundamental
job-related understanding.

Do not make the question unnecessarily
difficult.
"""

                else:

                    difficulty_instruction = """
The candidate has moderate performance.

Maintain moderate difficulty while
testing practical understanding.
"""

        # =====================================================
        # FIRST QUESTION
        # =====================================================

        if question_number == 1:

            first_question_instruction = """
This is the first question.

There are no previous answers.

Start with a relevant moderate-level
question that establishes the candidate's
technical understanding.
"""

        else:

            first_question_instruction = """
This is not the first question.

Use the candidate's previous answers
and scores to determine what should
be tested next.
"""

        # =====================================================
        # PROMPT
        # =====================================================

        prompt = f"""
You are Recruit AI's live adaptive AI interviewer.

You are conducting a REAL interview.

Generate exactly ONE question.

Do NOT return a list of questions.

Do NOT return answers.

Do NOT return explanations.

============================================================
CURRENT INTERVIEW
============================================================

Interview Type:
{interview_type}

Question Number:
{question_number} / 10

Question Category:
{category}

{first_question_instruction}

============================================================
JOB
============================================================

Job Title:
{job_context["title"]}

Department:
{job_context["department"]}

Required Experience:
{job_context["experience"]}

Required Skills:
{job_context["skills"]}

Requirements:
{job_context["requirements"]}

Job Description:
{job_context["description"]}

============================================================
CANDIDATE RESUME
============================================================

{resume_text}

Use the resume only for professional,
job-related context.

============================================================
PREVIOUS QUESTIONS
============================================================

{previous_questions_text}

============================================================
PREVIOUS ANSWERS
============================================================

{previous_answers_text}

============================================================
PREVIOUS SCORES
============================================================

{previous_scores_text}

============================================================
ADAPTIVE INTERVIEW RULE
============================================================

{difficulty_instruction}

The next question should be informed by
the candidate's previous performance.

If the candidate demonstrated strong
knowledge in a topic, go deeper.

If the candidate demonstrated weak
knowledge, test the fundamentals or
move to another relevant area.

Do not repeatedly ask the same question.

Do not repeat questions from the
previous-question list.

============================================================
CATEGORY RULES
============================================================

TECHNICAL QUESTIONS

When category is Technical:

- Focus on job-required technologies.
- Use resume technologies where relevant.
- Test practical knowledge.
- Test debugging.
- Test implementation.
- Test architecture where appropriate.
- Test problem solving.
- Prefer realistic scenarios.
- Do not ask irrelevant technologies.

HR QUESTIONS

When category is HR:

Focus on:

- Motivation
- Interest in the role
- Career goals
- Professional expectations
- Communication
- Team compatibility

Do not ask protected personal questions.

BEHAVIORAL QUESTIONS

When category is Behavioral:

Focus on:

- Problem solving
- Teamwork
- Conflict handling
- Adaptability
- Leadership
- Decision making
- Handling pressure

Prefer realistic scenarios.

============================================================
FAIRNESS
============================================================

Never generate questions based on:

- Gender
- Religion
- Caste
- Race
- Nationality
- Age
- Photograph
- Name
- Disability
- Other protected characteristics

============================================================
QUESTION QUALITY
============================================================

The question must be:

- Relevant
- Clear
- Professional
- Unique
- Interview-ready
- Job-related
- Appropriate for the candidate's performance

Avoid:

- Trivia
- Unrelated technologies
- Repeated questions
- Extremely vague questions
- Protected-personal questions

============================================================
STRICT OUTPUT
============================================================

Return ONLY valid JSON.

The output must contain exactly:

{{
    "question_id": {question_number},
    "category": "{category}",
    "question": "",
    "difficulty": "",
    "topic": ""
}}

Rules:

- question_id MUST be {question_number}
- category MUST be "{category}"
- question MUST contain exactly one interview question
- difficulty should be one of:
  "Easy", "Medium", "Hard"
- topic should identify the technical/professional topic
- No additional fields
- No Markdown
- No ```json
- No explanation
"""

        # =====================================================
        # CALL GROQ
        # =====================================================

        try:

            result = (
                GroqService
                .interview_json(
                    prompt=prompt,
                    temperature=0.35,
                    max_tokens=1000
                )
            )

        except HTTPException:
            raise

        except Exception as e:

            raise HTTPException(
                status_code=(
                    status.HTTP_500_INTERNAL_SERVER_ERROR
                ),
                detail=(
                    "Failed to generate the next "
                    f"interview question: {str(e)}"
                )
            )

        # =====================================================
        # VALIDATE RESULT
        # =====================================================

        if not isinstance(
            result,
            dict
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "Invalid next interview "
                    "question returned by AI."
                )
            )

        # =====================================================
        # QUESTION ID
        # =====================================================

        returned_id = result.get(
            "question_id"
        )

        try:

            returned_id = int(
                returned_id
            )

        except (
            TypeError,
            ValueError
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI returned an invalid "
                    "question_id."
                )
            )

        if returned_id != question_number:

            raise HTTPException(
                status_code=500,
                detail=(
                    f"AI returned question ID "
                    f"{returned_id}, expected "
                    f"{question_number}."
                )
            )

        # =====================================================
        # CATEGORY
        # =====================================================

        returned_category = (
            str(
                result.get(
                    "category",
                    ""
                )
            ).strip()
        )

        if returned_category.lower() != (
            category.lower()
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    f"AI returned incorrect "
                    f"question category."
                )
            )

        # =====================================================
        # QUESTION TEXT
        # =====================================================

        question_text = result.get(
            "question"
        )

        if not isinstance(
            question_text,
            str
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI returned invalid "
                    "question text."
                )
            )

        question_text = (
            question_text.strip()
        )

        if not question_text:

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI returned an empty "
                    "interview question."
                )
            )

        # =====================================================
        # DIFFICULTY
        # =====================================================

        difficulty = (
            str(
                result.get(
                    "difficulty",
                    "Medium"
                )
            ).strip()
        )

        allowed_difficulties = {
            "easy",
            "medium",
            "hard"
        }

        if (
            difficulty.lower()
            not in allowed_difficulties
        ):

            difficulty = "Medium"

        # Normalize display value

        difficulty = (
            difficulty.capitalize()
        )

        # =====================================================
        # TOPIC
        # =====================================================

        topic = (
            str(
                result.get(
                    "topic",
                    "General"
                )
            ).strip()
        )

        if not topic:

            topic = "General"

        # =====================================================
        # FINAL RESULT
        # =====================================================

        return {

            "question_id":
                question_number,

            "category":
                category,

            "question":
                question_text,

            "difficulty":
                difficulty,

            "topic":
                topic
        }

    # =========================================================
    # VALIDATE COMPLETE QUESTION SET
    # =========================================================

    @staticmethod
    def _validate_question_set(
        questions: Any
    ) -> Dict[str, Any]:

        # =====================================================
        # ROOT
        # =====================================================

        if not isinstance(
            questions,
            dict
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "Invalid interview question "
                    "format returned by AI."
                )
            )

        # =====================================================
        # REQUIRED CATEGORIES
        # =====================================================

        required_categories = [

            "technical_questions",

            "hr_questions",

            "behavioral_questions"
        ]

        for category in required_categories:

            if category not in questions:

                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"AI response missing "
                        f"{category}."
                    )
                )

            if not isinstance(
                questions[category],
                list
            ):

                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"{category} must be "
                        "a list."
                    )
                )

        # =====================================================
        # COUNTS
        # =====================================================

        expected_counts = {

            "technical_questions": 5,

            "hr_questions": 3,

            "behavioral_questions": 2
        }

        for (
            category,
            expected_count
        ) in expected_counts.items():

            actual_count = len(
                questions[category]
            )

            if actual_count != (
                expected_count
            ):

                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"AI generated "
                        f"{actual_count} "
                        f"{category.replace('_', ' ')}. "
                        f"Expected "
                        f"{expected_count}."
                    )
                )

        # =====================================================
        # EXPECTED IDS
        # =====================================================

        expected_category_ids = {

            "technical_questions":
                set(range(1, 6)),

            "hr_questions":
                set(range(6, 9)),

            "behavioral_questions":
                set(range(9, 11))
        }

        # =====================================================
        # TRACK DUPLICATES
        # =====================================================

        all_question_ids = set()

        all_question_texts = set()

        # =====================================================
        # VALIDATE
        # =====================================================

        for category in required_categories:

            category_ids = set()

            for item in questions[category]:

                if not isinstance(
                    item,
                    dict
                ):

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            "Invalid interview "
                            "question object."
                        )
                    )

                # -------------------------------------------------
                # ID
                # -------------------------------------------------

                question_id = item.get(
                    "question_id"
                )

                if question_id is None:

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            "AI generated a question "
                            "without question_id."
                        )
                    )

                try:

                    question_id = int(
                        question_id
                    )

                except (
                    TypeError,
                    ValueError
                ):

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            "AI generated an invalid "
                            "question_id."
                        )
                    )

                # -------------------------------------------------
                # TEXT
                # -------------------------------------------------

                question_text = item.get(
                    "question"
                )

                if not isinstance(
                    question_text,
                    str
                ):

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Question "
                            f"{question_id} "
                            "must be a string."
                        )
                    )

                question_text = (
                    question_text.strip()
                )

                if not question_text:

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Question "
                            f"{question_id} "
                            "is empty."
                        )
                    )

                # -------------------------------------------------
                # CATEGORY ID
                # -------------------------------------------------

                if question_id not in (
                    expected_category_ids[
                        category
                    ]
                ):

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            f"Invalid question_id "
                            f"{question_id} for "
                            f"{category}."
                        )
                    )

                # -------------------------------------------------
                # DUPLICATE ID
                # -------------------------------------------------

                if question_id in (
                    all_question_ids
                ):

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            "AI generated duplicate "
                            "question IDs."
                        )
                    )

                # -------------------------------------------------
                # DUPLICATE TEXT
                # -------------------------------------------------

                normalized_text = (
                    " ".join(
                        question_text
                        .lower()
                        .split()
                    )
                )

                if normalized_text in (
                    all_question_texts
                ):

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            "AI generated duplicate "
                            "interview questions."
                        )
                    )

                # -------------------------------------------------
                # STORE
                # -------------------------------------------------

                all_question_ids.add(
                    question_id
                )

                all_question_texts.add(
                    normalized_text
                )

                category_ids.add(
                    question_id
                )

                # -------------------------------------------------
                # NORMALIZE
                # -------------------------------------------------

                item["question_id"] = (
                    question_id
                )

                item["question"] = (
                    question_text
                )

            # -------------------------------------------------
            # CATEGORY IDs
            # -------------------------------------------------

            if category_ids != (
                expected_category_ids[
                    category
                ]
            ):

                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"Invalid question IDs "
                        f"for {category}."
                    )
                )

        # =====================================================
        # FINAL IDS
        # =====================================================

        if all_question_ids != set(
            range(1, 11)
        ):

            raise HTTPException(
                status_code=500,
                detail=(
                    "AI question IDs must contain "
                    "exactly 1 to 10."
                )
            )

        # =====================================================
        # RETURN
        # =====================================================

        return {

            "technical_questions":
                questions[
                    "technical_questions"
                ],

            "hr_questions":
                questions[
                    "hr_questions"
                ],

            "behavioral_questions":
                questions[
                    "behavioral_questions"
                ]
        }