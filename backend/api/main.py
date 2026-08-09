from pathlib import Path

from fastapi import FastAPI

from model.inference import GrammarCorrectionModel
from api.schemas import CorrectionRequest, CorrectionResponse, ParaphraseRequest, ParaphraseResponse
from model.inferencePara import ParaphrasingModel

app = FastAPI(
    title="Correctly API",
    version="0.1.0",
)


CORRECTION_MODEL_PATH = Path("model/saved_trained_models/flan_t5_small_gec")
PARAPHRASING_MODEL_PATH = Path("model/saved_trained_models/paraphraser")

grammar_model = GrammarCorrectionModel(
    CORRECTION_MODEL_PATH
)

print("grammar model loaded")

paraphrasing_model = ParaphrasingModel(
    PARAPHRASING_MODEL_PATH 
)

print("paraphrasing model loaded")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=CorrectionResponse)
def analyze(request: CorrectionRequest):
    corrected = grammar_model.correct(request.text)

    return CorrectionResponse(
        original=request.text,
        corrected=corrected,
    )



@app.post("/paraphrase", response_model=ParaphraseResponse)
def paraphrase(request: ParaphraseRequest):
    paraphrased = paraphrasing_model.paraphrase(
        text=request.text,
        style=request.style,
        num_return_sequences=request.num_return_sequences,
        max_length=request.max_length,
    )


    return ParaphraseResponse(
        paraphrased=paraphrased,
    )



