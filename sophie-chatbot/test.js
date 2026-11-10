// Offline tests with a fake Gemini. Run: node test.js
const assert = require('assert');
process.env.GEMINI_API_KEY = 'test-key';
let calls = [];
global.fetch = async (url, opts) => {
  calls.push({ url, opts });
  return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Hello from Sophie' }] } }] }) };
};
const handler = require('./api/chat.js');
function run(method, body, headers = {}) {
  return new Promise((resolve) => {
    const res = { code: 200, h: {}, status(c) { this.code = c; return this; }, setHeader(k, v) { this.h[k] = v; return this; },
      send(b) { resolve({ code: this.code, body: JSON.parse(b), h: this.h }); }, end() { resolve({ code: this.code, h: this.h }); } };
    handler({ method, body, headers: { 'x-forwarded-for': headers.ip || '1.1.1.1', origin: headers.origin } }, res);
  });
}
(async () => {
  let r = await run('GET'); assert.strictEqual(r.body.hasKey, true);
  r = await run('POST', { messages: [{ role: 'user', content: 'What does Sofiya do?' }] }, { origin: 'https://sofiya-portfolio.vercel.app', ip: '2.2.2.2' });
  assert.strictEqual(r.code, 200); assert.strictEqual(r.body.reply, 'Hello from Sophie');
  assert.strictEqual(r.h['Access-Control-Allow-Origin'], 'https://sofiya-portfolio.vercel.app');
  const sent = JSON.parse(calls[0].opts.body);
  assert.ok(sent.systemInstruction.parts[0].text.includes('Terraform Cloud Library'));
  assert.strictEqual(calls[0].opts.headers['x-goog-api-key'], 'test-key');
  assert.strictEqual(sent.contents[0].role, 'user');
  r = await run('POST', { messages: [{ role: 'user', content: 'x'.repeat(501) }] }, { ip: '3.3.3.3' }); assert.strictEqual(r.code, 400);
  r = await run('POST', { messages: [] }, { ip: '3.3.3.3' }); assert.strictEqual(r.code, 400);
  r = await run('POST', { messages: [{ role: 'assistant', content: 'hi' }] }, { ip: '3.3.3.3' }); assert.strictEqual(r.code, 400);
  r = await run('POST', { messages: [{ role: 'user', content: 'hi' }] }, { origin: 'https://evil.example', ip: '4.4.4.4' }); assert.strictEqual(r.code, 403);
  let last; for (let i = 0; i < 17; i++) last = await run('POST', { messages: [{ role: 'user', content: 'hi' }] }, { ip: '5.5.5.5' });
  assert.strictEqual(last.code, 429);
  delete process.env.GEMINI_API_KEY;
  r = await run('POST', { messages: [{ role: 'user', content: 'hi' }] }, { ip: '6.6.6.6' }); assert.strictEqual(r.code, 500);
  r = await run('PUT'); assert.strictEqual(r.code, 405);
  console.log('All tests passed');
})().catch((e) => { console.error(e); process.exit(1); });
