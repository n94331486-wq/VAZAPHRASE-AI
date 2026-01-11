
import { GoogleGenAI } from "@google/genai";
import { ParaphraseTone, ParaphraseLength } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const paraphraseText = async (
  text: string,
  tone: ParaphraseTone,
  length: ParaphraseLength,
  targetLanguage: string = "Indonesia"
): Promise<string> => {
  const prompt = `
    Anda adalah asisten ahli menulis dan parafrase.
    Tugas Anda adalah memparafrase teks berikut dengan ketentuan:
    - Gaya Bahasa: ${tone}
    - Panjang Teks: ${length}
    - Bahasa Output: ${targetLanguage}
    
    Pastikan makna asli tetap terjaga namun struktur kalimat dan pilihan kata berubah secara signifikan untuk menghindari plagiarisme dan meningkatkan keterbacaan.
    Hanya berikan hasil parafrasenya saja tanpa penjelasan tambahan.

    Teks asli:
    "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
        topP: 0.95,
        topK: 64,
      }
    });

    return response.text || "Maaf, gagal memproses teks tersebut.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Gagal menghubungkan ke layanan AI. Pastikan koneksi internet Anda stabil.");
  }
};
