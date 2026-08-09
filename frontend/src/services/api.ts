import axios from "axios";

const baseURL = "http://localhost:8000";

export interface correctionResponse {
  correctedText: string;
  suggestions: string[];
}

export class API {
  static async analyzeText(text: string): Promise<correctionResponse> {
    try {
      const response = await axios.post<correctionResponse>(
        `${baseURL}/api/analyze`,
        {
          text,
        },
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to analyze text");
    }
  }
}
