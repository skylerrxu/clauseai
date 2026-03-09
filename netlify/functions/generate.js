const https = require('https');

exports.handler = async (event) => {
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
                        body: JSON.stringify({ error: 'API key not set in environment.' })
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
                        return {
                                    statusCode: 502,
                                    headers: corsHeaders(event),
                                    body: JSON.stringify({ error: 'Anthropic error ' + apiResponse.status + ': ' + apiResponse.body })
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
              return {
                        statusCode: 500,
                        headers: corsHeaders(event),
                        body: JSON.stringify({ error: 'Internal error: ' + err.message })
              };
      }
};

function corsHeaders(event) {
      const origin = (event.headers && event.headers.origin) || '';
      const allowed = [
              'https://clauseai.net',
              'https://www.clauseai.net',
              'https://euphonious-parfait-c16c7d.netlify.app',
              'http://localhost:8767',
              'http://127.0.0.1:8767'
            ];
      const allow = allowed.includes(origin) ? origin : allowed[0];
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
                                    'x-api-key': apiKey.trim(),
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
