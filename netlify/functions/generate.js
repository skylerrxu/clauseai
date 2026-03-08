/**
 * generate.js — Netlify serverless function
 * Proxies contract generation requests to the Anthropic Claude API.
 * The API key lives in a Netlify environment variable (CLAUDE_API_KEY) and
 * is never exposed to the browser.
 */

const https = require('https');

exports.handler = async (event) => {
    // Only allow POST
    if (event.httpMethod === 'OPTIONS') {
          return { statusCode: 200, headers: corsHeaders(event), body: '' };
    }
    if (event.httpMethod !== 'POST') {
          return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
          return {
                  statusCode: 500,
                  headers: corsHeaders(event),
                  body: JSON.stringify({ error: 'Server configuration error — API key not set.' })
          };
    }

    let messages, systemPrompt;
    try {
          const parsed = JSON.parse(event.body);
          messages = parsed.messages;
          systemPrompt = parsed.systemPrompt;
          if (!messages || !systemPrompt) throw new Error('Missing fields');
    } catch (e) {
          return {
                  statusCode: 400,
                  headers: corsHeaders(event),
                  body: JSON.stringify({ error: 'Invalid request body.' })
          };
    }

    const requestBody = JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 4096,
          system: systemPrompt,
          messages
    });

    try {
          const apiResponse = await callClaude(apiKey, requestBody);
          if (apiResponse.status !== 200) {
                  console.error('Claude API error:', apiResponse.body);
                  return {
                            statusCode: apiResponse.status,
                            headers: corsHeaders(event),
                            body: JSON.stringify({ error: 'Claude API returned an error. Please try again.' })
                  };
          }
          const data = JSON.parse(apiResponse.body);
          const content = data.content && data.content[0] && data.content[0].text;
          if (!content) {
                  return {
                            statusCode: 500,
                            headers: corsHeaders(event),
                            body: JSON.stringify({ error: 'Empty response from Claude.' })
                  };
          }
          return {
                  statusCode: 200,
                  headers: corsHeaders(event),
                  body: JSON.stringify({ content })
          };
    } catch (err) {
          console.error('Proxy error:', err);
          return {
                  statusCode: 500,
                  headers: corsHeaders(event),
                  body: JSON.stringify({ error: 'Internal server error: ' + err.message })
          };
    }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function corsHeaders(event) {
    const origin = (event.headers && event.headers.origin) || '';
    const allowed = [
          'https://clauseai.net',
          'https://www.clauseai.net',
          'http://localhost:8767',
          'http://127.0.0.1:8767'
        ];
    const allow = allowed.includes(origin) ? origin : 'https://clauseai.net';
    return {
          'Access-Control-Allow-Origin': allow,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
    };
}

function callClaude(apiKey, body) {
    return new Promise((resolve, reject) => {
          const options = {
                  hostname: 'api.anthropic.com',
                  path: '/v1/messages',
                  method: 'POST',
                  headers: {
                            'x-api-key': apiKey,
                            'anthropic-version': '2023-06-01',
                            'content-type': 'application/json',
                            'content-length': Buffer.byteLength(body)
                  }
          };
          const req = https.request(options, (res) => {
                  let data = '';
                  res.on('data', chunk => { data += chunk; });
                  res.on('end', () => { resolve({ status: res.statusCode, body: data }); });
          });
          req.on('error', reject);
          req.write(body);
          req.end();
    });
}
