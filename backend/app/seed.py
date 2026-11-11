import json

from sqlalchemy.orm import Session

from .models import Career


CAREERS = [
    ("Artificial Intelligence Engineer", "Technology", "Design intelligent systems that learn from data and solve real-world problems.", {"programming": 88, "mathematics": 82, "analytical_thinking": 86, "problem_solving": 84}, ["Mathematics", "Computer Science"], "4 years", "INR 8-24 LPA", 94, 18),
    ("Data Scientist", "Technology", "Turn complex information into decisions that shape the future.", {"programming": 78, "mathematics": 88, "analytical_thinking": 92, "research": 78}, ["Mathematics", "Computer Science"], "4 years", "INR 7-20 LPA", 91, 16),
    ("Cybersecurity Analyst", "Technology", "Protect digital systems, people and organisations from evolving threats.", {"programming": 72, "logical_reasoning": 88, "problem_solving": 86, "technical_skills": 82}, ["Mathematics", "Computer Science"], "4 years", "INR 6-18 LPA", 89, 17),
    ("Software Developer", "Technology", "Build useful products and reliable software for people and businesses.", {"programming": 86, "problem_solving": 82, "teamwork": 70, "communication": 65}, ["Mathematics", "Computer Science"], "4 years", "INR 6-18 LPA", 93, 14),
    ("Biotechnology Researcher", "Healthcare", "Use living systems to create healthier, more sustainable futures.", {"research": 88, "science": 90, "analytical_thinking": 75, "communication": 60}, ["Biology", "Science"], "4-5 years", "INR 4-12 LPA", 76, 12),
    ("Product Designer", "Design", "Shape useful, accessible experiences for the people who use them.", {"creativity": 90, "communication": 78, "research": 72, "teamwork": 75}, ["Design", "English"], "3-4 years", "INR 5-16 LPA", 82, 13),
    ("Financial Analyst", "Business", "Translate market and business data into confident decisions.", {"mathematics": 82, "analytical_thinking": 86, "communication": 75, "research": 70}, ["Mathematics", "Economics"], "3-4 years", "INR 5-15 LPA", 80, 11),
    ("Environmental Scientist", "Science", "Use science and evidence to design a healthier planet.", {"science": 88, "research": 82, "analytical_thinking": 74, "communication": 65}, ["Science", "Biology"], "3-4 years", "INR 4-12 LPA", 78, 15),
]


def seed_careers(database: Session) -> None:
    if database.query(Career).count():
        return
    for name, domain, description, skills, subjects, duration, salary, demand, growth in CAREERS:
        database.add(Career(name=name, domain=domain, description=description, required_skills=json.dumps(skills), preferred_subjects=json.dumps(subjects), education_duration=duration, salary_range=salary, market_demand=demand, growth_rate=growth))
    database.commit()
