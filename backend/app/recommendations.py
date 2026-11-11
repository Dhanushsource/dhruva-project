import json

from .models import Career, StudentProfile


def _decode_json_field(value: str, default: list | dict) -> list | dict:
    expected_type = type(default)
    for _ in range(2):
        if isinstance(value, expected_type):
            return value
        if not isinstance(value, str):
            break
        try:
            value = json.loads(value)
        except (TypeError, ValueError):
            break
    return default


def calculate_recommendation(profile: StudentProfile, career: Career) -> dict:
    student_skills = _decode_json_field(profile.skills or "{}", {})
    required_skills = _decode_json_field(career.required_skills or "{}", {})
    skill_scores = [min(100, float(student_skills.get(skill, 0)) / requirement * 100) for skill, requirement in required_skills.items()]
    skill_match = sum(skill_scores) / len(skill_scores) if skill_scores else 0
    academic_match = (profile.math_score + profile.science_score + profile.english_score) / 3
    interests = {interest.lower() for interest in _decode_json_field(profile.interests or "[]", [])}
    preferred_subjects = _decode_json_field(career.preferred_subjects or "[]", [])
    interest_match = 100 if career.domain.lower() in interests or any(subject.lower() in interests for subject in preferred_subjects) else 45
    aptitude_match = sum(float(student_skills.get(key, 0)) for key in ("logical_reasoning", "analytical_thinking", "problem_solving")) / 3
    overall = round((academic_match * .2) + (interest_match * .2) + (skill_match * .3) + (aptitude_match * .2) + (career.market_demand * .1), 1)
    factors = {"Academic match": round(academic_match, 1), "Interest match": round(interest_match, 1), "Skill match": round(skill_match, 1), "Aptitude match": round(aptitude_match, 1), "Market demand": career.market_demand}
    strongest = sorted(required_skills, key=lambda skill: student_skills.get(skill, 0), reverse=True)[:3]
    explanation = f"{career.name} was recommended because your {', '.join(strongest) or 'current profile'} align with the requirements of this career."
    return {"fit_score": min(100, overall), "factors": factors, "explanation": explanation}
