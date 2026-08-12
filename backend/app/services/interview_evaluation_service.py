import json
from typing import List, Dict, Any

from fastapi import HTTPException, status

from app.services.groq_service import GroqService


class InterviewEvaluationService:
    """
    AI Interview Evaluation Service.

    Evaluates:
        - Individual question answers
        - Technical performance
        - Communication
        - Confidence
        - Overall performance
        - Strengths
        - Weaknesses
        - Recommendations

    Individual question score:
        0 - 10

    Overall scores:
        0 - 100
    """

    # =========================================================
    # SAFE SCORE
    # =========================================================

    @staticmethod
    def _safe_score(
        value: Any,
        minimum: float = 0,
        maximum: float = 100
    ) -> float:

        try:
            score = float(value)

        except (
            TypeError,
            ValueError
        ):

            score = 0

        return max(
            minimum,
            min(
                maximum,
                score
            )
        )

    # =========================================================
    # SAFE LIST
    # =========================================================

    @staticmethod
    def _safe_list(
        value: Any
    ) -> List[str]:

        if not isinstance(
            value,
            list
        ):

            return []

        return [
            str(item).strip()
            for item in value
            if item is not None
            and str(item).strip()
        ]

    # =========================================================
    # NORMALIZE QUESTIONS
    # =========================================================

    @staticmethod
    def _normalize_questions(
        questions: Any
    ) -> List[Dict[str, Any]]:

        if not isinstance(
            questions,
            list
        ):

            return []

        normalized_questions = []

        seen_ids = set()

        for question in questions:

            if not isinstance(
                question,
                dict
            ):

                continue

            question_id = question.get(
                "question_id"
            )

            question_text = question.get(
                "question"
            )

            if question_id is None:

                continue

            if not question_text:

                continue

            try:

                question_id = int(
                    question_id
                )

            except (
                TypeError,
                ValueError
            ):

                continue

            if question_id in seen_ids:

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Duplicate interview "
                        f"question ID: {question_id}."
                    )
                )

            question_text = str(
                question_text
            ).strip()

            if not question_text:

                continue

            seen_ids.add(
                question_id
            )

            normalized_questions.append(
                {
                    "question_id":
                        question_id,

                    "question":
                        question_text
                }
            )

        return normalized_questions

    # =========================================================
    # NORMALIZE ANSWERS
    # =========================================================

    @staticmethod
    def _normalize_answers(
        answers: Any
    ) -> List[Dict[str, Any]]:

        if not isinstance(
            answers,
            list
        ):

            return []

        normalized_answers = []

        seen_ids = set()

        for answer in answers:

            # -------------------------------------------------
            # PYDANTIC MODEL
            # -------------------------------------------------

            if hasattr(
                answer,
                "model_dump"
            ):

                answer = (
                    answer.model_dump()
                )

            # -------------------------------------------------
            # DICTIONARY
            # -------------------------------------------------

            elif isinstance(
                answer,
                dict
            ):

                answer = dict(
                    answer
                )

            else:

                continue

            question_id = answer.get(
                "question_id"
            )

            answer_text = (
                answer.get(
                    "answer"
                )
                or answer.get(
                    "response"
                )
                or answer.get(
                    "text"
                )
                or ""
            )

            try:

                question_id = int(
                    question_id
                )

            except (
                TypeError,
                ValueError
            ):

                continue

            if question_id in seen_ids:

                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Duplicate answer for "
                        f"question {question_id}."
                    )
                )

            seen_ids.add(
                question_id
            )

            normalized_answers.append(
                {
                    "question_id":
                        question_id,

                    "answer":
                        str(
                            answer_text
                        ).strip()
                }
            )

        return normalized_answers

    # =========================================================
    # BUILD COMPLETE ANSWER SET
    # =========================================================

    @staticmethod
    def _complete_answers(
        questions: List[Dict[str, Any]],
        answers: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:

        question_ids = {
            question["question_id"]
            for question in questions
        }

        answer_map = {
            answer["question_id"]:
                answer["answer"]
            for answer in answers
        }

        # -----------------------------------------------------
        # CHECK UNKNOWN QUESTION IDS
        # -----------------------------------------------------

        unknown_ids = (
            set(answer_map.keys())
            - question_ids
        )

        if unknown_ids:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Answer contains question ID(s) "
                    f"that do not belong to this interview: "
                    f"{sorted(unknown_ids)}"
                )
            )

        # -----------------------------------------------------
        # CREATE COMPLETE ANSWER LIST
        # -----------------------------------------------------
        #
        # Every question gets an answer.
        #
        # Missing answer = empty answer.
        # Groq will score it 0.
        #

        complete_answers = []

        for question in questions:

            question_id = (
                question["question_id"]
            )

            complete_answers.append(
                {
                    "question_id":
                        question_id,

                    "answer":
                        answer_map.get(
                            question_id,
                            ""
                        )
                }
            )

        return complete_answers

    # =========================================================
    # EVALUATE INTERVIEW
    # =========================================================

    @staticmethod
    def evaluate_interview(
        questions: list,
        answers: list,
        resume_analysis: dict,
        job: dict
    ) -> Dict[str, Any]:

        # =====================================================
        # INPUT VALIDATION
        # =====================================================

        if not isinstance(
            questions,
            list
        ) or not questions:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Interview questions are missing."
                )
            )

        if not isinstance(
            answers,
            list
        ):

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Interview answers must be a list."
                )
            )

        if not isinstance(
            resume_analysis,
            dict
        ):

            resume_analysis = {}

        if not isinstance(
            job,
            dict
        ):

            job = {}

        # =====================================================
        # NORMALIZE QUESTIONS
        # =====================================================

        normalized_questions = (
            InterviewEvaluationService
            ._normalize_questions(
                questions
            )
        )

        if not normalized_questions:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "No valid interview questions "
                    "were found."
                )
            )

        # =====================================================
        # NORMALIZE ANSWERS
        # =====================================================

        normalized_answers = (
            InterviewEvaluationService
            ._normalize_answers(
                answers
            )
        )

        # =====================================================
        # COMPLETE ANSWERS
        # =====================================================
        #
        # If candidate skipped a question,
        # it is still sent to AI with an empty answer.
        #

        normalized_answers = (
            InterviewEvaluationService
            ._complete_answers(
                normalized_questions,
                normalized_answers
            )
        )

        # =====================================================
        # JOB INFORMATION
        # =====================================================

        job_title = str(
            job.get(
                "title",
                "Not specified"
            )
        )

        job_skills = job.get(
            "skills",
            []
        )

        job_requirements = job.get(
            "requirements",
            []
        )

        job_description = str(
            job.get(
                "description",
                ""
            )
        )

        # =====================================================
        # PROMPT
        # =====================================================

        prompt = f"""
You are Recruit AI's Expert Technical Interview Evaluator.

Evaluate the candidate fairly, objectively and consistently.

Your evaluation must be based ONLY on the information provided.

============================================================
IMPORTANT FAIRNESS RULES
============================================================

Evaluate ONLY:

- Interview answers
- Technical knowledge
- Problem solving
- Job-related knowledge
- Communication
- Professional interview performance

DO NOT evaluate:

- Name
- Gender
- Age
- Religion
- Caste
- Race
- Nationality
- Photograph
- Personal appearance
- Other protected characteristics

Do not make assumptions about the candidate.

============================================================
JOB INFORMATION
============================================================

Job Title:
{job_title}

Required Skills:
{json.dumps(
    job_skills,
    indent=2,
    ensure_ascii=False,
    default=str
)}

Requirements:
{json.dumps(
    job_requirements,
    indent=2,
    ensure_ascii=False,
    default=str
)}

Description:
{job_description}

============================================================
RESUME ANALYSIS
============================================================

{json.dumps(
    resume_analysis,
    indent=2,
    ensure_ascii=False,
    default=str
)}

Use resume information only as professional context.

Do NOT give points simply because a skill appears
in the resume.

The candidate must demonstrate relevant knowledge
through the interview answers.

============================================================
INTERVIEW QUESTIONS
============================================================

{json.dumps(
    normalized_questions,
    indent=2,
    ensure_ascii=False,
    default=str
)}

============================================================
CANDIDATE ANSWERS
============================================================

{json.dumps(
    normalized_answers,
    indent=2,
    ensure_ascii=False,
    default=str
)}

============================================================
QUESTION EVALUATION
============================================================

Evaluate EVERY question.

There must be exactly one evaluation for every
question_id provided above.

Each question must contain:

- question_id
- score
- feedback

Question score:

0 to 10

============================================================
QUESTION SCORING
============================================================

Score each answer using:

1. Correctness
2. Relevance
3. Technical depth
4. Practical understanding
5. Problem solving
6. Job relevance

Use this general guideline:

9-10:
Excellent answer.
Correct, relevant, detailed and demonstrates strong
practical understanding.

7-8:
Good answer.
Mostly correct with good understanding.

5-6:
Moderate answer.
Partially correct or lacking depth.

3-4:
Weak answer.
Limited understanding or significant mistakes.

1-2:
Very weak answer.
Minimal relevant understanding.

0:
No answer or completely incorrect answer.

IMPORTANT:

- A short but correct answer can receive a high score.
- A long but incorrect answer should not receive a high score.
- Partially correct answers must receive partial scores.
- Empty answers MUST receive 0.
- Do not invent information.
- Do not skip questions.

============================================================
TECHNICAL SCORE
============================================================

Give a score from 0 to 100.

Consider:

- Technical correctness
- Technical depth
- Practical knowledge
- Problem solving
- Job-related technical skills
- Quality of technical answers

============================================================
COMMUNICATION SCORE
============================================================

Give a score from 0 to 100.

Consider:

- Clarity
- Relevance
- Structure
- Ability to explain ideas
- Professional communication

Do NOT heavily penalize:

- Grammar
- Accent
- Dialect

when the meaning is clear.

============================================================
CONFIDENCE SCORE
============================================================

Give a score from 0 to 100.

This is a text-based interview.

Therefore estimate confidence ONLY from:

- Clarity
- Directness
- Certainty
- Consistency
- Quality of responses

Do NOT claim that text answers can detect:

- Body language
- Facial expressions
- Eye contact
- Actual physical confidence

============================================================
OVERALL SCORE
============================================================

Give a score from 0 to 100.

The overall score must reflect:

- Technical performance
- Communication
- Problem solving
- Answer quality
- Job relevance

Do not artificially increase the score.

============================================================
STRENGTHS
============================================================

List genuine professional strengths.

Examples:

- Strong Java fundamentals
- Good database understanding
- Strong problem-solving approach
- Good API knowledge

Only include strengths supported by the interview answers.

============================================================
WEAKNESSES
============================================================

List genuine weaknesses supported by the interview answers.

Do not invent weaknesses.

============================================================
RECOMMENDATIONS
============================================================

Give practical recommendations for:

- Technical improvement
- Interview performance
- Communication
- Problem solving
- Job readiness

Recommendations should be specific and useful.

============================================================
OVERALL FEEDBACK
============================================================

Provide a concise professional summary of the candidate's
interview performance.

============================================================
STRICT OUTPUT RULES
============================================================

1. Evaluate EVERY question.
2. Preserve EVERY question_id.
3. Each question_id must appear exactly once.
4. Do not create new question IDs.
5. Question scores must be 0-10.
6. Technical score must be 0-100.
7. Communication score must be 0-100.
8. Confidence score must be 0-100.
9. Overall score must be 0-100.
10. Do not invent information.
11. Return ONLY valid JSON.
12. Do NOT return Markdown.
13. Do NOT return ```json.
14. Do NOT add explanations outside JSON.

============================================================
REQUIRED JSON FORMAT
============================================================

{{
    "question_feedback": [
        {{
            "question_id": 1,
            "score": 0,
            "feedback": ""
        }}
    ],

    "technical_score": 0,

    "communication_score": 0,

    "confidence_score": 0,

    "overall_score": 0,

    "strengths": [],

    "weaknesses": [],

    "recommendations": [],

    "overall_feedback": ""
}}

============================================================
FINAL REQUIREMENT
============================================================

Return exactly one question_feedback object for
EVERY question supplied.

If there are 10 questions, return exactly 10
question_feedback objects.

The question IDs must match exactly.
"""

        # =====================================================
        # CALL SHARED GROQ INTERVIEW SERVICE
        # =====================================================

        try:

            evaluation = (
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
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Failed to evaluate interview "
                    f"using Groq: {str(e)}"
                )
            )

        # =====================================================
        # ROOT VALIDATION
        # =====================================================

        if not isinstance(
            evaluation,
            dict
        ):

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "Invalid interview evaluation "
                    "format returned by AI."
                )
            )

        # =====================================================
        # REQUIRED FIELDS
        # =====================================================

        required_fields = [

            "question_feedback",

            "technical_score",

            "communication_score",

            "confidence_score",

            "overall_score",

            "strengths",

            "weaknesses",

            "recommendations",

            "overall_feedback"
        ]

        for field in required_fields:

            if field not in evaluation:

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        f"AI evaluation missing "
                        f"required field: {field}"
                    )
                )

        # =====================================================
        # QUESTION FEEDBACK
        # =====================================================

        question_feedback = (
            evaluation.get(
                "question_feedback"
            )
        )

        if not isinstance(
            question_feedback,
            list
        ):

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "question_feedback must "
                    "be a list."
                )
            )

        # =====================================================
        # EXPECTED QUESTION IDS
        # =====================================================

        expected_ids = {
            question["question_id"]
            for question in normalized_questions
        }

        # =====================================================
        # CHECK QUESTION COUNT
        # =====================================================

        if len(question_feedback) != len(
            expected_ids
        ):

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "AI did not return exactly one "
                    "evaluation for every interview question."
                )
            )

        feedback_ids = set()

        normalized_feedback = []

        # =====================================================
        # VALIDATE QUESTION FEEDBACK
        # =====================================================

        for item in question_feedback:

            if not isinstance(
                item,
                dict
            ):

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        "Invalid question feedback "
                        "object returned by AI."
                    )
                )

            question_id = item.get(
                "question_id"
            )

            score = item.get(
                "score"
            )

            feedback = item.get(
                "feedback"
            )

            # -------------------------------------------------
            # QUESTION ID
            # -------------------------------------------------

            if question_id is None:

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        "Question feedback is missing "
                        "question_id."
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
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        "Invalid question_id returned "
                        "by AI."
                    )
                )

            # -------------------------------------------------
            # UNKNOWN QUESTION ID
            # -------------------------------------------------

            if question_id not in expected_ids:

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        f"AI returned feedback for "
                        f"unknown question {question_id}."
                    )
                )

            # -------------------------------------------------
            # DUPLICATE QUESTION ID
            # -------------------------------------------------

            if question_id in feedback_ids:

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        "AI returned duplicate "
                        "question feedback."
                    )
                )

            # -------------------------------------------------
            # SCORE
            # -------------------------------------------------

            try:

                score = float(
                    score
                )

            except (
                TypeError,
                ValueError
            ):

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        f"Invalid score for "
                        f"question {question_id}."
                    )
                )

            if score < 0 or score > 10:

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        f"Question {question_id} "
                        "score must be between 0 and 10."
                    )
                )

            # -------------------------------------------------
            # FEEDBACK
            # -------------------------------------------------

            if feedback is None:

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        f"Missing feedback for "
                        f"question {question_id}."
                    )
                )

            feedback = str(
                feedback
            ).strip()

            if not feedback:

                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=(
                        f"Empty feedback for "
                        f"question {question_id}."
                    )
                )

            # -------------------------------------------------
            # SAVE
            # -------------------------------------------------

            feedback_ids.add(
                question_id
            )

            normalized_feedback.append(
                {
                    "question_id":
                        question_id,

                    "score":
                        round(
                            score,
                            1
                        ),

                    "feedback":
                        feedback
                }
            )

        # =====================================================
        # CHECK MISSING QUESTIONS
        # =====================================================

        missing_ids = (
            expected_ids
            - feedback_ids
        )

        if missing_ids:

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=(
                    "AI did not evaluate "
                    f"question(s): "
                    f"{sorted(missing_ids)}"
                )
            )

        # =====================================================
        # SORT QUESTION FEEDBACK
        # =====================================================
        #
        # Keep the same order as interview questions.
        #

        question_order = {
            question["question_id"]: index
            for index, question
            in enumerate(
                normalized_questions
            )
        }

        normalized_feedback.sort(
            key=lambda item:
                question_order[
                    item["question_id"]
                ]
        )

        # =====================================================
        # NORMALIZE MAIN SCORES
        # =====================================================

        technical_score = (
            InterviewEvaluationService
            ._safe_score(
                evaluation.get(
                    "technical_score"
                ),
                0,
                100
            )
        )

        communication_score = (
            InterviewEvaluationService
            ._safe_score(
                evaluation.get(
                    "communication_score"
                ),
                0,
                100
            )
        )

        confidence_score = (
            InterviewEvaluationService
            ._safe_score(
                evaluation.get(
                    "confidence_score"
                ),
                0,
                100
            )
        )

        overall_score = (
            InterviewEvaluationService
            ._safe_score(
                evaluation.get(
                    "overall_score"
                ),
                0,
                100
            )
        )

        # =====================================================
        # NORMALIZE LISTS
        # =====================================================

        strengths = (
            InterviewEvaluationService
            ._safe_list(
                evaluation.get(
                    "strengths",
                    []
                )
            )
        )

        weaknesses = (
            InterviewEvaluationService
            ._safe_list(
                evaluation.get(
                    "weaknesses",
                    []
                )
            )
        )

        recommendations = (
            InterviewEvaluationService
            ._safe_list(
                evaluation.get(
                    "recommendations",
                    []
                )
            )
        )

        # =====================================================
        # OVERALL FEEDBACK
        # =====================================================

        overall_feedback = str(
            evaluation.get(
                "overall_feedback",
                ""
            )
            or ""
        ).strip()

        # =====================================================
        # FINAL RESULT
        # =====================================================

        return {

            "question_feedback":
                normalized_feedback,

            "technical_score":
                int(
                    round(
                        technical_score
                    )
                ),

            "communication_score":
                int(
                    round(
                        communication_score
                    )
                ),

            "confidence_score":
                int(
                    round(
                        confidence_score
                    )
                ),

            "overall_score":
                int(
                    round(
                        overall_score
                    )
                ),

            "strengths":
                strengths,

            "weaknesses":
                weaknesses,

            "recommendations":
                recommendations,

            "overall_feedback":
                overall_feedback
        }