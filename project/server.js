import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: allowedOrigin, credentials: false }));
app.use(express.json());

const SYSTEM_PROMPT = `You are Van Adhikar Assistant, a specialized FRA (Forest Rights Act, 2006) legal and technical assistant.
Goals:
- Provide accurate, up-to-date information about FRA 2006: individual and community forest rights, Gram Sabha processes, evidentiary requirements, timelines, authorities (FRC, SDLC, DLC), appeals, and implementation rules (2008 Rules, amendments, MoTA guidelines).
- Explain how to use the Van Adhikar web app: dashboard sections, submitting a claim, uploading evidence, viewing claim status, using the FRA Atlas, DSS tools, and digitized records.
- Be concise, trustworthy, and provide citations to sections/rules when possible. If uncertain, say so and suggest where to verify.
Tone: respectful, plain language. Audience includes forest-dwelling communities and facilitators.`;

app.post('/fra-chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing message' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Fallback placeholder when API key is not configured
      return res.json({
        answer: 'This is a placeholder response. Configure OPENAI_API_KEY in .env to enable AI answers. For now, I can still guide you about using the app: Open the Dashboard on the left, pick a section like FRA Rules or Forest Land Claims, and ask questions here to get help.'
      });
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(Array.isArray(history) ? history : []).slice(-10),
      { role: 'user', content: message }
    ];

    // Prefer official OpenAI SDK if available in deps
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      max_tokens: 600,
      messages
    });
    const answer = completion?.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
    return res.json({ answer });
  } catch (err) {
    return res.status(500).json({ error: 'Unexpected server error' });
  }
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.listen(port, () => {
  console.log(`FRA Chat server running on http://localhost:${port}`);
});


