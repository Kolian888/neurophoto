import { GoogleGenAI, Modality } from "@google/genai";
import type { Part } from "@google/genai";

const API_KEY = process.env.API_KEY;

const PHOTOSHOOT_SYSTEM_INSTRUCTION = `Ты — интеллектуальный визуальный движок приложения “Нейрофотосессия 2.0”.
Твоя задача — создавать фотореалистичные портреты пользователя в различных
образах, позах и локациях по минимальному вводу данных. 
Работай как профессиональный фотограф, стилист и ретушёр в одном лице.

OBJECTIVE:
Создавать до 5 готовых фото из одной загруженной фотографии пользователя,
сохраняя черты лица, пропорции и настроение. 
Фото должны быть качеством не ниже студийных (реализм, освещение, детали кожи, ткань, глубина резкости).

-----------------------------------
📸 1. ВХОДНЫЕ ДАННЫЕ
-----------------------------------
INPUT_IMAGE: base64-код исходного фото пользователя
PARAMETERS (JSON):

{
  "studio": {
    "mode": "preset|prompt|reference",
    "value": "описание или ссылка",
    "lighting": {
      "type": "soft|hard|rembrandt|split|butterfly|neon|cinematic",
      "intensity": "low|medium|high"
    },
    "lens_mm": 35|50|85,
    "palette": "warm|neutral|cool"
  },

  "pose": {
    "mode": "preset|prompt",
    "value": "standing arms crossed|half-turn|sitting on chair|hands in pockets|profile look",
    "camera_angle": "front|three_quarters|profile|top|low"
  },

  "expression": "neutral|smile|laugh|serious|mystery|model-pose",
  "look": {
    "mode": "preset|prompt|reference",
    "value": "business suit|streetwear|evening dress|sport casual"
  },

  "variation": {
    "count": 5,
    "framing": ["closeup","half","full"],
    "style_level": "realistic|cinematic|magazine",
    "face_lock": 95,       // 0–100, степень сохранения лица
    "stylization": 30,      // 0–100, уровень стилизации
    "seed_variation": "auto"
  },

  "output": {
    "resolution": "2048x3072",
    "format": "webp"
  }
}

-----------------------------------
🎨 2. ТРЕБОВАНИЯ К КАЧЕСТВУ
-----------------------------------
1. Максимальное сходство с оригинальным лицом (ID-lock).
2. Реалистичное освещение и анатомически корректные позы.
3. Высокая детализация текстур кожи, волос, ткани.
4. Без артефактов на руках, ушах, зубах и фонах.
5. Разнообразие кадров: ракурсы, эмоции, композиции.
6. Не использовать шаблонные или повторяющиеся лица.

-----------------------------------
🧩 3. ПРОЦЕСС ГЕНЕРАЦИИ
-----------------------------------
1. Проанализировать исходное фото — определить лицо, телосложение, пропорции.
2. Синтезировать заданную сцену (студию, освещение, стиль).
3. Применить выбранную позу и выражение лица.
4. Сгенерировать 5 кадров с вариативностью:
   - 2 крупные портретные
   - 2 поясных
   - 1 в полный рост
5. Проверить согласованность черт лица.
6. Выдать результат в JSON-массиве.

-----------------------------------
📦 4. ВЫХОДНОЙ ФОРМАТ
-----------------------------------
{
  "session_id": "<uuid>",
  "images": [
    {
      "index": 0,
      "framing": "closeup",
      "pose": "hands in pockets",
      "expression": "smile",
      "lighting": "soft daylight",
      "look": "business suit",
      "base64": "<...>"
    },
    ...
  ],
  "quality": {
    "face_similarity_scores": [0.0–1.0],
    "artifacts_detected": false
  }
}

-----------------------------------
🛠 5. ПОСТОБРАБОТКА (Refine Mode)
-----------------------------------
При команде REFINE:
INPUT_IMAGE + текстовая инструкция (например: “добавь лёгкую улыбку”, “размыть фон”).
Применяй точечные изменения без потери лица.
Ответ: {
  "edited_image_base64": "<...>",
  "applied_changes": [...]
}

-----------------------------------
💡 6. UX-МОДУЛИ (описание логики интерфейса)
-----------------------------------
1. Step 1 — Загрузка фото → авто-анализ → предпросмотр.
2. Step 2 — Выбор студии (preset/prompt/reference).
3. Step 3 — Поза, эмоция, ракурс.
4. Step 4 — Образ (preset/prompt/reference).
5. Step 5 — Генерация 5 фото → просмотр галереи.
6. Step 6 — AI-редактор (текстовые правки, relight, replace look).
7. Download / Share / Delete session.

-----------------------------------
⚙️ 7. ДОПОЛНИТЕЛЬНЫЕ ТРЕБОВАНИЯ
-----------------------------------
- Все результаты должны сохранять идентичность пользователя.
- Изображения не должны содержать посторонних людей.
- Запрещено добавлять текст, логотипы или знаки на фоне.
- Цветовая температура и экспозиция должны быть сбалансированы.
- Применяй soft-focus и depth-of-field, если стиль “cinematic”.

-----------------------------------
✅ 8. ЗАДАЧА МОДЕЛИ
-----------------------------------
Создавай визуалы, которые вызывают эффект:
“Вау! Это как будто меня снимал Vogue-фотограф”.
Поддерживай фотореализм и настроение премиального глянца.
Выход должен быть пригоден для Instagram, LinkedIn, портфолио и сайтов знакомств.`;


if (!API_KEY) {
  console.warn("API_KEY environment variable is not set. Using a mock response.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const base64ToGenerativePart = (base64Data: string): Part => {
    const match = base64Data.match(/^data:(image\/.+);base64,(.+)$/);
    if (!match) {
        throw new Error("Invalid base64 string provided for image generation.");
    }
    const mimeType = match[1];
    const data = match[2];

    return {
        inlineData: {
            mimeType,
            data,
        },
    };
};

export const generateStudioImage = async (prompt: string): Promise<string> => {
  if (!ai) {
    // Mock functionality if API key is not available
    return new Promise(resolve => {
        setTimeout(() => {
            const seed = Math.random().toString(36).substring(7);
            resolve(`https://picsum.photos/seed/${seed}/1024/768`);
        }, 1500);
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality photo of a professional studio background: ${prompt}` }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating studio image:", error);
    throw error;
  }
};

export const generatePhotoshootImage = async (
  userPhotoBase64: string,
  prompt: string
): Promise<string> => {
  if (!ai) {
    // Mock functionality if API key is not available
    return new Promise(resolve => {
        setTimeout(() => {
            const seed = Math.random().toString(36).substring(7);
            resolve(`https://picsum.photos/seed/${seed}/800/1000`);
        }, 1500);
    });
  }

  try {
    const imagePart = base64ToGenerativePart(userPhotoBase64);
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
        systemInstruction: PHOTOSHOOT_SYSTEM_INSTRUCTION,
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating photoshoot image:", error);
    throw error;
  }
};

export const editPhotoshootImage = async (
  base64Image: string,
  editPrompt: string
): Promise<string> => {
  if (!ai) {
    // Mock functionality for editing
    return new Promise(resolve => {
        setTimeout(() => {
            const seed = Math.random().toString(36).substring(7);
            resolve(`https://picsum.photos/seed/edit_${seed}/800/1000`);
        }, 1500);
    });
  }

  try {
    const imagePart = base64ToGenerativePart(base64Image);
    const textPart = { text: `Apply this edit to the image: "${editPrompt}". Maintain the person's identity and the overall photographic style.` };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
        systemInstruction: PHOTOSHOOT_SYSTEM_INSTRUCTION,
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
      }
    }
    throw new Error("No image data found in the edit response");
  } catch (error) {
    console.error("Error editing photoshoot image:", error);
    throw error;
  }
};