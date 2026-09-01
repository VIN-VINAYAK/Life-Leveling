const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODELS = [
  process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  'groq/compound',
  'openai/gpt-oss-120b'
];

export const getAIJSON = async ({ systemPrompt, userPrompt, maxTokens = 700 }) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const modelsToTry = [...new Set(DEFAULT_MODELS.filter(Boolean))];
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          temperature: 0.6,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `${systemPrompt} Respond with only valid JSON, no prose.`
            },
            { role: 'user', content: userPrompt }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API error (${response.status}): ${errorText.slice(0, 500)}`);
      }

      const data = await response.json();
      const rawContent = data?.choices?.[0]?.message?.content;

      if (!rawContent) {
        throw new Error('Groq response did not include a message payload');
      }

      try {
        return JSON.parse(rawContent);
      } catch (error) {
        console.error('Groq JSON parse failed', { rawContent, error: error.message });
        throw error;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Groq model attempt failed for ${model}:`, error.message);
    }
  }

  throw lastError || new Error('Groq AI request failed');
};
