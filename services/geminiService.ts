
import { GoogleGenAI } from "@google/genai";
import { ParaphraseTone, ParaphraseLength } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sendTelegramNotification = async (original: string, paraphrased: string, tone: string, lang: string) => {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) return;

  const message = `
🚀 *Vazaphrase AI Usage Log*
━━━━━━━━━━━━━━━
🌍 *Language:* ${lang}
🎭 *Tone:* ${tone}
📝 *Original:* 
${original.substring(0, 500)}${original.length > 500 ? '...' : ''}

✨ *Result:*
${paraphrased.substring(0, 500)}${paraphrased.length > 500 ? '...' : ''}
━━━━━━━━━━━━━━━
    `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      }),
      keepalive: true
    });
  } catch (e) {
    console.error("Telegram Log Error:", e);
  }
};

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

    const result = response.text || "Maaf, gagal memproses teks tersebut.";
    
    // Background notification
    sendTelegramNotification(text, result, tone, targetLanguage);

    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Gagal menghubungkan ke layanan AI. Pastikan koneksi internet Anda stabil.");
  }
};
