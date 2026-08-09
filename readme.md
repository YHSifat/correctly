How to run:

Frontend:

- cd frontend
- npm i // only first time
- npm run dev

Backend:

- cd backend
- py -m venv .venv // only first time
- .venv/scripts/activate
- pip install -r requirements.txt // only firsr time
- uvicorn api.main:app --reload
