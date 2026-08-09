from __future__ import annotations

from pathlib import Path

import torch
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer


class ParaphrasingModel:
    """Inference wrapper for the local paraphrasing model."""

    def __init__(self, model_path: str | Path):
        self.model_path = Path(model_path)

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.tokenizer = AutoTokenizer.from_pretrained(
            self.model_path,
            local_files_only=True,
        )

        self.model = AutoModelForSeq2SeqLM.from_pretrained(
            self.model_path,
            local_files_only=True,
        )

        self.model.to(self.device)
        self.model.eval()

    def paraphrase(
        self,
        text: str,
        style: str = "neutral",
        num_return_sequences: int = 1,
        max_length: int = 128,
    ) -> str | list[str]:
        """Paraphrase a single sentence according to the requested style."""

        style_instructions = {
            "neutral": "Paraphrase the following sentence:",
            "formal": (
                "Paraphrase the following sentence "
                "in a formal and professional tone:"
            ),
            "casual": (
                "Paraphrase the following sentence "
                "in a casual and natural tone:"
            ),
            "confident": (
                "Paraphrase the following sentence "
                "in a confident and assertive tone:"
            ),
            "simple": (
                "Paraphrase the following sentence "
                "using simple and easy-to-understand language:"
            ),
            "concise": (
                "Paraphrase the following sentence "
                "more concisely:"
            ),
        }

        instruction = style_instructions.get(
            style.lower(),
            style_instructions["neutral"],
        )

        prompt = f"{instruction} {text}"

        inputs = self.tokenizer(
            prompt,
            return_tensors="pt",
            truncation=True,
            max_length=max_length,
        )

        inputs = {
            key: value.to(self.device)
            for key, value in inputs.items()
        }

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                num_beams=5,
                num_return_sequences=num_return_sequences,
                repetition_penalty=2.0,
                no_repeat_ngram_size=2,
                max_length=max_length,
            )

        results = [
            self.tokenizer.decode(
                output,
                skip_special_tokens=True,
            ).strip()
            for output in outputs
        ]

        if num_return_sequences == 1:
            return results[0]

        return results