# Career Compass AI

## Project overview

Students finishing Class 10 or Class 12 often have to make important education and career choices without a clear view of all the options. Guidance about courses, specializations, entrance exams, skills, jobs, and future scope is spread across many sources and can be hard to compare. Students may know only a few familiar professions while suitable or emerging opportunities remain unfamiliar.

Career Compass AI is a centralized, browser-based guidance platform that helps students explore options, compare next steps, and make more informed decisions. It is designed to be straightforward to use and can be especially useful to students with limited access to one-to-one career counselling, including students in rural or underserved areas.

## Project goals

- Bring career and higher-education information into one understandable place.
- Support exploration after Class 10 and Class 12 using students' academic stage, marks, interests, and preferred subjects.
- Cover medical and health, engineering and technology, commerce and business, arts and design, law and public service, agriculture, forestry, and environmental pathways.
- Explain relevant courses, specializations, entrance routes, skills, career opportunities, and future scope.
- Offer profile-based career suggestions as guidance, not as a guaranteed prediction or a substitute for official admissions advice.

## Current implementation

- Responsive frontend with student profile, assessment, career exploration, academic streams, course comparisons, entrance-exam information, career roadmaps, recommended learning resources, central/state scholarship portals, international study resources, and saved careers.
- FastAPI REST API in `backend/app` with JWT authentication and profile, career, recommendation, and saved-career endpoints.
- SQLAlchemy persistence for users, student profiles, careers, and saved careers, using SQLite for local development.
- Explainable recommendation scoring with factor breakdowns. The API currently ranks careers using profile-based scoring; the Decision Tree, Random Forest, and KNN scripts in `ml/training` are development experiments on synthetic data and are not the live API prediction model.

Career suggestions and course durations are general guidance. Students should verify current eligibility, entrance exams, dates, and course details with relevant institutions and official exam authorities.

## Run the backend

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn backend.app.main:app --reload --port 8002
```

The frontend and API are served together at `http://localhost:8002`; API docs are available at `http://localhost:8002/docs`. For a separate static frontend on port 4173, the client uses the API at port 8002 and the configured CORS origin.

## Train the development model

```powershell
python ml/training/train_models.py
```

The training data is synthetic and intended for development/demo use. Career guidance is informational, not a guarantee of future outcomes.
