# Correctly

Correctly is an AI-powered grammar correction and writing assistance application.

It uses a trained NLP model to detect and correct grammatical errors, a difference engine to identify changes between the original and corrected text, and a grammar rule lookup engine to explain detected grammar errors.

## Features

- AI-powered grammar correction
- Grammar error detection
- Changed, added, and deleted word detection
- Character positions for detected changes
- Grammar rule classification
- Grammar error explanations
- Confidence scores
- Apply individual grammar corrections
- Paraphrasing
- Multiple paraphrasing styles:
  - Neutral
  - Formal
  - Casual
  - Confident
  - Simple
  - Concise
- Word and character counting
- Interactive analysis dashboard
- FastAPI backend
- React + TypeScript frontend

## How It Works

Correctly uses a multi-stage NLP pipeline:

```text
User Input
    ↓
Grammar Correction Model
    ↓
Corrected Text
    ↓
Difference Engine
    ↓
Grammar Rule Lookup Engine
    ↓
Grammar Explanation + Confidence
    ↓
Frontend

## How to run:

Frontend:

- cd frontend
- npm i // only first time
- npm run dev

Backend:

- download trained model from [https://drive.google.com/drive/folders/1TKsAKOGQHEcEMFpGezy5mDTglQ3uFs-R?usp=drive_link]
- extract and copy both folder in backend/model/saved_trained_models directory
- cd backend
- py -m venv .venv // only first time
- .venv/scripts/activate
- pip install -r requirements.txt // only firsr time
- uvicorn api.main:app --reload
```
