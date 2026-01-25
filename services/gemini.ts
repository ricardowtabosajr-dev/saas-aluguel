
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function suggestClotheDescription(name: string, category: string, size: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Gere uma descrição elegante e vendedora para uma peça de roupa de aluguel: ${name}, categoria ${category}, tamanho ${size}.`,
    });
    return response.text;
  } catch (error) {
    return "Descrição automática indisponível no momento.";
  }
}

export async function suggestRentalPrice(category: string, estimatedValue: number) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sugira um valor de aluguel e caução para uma peça de ${category} que custa aproximadamente R$ ${estimatedValue}. Retorne apenas os valores numéricos separados por vírgula.`,
    });
    return response.text;
  } catch (error) {
    return "Consulte a gerência.";
  }
}
