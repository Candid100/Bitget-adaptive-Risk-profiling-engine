import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── In-memory portfolio store (replace with DB for production) ──────────────
const portfolios = new Map();

// ── Anthropic client ────────────────────────────────────────────────────────
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Routes ──────────────────────────────────────────────────────────────────

// Health check (Render uses this)
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

// AI Chat proxy — keeps API key server-side
app.post('/api/chat', async (req, res) => {
  const { system, messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: system || 'You are a helpful crypto portfolio analyst.',
      messages: messages.slice(-12), // keep last 12 turns
    });

    const reply = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    res.json({ reply });
  } catch (err) {
    console.error('Anthropic error:', err.message);
    res.status(502).json({ error: 'AI service unavailable', detail: err.message });
  }
});

// Save portfolio snapshot
app.post('/api/portfolio', (req, res) => {
  const id = randomUUID().slice(0, 8); // short ID
  const snapshot = { ...req.body, id, savedAt: new Date().toISOString() };
  portfolios.set(id, snapshot);

  // Keep store bounded — drop oldest if over 500
  if (portfolios.size > 500) {
    portfolios.delete(portfolios.keys().next().value);
  }

  res.json({ id, savedAt: snapshot.savedAt });
});

// Load portfolio snapshot
app.get('/api/portfolio/:id', (req, res) => {
  const snapshot = portfolios.get(req.params.id);
  if (!snapshot) return res.status(404).json({ error: 'Portfolio not found' });
  res.json(snapshot);
});

// List all saved snapshot IDs (useful for debugging)
app.get('/api/portfolios', (_req, res) => {
  const list = [...portfolios.values()].map(({ id, savedAt }) => ({ id, savedAt }));
  res.json({ count: list.length, portfolios: list });
});

// Catch-all → serve frontend (SPA fallback)
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Bitget Risk Dashboard running on port ${PORT}`);
  console.log(`   AI chat: ${process.env.ANTHROPIC_API_KEY ? '✅ enabled' : '⚠️  ANTHROPIC_API_KEY not set'}`);
});
