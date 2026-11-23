# Correctly

**Correctly** is a hybrid NLP system for **Grammar Error Detection and Correction (GEDC)**. It fixes grammatical errors in English sentences and explains each fix.

Most grammar checkers only return a corrected sentence. Correctly pairs a fine-tuned **FLAN-T5** model with rule-based linguistic analysis, so each correction comes with:

- **what** changed (the exact words and their character positions),
- **what kind** of error it was (subject–verb agreement, article usage, verb form, verb tense, …),
- **why** it was wrong (a grammar-rule explanation with a confidence score).

📺 **Demo:** https://youtu.be/HzWhCiCVCt4

---

## Overview

### The problem

Traditional rule-based grammar checkers depend on hand-written rules. They:

- struggle with unseen or complex sentence structures,
- cannot fully understand a sentence's context,
- take a lot of work to maintain and extend.

### The approach

Correctly uses both methods, each for what it does well:

| Rule-based              | FLAN-T5                |
| ----------------------- | ---------------------- |
| Fixed rules             | Context-aware          |
| Manual maintenance      | Learns from data       |
| Low generalization      | High generalization    |
| Pattern matching        | Language understanding |

The neural model **generates** the correction. The rule-based engines **interpret** it. Together they produce an interpretable correction instead of a black-box rewrite.

### Objectives

1. Detect grammatical errors in English sentences.
2. Generate contextually correct sentence corrections.
3. Identify modified words and their positions.
4. Classify the type of grammatical error.
5. Provide grammar-rule explanations for corrections.

---

## Features

**Grammar correction & analysis**
- **Grammar detection:** checks whether a sentence is grammatically correct
- **Sentence correction:** generates the corrected sentence with fine-tuned FLAN-T5
- **Error highlighting:** marks changed, added and deleted words
- **Error analysis:** shows each error's type, character position, explanation and confidence score
- **Apply individual corrections:** accept suggestions one at a time

**Paraphrasing**
- Generates alternative versions of a sentence that keep its meaning
- Six styles: *Neutral, Formal, Casual, Confident, Simple, Concise*

**Interface**
- Interactive analysis dashboard with an error breakdown and an NLP pipeline view
- Word and character counter

---

## Architecture

```text
                 ┌──────────────────────────────┐
                 │   Frontend (React + TS)      │
                 └──────────────┬───────────────┘
                                │  HTTP (axios)
                 ┌──────────────▼───────────────┐
                 │   FastAPI backend            │
                 └──────────────┬───────────────┘
                                │
        User input ─────────────┤
                                ▼
              ┌───────────────────────────────────┐
              │ 1. FLAN-T5 grammar correction     │  → corrected sentence
              └─────────────────┬─────────────────┘
                                ▼
              ┌───────────────────────────────────┐
              │ 2. Difference Engine              │  → changed / added / deleted
              │    (token alignment via difflib)  │    words + char positions
              └─────────────────┬─────────────────┘
                                ▼
              ┌───────────────────────────────────┐
              │ 3. Grammar Lookup Engine          │  → error type, explanation,
              │    (POS tagging + grammar rules)  │    confidence
              └─────────────────┬─────────────────┘
                                ▼
                    Interpretable result → UI
```

### 1. FLAN-T5 correction model
[FLAN-T5](https://huggingface.co/google/flan-t5-small) is Google's open-source, instruction-tuned **encoder–decoder Transformer**. It treats every NLP task as text-to-text generation. The encoder reads the input sentence and its context, and the decoder generates the corrected sentence. Correctly fine-tunes `google/flan-t5-small` on grammar correction pairs.

A second fine-tuned model handles **style-controlled paraphrasing**.

### 2. Difference Engine
Aligns the original and corrected sentences token by token and reports each edit:

| Change type | Meaning                                |
| ----------- | -------------------------------------- |
| `changed`   | A word or phrase was replaced          |
| `added`     | A missing word was inserted            |
| `deleted`   | An unnecessary word was removed        |

Each difference includes start and end character offsets in both the original and the corrected text.

### 3. Grammar Lookup Engine
Runs a set of grammar rules against each difference to classify the error and explain it:

- Subject–verb agreement
- Article usage
- Verb form
- Verb tense
- Grammatical changes (fallback for edits no rule matches)

---

## Dataset & Training

| | |
| --- | --- |
| **Corpus** | W&I (Write & Improve), from Bryant et al., BEA-2019 |
| **Size** | 34,308 paired `source` → `target` training sentences |
| **Task** | Supervised fine-tuning of FLAN-T5 (original → corrected) |

**Preprocessing steps**
- Removed missing (NULL) sentence pairs
- Normalized extra spaces and formatting
- Removed empty source/target sentences
- Removed duplicate sentence pairs
- Validated the source → target structure

**Default training configuration** ([backend/model/config.py](backend/model/config.py)): batch size 4, learning rate 5e-5, 3 epochs, weight decay 0.01, seed 42.

The full training workflow is in [backend/gec_training_workflow.ipynb](backend/gec_training_workflow.ipynb). Dataset and tokenizer reports are in [backend/reports/](backend/reports/).

---

## Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| Model    | PyTorch, Hugging Face Transformers, FLAN-T5 |
| Backend  | Python, FastAPI, Uvicorn, Pydantic |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Axios |

---

## Project Structure

```text
correctly/
├── backend/
│   ├── api/                    # FastAPI app (main.py) and request/response schemas
│   ├── model/                  # Training, tokenization, inference (correction + paraphrase)
│   │   └── saved_trained_models/   # ← place downloaded models here (git-ignored)
│   ├── diff_lookup_engine/     # Difference Engine
│   ├── grammar_rule_engine/    # Grammar Lookup Engine and rules
│   ├── preprocessing/          # Dataset cleaning and analysis
│   ├── datasets/               # Raw and processed training data
│   ├── reports/                # Dataset and tokenizer reports and plots
│   ├── gec_training_workflow.ipynb
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/         # UI components (dashboard, suggestions, pipeline view, …)
        └── services/api.ts     # Backend API client
```

---

## How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend

**Download the trained models** from
[Google Drive](https://drive.google.com/drive/folders/1TKsAKOGQHEcEMFpGezy5mDTglQ3uFs-R?usp=drive_link).
Extract both folders into `backend/model/saved_trained_models/`, so the layout looks like this:

```text
backend/model/saved_trained_models/
├── flan_t5_small_gec/
└── paraphraser/
```

**Set up and start the API:**

```bash
cd backend

# first time only
py -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux
pip install -r requirements.txt

# every time
uvicorn api.main:app --reload
```

The API runs at **http://localhost:8000**. Interactive docs are at http://localhost:8000/docs.

> Run `uvicorn` from inside `backend/`, because the model paths are relative to that folder.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install      # first time only
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). The frontend expects the backend at `http://localhost:8000`.

---

## API Reference

| Method | Endpoint      | Body                                                     | Returns |
| ------ | ------------- | -------------------------------------------------------- | ------- |
| GET    | `/health`     | –                                                        | `{ "status": "ok" }` |
| POST   | `/correction` | `{ "text" }`                                             | Original and corrected text |
| POST   | `/compare`    | `{ "original", "corrected" }`                            | List of differences |
| POST   | `/analyze`    | `{ "text" }`                                             | Corrected text and differences with error type, explanation and confidence |
| POST   | `/paraphrase` | `{ "text", "style", "num_return_sequences", "max_length" }` | List of paraphrases |

**Example: `/analyze`**

```json
// POST /analyze
{ "text": "She go to school every day." }

// Response
{
  "original": "She go to school every day.",
  "corrected": "She goes to school every day.",
  "differences": [
    {
      "type": "changed",
      "original": "go",
      "corrected": "goes",
      "original_start": 4,
      "original_end": 6,
      "corrected_start": 4,
      "corrected_end": 8,
      "error_type": "subject_verb_agreement",
      "explanation": "...",
      "confidence": 0.9
    }
  ]
}
```

---

## References

1. C. Bryant et al., "Grammatical Error Correction: A Survey of the State of the Art," *Computational Linguistics*, vol. 49, no. 3, pp. 643–701, 2023.
2. H. W. Chung et al., "Scaling Instruction-Finetuned Language Models," 2022.
3. S. Longpre et al., "The Flan Collection: Designing Data and Methods for Effective Instruction Tuning," *ICML*, 2023.
4. A. Katinskaia and R. Yangarber, "Grammatical Error Correction for Sentence-level Assessment in Language Learning," *BEA*, 2023.
5. Y. Zhang, H. Kamigaito, and M. Okumura, "Bidirectional Transformer Reranker for Grammatical Error Correction," *Findings of ACL*, 2023.

---

## Team

Developed at the **Department of Computer Science & Engineering, Jagannath University**.

| Name | ID |
| ---- | -- |
| Reshma Kakoli | B200305027 |
| MD. Yusuf Hasan | B200305048 |

**Supervisor:** Tanvir Ahammad, Assistant Professor, Dept. of CSE, Jagannath University
