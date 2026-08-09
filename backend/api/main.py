from pathlib import Path

from fastapi import FastAPI

from model.inference import GrammarCorrectionModel
from api.schemas import CorrectionRequest, CorrectionResponse


app = FastAPI(
    title="Correctly API",
    version="0.1.0",
)


MODEL_PATH = Path("models/flan_t5_small_gec")

grammar_model = GrammarCorrectionModel(
    MODEL_PATH
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/correct", response_model=CorrectionResponse)
def correct(request: CorrectionRequest):
    corrected = grammar_model.correct(request.text)

    return CorrectionResponse(
        original=request.text,
        corrected=corrected,
    )