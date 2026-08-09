from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from model.inference import GrammarCorrectionModel
from api.schemas import AnalyzeRequest, AnalyzeResponse, AnalyzeResponse, CompareRequest, CompareResponse, CorrectionRequest, CorrectionResponse, ParaphraseRequest, ParaphraseResponse
from model.inferencePara import ParaphrasingModel
from grammar_rule_engine.grammar_lookup import GrammarLookup
from diff_lookup_engine.diffEngine import compare_texts

app = FastAPI(
    title="Correctly API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allows all origins
    allow_credentials=True,   # Allows cookies and credentials
    allow_methods=["*"],      # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],      # Allows all headers
)


grammar_lookup = GrammarLookup()

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


@app.post("/correction", response_model=CorrectionResponse)
def correction(request: CorrectionRequest):
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


@app.post("/compare", response_model=CompareResponse)
def compare(request: CompareRequest):
    differences = compare_texts(request.original, request.corrected)
    return CompareResponse(differences=differences)


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    corrected = grammar_model.correct(request.text)
    differences = compare_texts(request.text, corrected)
    differences= grammar_lookup.lookup(
        original=request.text,
        corrected=corrected,
        differences=differences,
    )

    return AnalyzeResponse(
        original=request.text,
        corrected=corrected,
        differences=differences,
    )