from __future__ import annotations

from pathlib import Path

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


class GrammarCorrectionModel:
    """Inference wrapper for the fine-tuned grammar correction model."""

    def __init__(self, model_path: str | Path):
        self.model_path = Path(model_path)

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_path
        )

        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            self.model_path
        )

        self.model.to(self.device)
        self.model.eval()

    def correct(self, text: str) -> str:
        """Correct a single sentence."""

        inputs = self.tokenizer(
            text,
            return_tensors="pt",
            truncation=True,
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_length=128,
                num_beams=4,
                early_stopping=True,
            )

        return self.tokenizer.decode(
            outputs[0],
            skip_special_tokens=True,
        )