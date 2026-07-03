import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is provided
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Please configure it in the AI Studio platform.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ExtractedIconResult {
  id: string;
  name: string;
  box: [number, number, number, number];
  bg_color: string;
  has_text: boolean;
  text_color: string;
  icon_color: string;
}

export async function extractIconsFromImage(file: File): Promise<ExtractedIconResult[]> {
  const base64 = await fileToBase64(file);
  const data = base64.split(",")[1];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data,
              mimeType: file.type,
            },
          },
          {
            text: `Identify all UI icons, symbols, or standalone graphical elements in this image. For EACH icon, provide:
1. name: A short descriptive name in snake_case.
2. box: The bounding box [ymin, xmin, ymax, xmax] mapped to a 0-1000 scale.
3. bg_color: The hex color code of the background surrounding the icon (e.g., "#FFFFFF").
4. has_text: boolean, true ONLY IF there is text/watermark explicitly overlaid ON TOP of the icon.
5. text_color: The hex color code of the overlaid text (if has_text is true, otherwise empty string).
6. icon_color: The primary hex color code of the icon itself (used to replace the text).`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "Short descriptive name in snake_case",
            },
            box: {
              type: Type.ARRAY,
              items: { type: Type.INTEGER },
              description: "Bounding box as exactly 4 integers [ymin, xmin, ymax, xmax] scaled 0 to 1000",
            },
            bg_color: {
              type: Type.STRING,
              description: "Hex color of the background to remove",
            },
            has_text: {
              type: Type.BOOLEAN,
              description: "True if text is overlaid on the icon",
            },
            text_color: {
              type: Type.STRING,
              description: "Hex color of the overlaid text",
            },
            icon_color: {
              type: Type.STRING,
              description: "Primary hex color of the icon",
            },
          },
          required: ["name", "box", "bg_color", "has_text", "text_color", "icon_color"],
        },
      },
      temperature: 0.1,
    },
  });

  if (!response.text) {
    throw new Error("لم يتم استلام أي نص من النموذج الذكي.");
  }

  try {
    const rawResult: any[] = JSON.parse(response.text);
    return rawResult.map((item, index) => ({
      ...item,
      id: `icon-${index}-${Date.now()}`
    }));
  } catch (error) {
    console.error("Failed to parse JSON", response.text);
    throw new Error("فشل في تحليل النتيجة من النموذج الذكي.");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
