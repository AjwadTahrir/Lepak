const MODEL = () => process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

// Text-only JSON calls (Groq's OpenAI-compatible API). Poster images stay on Gemini.
// Retries 429/503 and timeouts, same as callGemini.
// system (optional): rules the model weighs above the user turn. Put untrusted text in
// `prompt` and the instructions in `system`, so the text can't pose as instructions.
export async function callGroq(prompt, { system, timeoutMs = 10_000, attempts = 2 } = {}) {
  const body = JSON.stringify({
    model: MODEL(),
    messages: [...(system ? [{ role: 'system', content: system }] : []), { role: 'user', content: prompt }],
    response_format: { type: 'json_object' },        // prompt must mention JSON, which ours do
    temperature: 0.1,
  });

  let res;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const last = attempt === attempts - 1;
    try {
      res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
        body,
        signal: AbortSignal.timeout(timeoutMs),      // fresh signal on every attempt
      });
    } catch (e) {
      if (e.name !== 'TimeoutError' || last) throw e;
      console.warn(`Groq timed out after ${timeoutMs / 1000}s, retrying`);
      continue;
    }
    if ((res.status !== 503 && res.status !== 429) || last) break;
    await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
  }
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const text = json.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned no content');
  return JSON.parse(text);
}
