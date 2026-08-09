import axios from "axios";

const baseURL = "http://localhost:8000";

export class API {
  static async analyzeText(text: string): Promise<any> {
    try {
      const response = await axios.post(`${baseURL}/analyze`, { text });
      return response.data;
    } catch (error) {
      throw new Error("Failed to analyze text");
    }
  }

  static async paraphraseText(
    text: string,
    style = "neutral",
    num_return_sequences = 1,
    max_length = 128,
  ): Promise<string | string[]> {
    try {
      const response = await axios.post(`${baseURL}/paraphrase`, {
        text,
        style,
        num_return_sequences,
        max_length,
      });

      return response.data.paraphrased;
    } catch (error) {
      throw new Error("Failed to paraphrase text");
    }
  }
}
