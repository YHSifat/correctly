"""Prepare the FLAN-T5 training pipeline without starting training."""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path
from typing import Sequence

from datasets import DatasetDict
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, DataCollatorForSeq2Seq, Seq2SeqTrainer, Seq2SeqTrainingArguments, set_seed

if __package__ is None or __package__ == "":
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from model.config import PipelineConfig, build_argument_parser, build_pipeline_config
from model.dataset import DatasetBuilderConfig, GrammarDatasetBuilder
from model.tokenization import GrammarTokenizer, TokenizationConfig
from model.tokenizer_analysis import TokenizerAnalysisConfig, TokenizerAnalyzer
from model.utils import resolve_project_path


LOGGER = logging.getLogger(__name__)


class TrainingPreparationPipeline:
    """Build all training objects without invoking trainer.train()."""

    def __init__(self, config: PipelineConfig) -> None:
        self.config = config

    def prepare(self) -> dict[str, object]:
        """Prepare tokenizer, datasets, model, arguments, and trainer."""

        set_seed(self.config.data.random_seed)

        analysis_result = self._run_tokenizer_analysis()
        max_input_length = self.config.data.max_input_length or analysis_result.recommended_max_input_length
        max_target_length = self.config.data.max_target_length or analysis_result.recommended_max_input_length

        tokenizer = AutoTokenizer.from_pretrained(self.config.model.tokenizer_name, use_fast=True)
        dataset_dict = GrammarDatasetBuilder(
            DatasetBuilderConfig(
                cleaned_dataset_path=self.config.data.cleaned_dataset_path,
                source_column=self.config.data.source_column,
                target_column=self.config.data.target_column,
                random_seed=self.config.data.random_seed,
            )
        ).build()
        tokenized_dataset = GrammarTokenizer(
            TokenizationConfig(
                model_name=self.config.model.tokenizer_name,
                max_input_length=max_input_length,
                max_target_length=max_target_length,
                source_column=self.config.data.source_column,
                target_column=self.config.data.target_column,
            )
        ).tokenize_dataset(dataset_dict)

        model = AutoModelForSeq2SeqLM.from_pretrained(self.config.model.model_name)
        data_collator = DataCollatorForSeq2Seq(tokenizer=tokenizer, model=model)
        training_arguments = self._build_training_arguments()
        trainer = Seq2SeqTrainer(
            model=model,
            args=training_arguments,
            train_dataset=tokenized_dataset["train"],
            eval_dataset=tokenized_dataset["validation"],
            processing_class=tokenizer,
            data_collator=data_collator,
        )

        summary = self._build_summary(dataset_dict, tokenized_dataset, model, tokenizer, training_arguments)
        return {
            "analysis": analysis_result,
            "dataset_dict": dataset_dict,
            "tokenized_dataset": tokenized_dataset,
            "tokenizer": tokenizer,
            "model": model,
            "training_arguments": training_arguments,
            "trainer": trainer,
            "summary": summary,
        }

    def _run_tokenizer_analysis(self):
        analysis_config = TokenizerAnalysisConfig(
            cleaned_dataset_path=self.config.data.cleaned_dataset_path,
            model_name=self.config.model.model_name,
        )
        return TokenizerAnalyzer(analysis_config).analyze()

    def _build_training_arguments(self) -> Seq2SeqTrainingArguments:
        return Seq2SeqTrainingArguments(
            output_dir=str(resolve_project_path(self.config.training.output_dir)),
            logging_dir=str(resolve_project_path(self.config.training.logging_dir)),
            per_device_train_batch_size=self.config.training.batch_size,
            per_device_eval_batch_size=self.config.training.batch_size,
            learning_rate=self.config.training.learning_rate,
            num_train_epochs=self.config.training.epochs,
            weight_decay=self.config.training.weight_decay,
            gradient_accumulation_steps=self.config.training.gradient_accumulation_steps,
            fp16=self.config.training.fp16,
            seed=self.config.training.random_seed,
            logging_steps=self.config.training.logging_steps,
            save_strategy=self.config.training.save_strategy,
            eval_strategy=self.config.training.evaluation_strategy,
            save_total_limit=self.config.training.save_total_limit,
            report_to=[],
            predict_with_generate=False,
            remove_unused_columns=False,
        )

    def _build_summary(
        self,
        dataset_dict: DatasetDict,
        tokenized_dataset: DatasetDict,
        model,
        tokenizer,
        training_arguments: Seq2SeqTrainingArguments,
    ) -> str:
        total_parameters = sum(parameter.numel() for parameter in model.parameters())
        trainable_parameters = sum(parameter.numel() for parameter in model.parameters() if parameter.requires_grad)
        lines = [
            "Training Preparation Summary",
            "============================",
            f"Dataset sizes: train={len(dataset_dict['train'])}, validation={len(dataset_dict['validation'])}, test={len(dataset_dict['test'])}",
            f"Vocabulary size: {tokenizer.vocab_size}",
            f"Model name: {self.config.model.model_name}",
            f"Number of trainable parameters: {trainable_parameters:,}",
            f"Total model parameters: {total_parameters:,}",
            f"Batch size: {self.config.training.batch_size}",
            f"Learning rate: {self.config.training.learning_rate}",
            f"Output directory: {training_arguments.output_dir}",
            f"Logging directory: {training_arguments.logging_dir}",
            f"Tokenized train columns: {tokenized_dataset['train'].column_names}",
        ]
        return "\n".join(lines)


def main(argv: Sequence[str] | None = None) -> int:
    """Prepare and print the complete training setup without training."""

    logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
    parser = build_argument_parser()
    args = parser.parse_args(argv)
    config = build_pipeline_config(args)

    pipeline = TrainingPreparationPipeline(config)
    prepared = pipeline.prepare()
    print(prepared["summary"])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
