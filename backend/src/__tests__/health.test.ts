import express from 'express';
import request from 'supertest';

describe('health', () => {
  it('returns ok', async () => {
    const app = express();
    app.get('/health', (_req, res) => res.json({ ok: true }));
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
