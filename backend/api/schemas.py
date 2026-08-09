from pydantic import BaseModel


class CorrectionRequest(BaseModel):
    text: str


class CorrectionResponse(BaseModel):
    original: str
    corrected: str

class ParaphraseRequest(BaseModel):
    text: str
    style: str = "neutral"
    num_return_sequences: int = 1
    max_length: int = 128

class ParaphraseResponse(BaseModel):
    paraphrased: list[str]