# Sophie Chatbot

A small, secure chatbot API that answers questions about Sofiya Mohammed Hassen's portfolio. It is one serverless function with no dependencies, deployed on Vercel and called by the portfolio website.

## How it works
Browser (portfolio) → POST /api/chat → Vercel function → Gemini API → reply.
The Gemini key stays on the server. Sophie's knowledge and rules are in `api/chat.js`.

## Security
- API key only in the server environment (GEMINI_API_KEY), never in the browser.
- CORS allow-list: only the portfolio site (and localhost) may call it.
- Input validation: max 20 messages, 500 characters each, roles checked.
- Per-IP rate limit: 15 requests per minute.
- Prompt-injection rules in the system prompt; answers come only from the provided knowledge.
- Logs contain only error status and messages, never visitor text or the key.

## Run the tests
`node test.js`

## Deploy
1. Push this repo to GitHub.
2. Import it in Vercel as a new project (Framework Preset: Other).
3. Add the environment variable GEMINI_API_KEY, then redeploy.
4. Open /api/chat in the browser. You should see {"ok":true,"hasKey":true,...}.
5. Open the site root (/) to try the test chat page.

## Update what Sophie knows
Edit the CONTENT text at the top of `api/chat.js`, commit and push.
