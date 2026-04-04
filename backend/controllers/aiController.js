const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Gemini API error");
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// controllers
export const summarizeDocument = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: "Text too short" });
    }

    const summary = await callGemini(`Summarize:\n${text}`);
    res.json({ summary });

  } catch (err) {
    next(err);
  }
};

export const improveText = async (req, res, next) => {
  try {
    const improved = await callGemini(`Improve:\n${req.body.text}`);
    res.json({ improved });
  } catch (err) {
    next(err);
  }
};

export const fixGrammar = async (req, res, next) => {
  try {
    const corrected = await callGemini(`Fix grammar:\n${req.body.text}`);
    res.json({ corrected });
  } catch (err) {
    next(err);
  }
};