/**
 * ai-client.js
 * Unified AI streaming client for ClauseAI.
 * Supports both Anthropic Claude and OpenAI APIs via SSE streaming.
 */

const AIClient = {
  provider: null,
  key: null,

  SYSTEM_PROMPTS: {
    IMPROVE: `You are a legal intake assistant. The user described a contract they need in rough terms.
Rewrite it as a concise structured intake brief — NOT a contract, NOT HTML.
Your output will be shown back in the user's text box so they can review it before clicking Generate.

Format EXACTLY as plain text with these 6 lines:
Parties: [contractor/provider name] and [client name]
Purpose: [one sentence describing the agreement]
Scope: • [deliverable 1] • [deliverable 2] • [deliverable 3]
Compensation: $[amount or range], [payment schedule e.g. 50% upfront, 50% on delivery]
Timeline: [start date] to [end date or duration]
Key Terms: [2-3 important terms e.g. IP ownership, confidentiality period, termination notice]

Use [bracketed placeholders] for any information the user did not provide.
Return ONLY the 6-line brief. No preamble, no explanation, no contract clauses, no HTML tags.`,

    GENERATE: `You are ClauseAI, a professional contract drafting assistant. Generate a complete, legally-sound contract based on the user's description.

QUALITY STANDARD: Produce a concise but complete contract — not overly long, but containing ALL required clauses. Use clear, plain language with specific terms. Model after professional retainer agreements.

REQUIRED SECTIONS — include ALL of these, adapted to the contract type:
1. Parties & Purpose — who is involved and what this agreement covers
2. Scope of Work / Services — specific deliverables or services (use bullet points)
3. Fees & Compensation — exact amounts with a specific payment schedule (milestone-based or date-based)
4. Costs & Expenses — who pays for additional costs beyond the stated fee
5. Term & Termination — duration, notice period (e.g. 14 days written notice), conditions for termination by either party
6. Right to Terminate — either party may terminate; contractor entitled to fees earned through termination date
7. Confidentiality — what information is kept confidential and for how long (e.g. 3 years)
8. Intellectual Property — who owns the work product; IP transfers to client upon full payment
9. Limitation of Liability — cap on damages (e.g. total fees paid under this agreement)
10. Dispute Resolution — binding arbitration under AAA rules; specify governing state law
11. Severability — if any provision is invalid, remaining provisions stay in full force
12. Entire Agreement — this agreement supersedes all prior verbal or written agreements
13. Signature Block — date line, both parties' signature lines with name, title, phone, email fields

CRITICAL: Always complete the full contract through the Signature Block. Never truncate.

Use [bracketed placeholders] for any info not provided by the user (names, amounts, dates, jurisdiction, etc.).
Use HTML: <h1> for contract title, <h2> for section headers, <p> for paragraphs, <ul><li> for bullet lists, <strong> for defined terms. No inline styles.

OUTPUT FORMAT — respond EXACTLY as:
CONTRACT_HTML_START
[complete contract HTML here — include ALL 13 sections through signature block]
CONTRACT_HTML_END`,

    REFINE: `You are a legal contract advisor for ClauseAI. The user has a generated contract and wants to ask questions about it.

Answer clearly and helpfully. You may quote relevant sections of the contract. Do NOT output updated contract HTML — the contract is read-only in this chat.

Keep answers concise (2-5 sentences). Be practical and plain-spoken, not overly legalistic.

If the user asks you to make a change to the contract, tell them: "To edit the contract, select the text you want to change in the document and use the AI Edit popover that appears."

The current contract will be provided as context in the system message.`,

    INLINE_EDIT: "You are editing a specific clause in a legal contract. The user has selected text and given an instruction. Return ONLY the replacement text. Match the legal tone and formality of the original exactly. No explanation, no preamble, no quotation marks around the response."
  },

  /**
   * Re-reads provider and API key from localStorage.
   * Call this after the user updates settings.
   */
  reload() {
    this.provider = localStorage.getItem('signflow_provider') || 'claude';
    this.key = localStorage.getItem('signflow_api_key') || '';
  },

  /**
   * Unified streaming interface.
   * @param {Array}  messages     - Array of {role, content} message objects.
   * @param {string} systemPrompt - System prompt string.
   * @param {Object} callbacks    - { onChunk(text), onComplete(fullText), onError(err) }
   */
  async stream(messages, systemPrompt, { onChunk, onComplete, onError } = {}) {
    // Always read fresh values at call time.
    this.reload();

    if (!this.key) {
      const err = new Error('No API key configured. Please open Settings and enter your API key.');
      if (onError) onError(err);
      return;
    }

    try {
      if (this.provider === 'openai') {
        await this._streamOpenAI(messages, systemPrompt, { onChunk, onComplete, onError });
      } else {
        await this._streamClaude(messages, systemPrompt, { onChunk, onComplete, onError });
      }
    } catch (err) {
      if (onError) onError(err);
    }
  },

  /**
   * Stream from Anthropic Claude API.
   * @private
   */
  async _streamClaude(messages, systemPrompt, callbacks) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 8192,
        stream: true,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      let errorBody = '';
      try { errorBody = await response.text(); } catch (_) {}
      throw new Error(`Claude API error ${response.status}: ${errorBody}`);
    }

    await this._readSSE(response, (parsed) => {
      if (
        parsed.type === 'content_block_delta' &&
        parsed.delta &&
        typeof parsed.delta.text === 'string'
      ) {
        return parsed.delta.text;
      }
      return null;
    }, callbacks);
  },

  /**
   * Stream from OpenAI API.
   * @private
   */
  async _streamOpenAI(messages, systemPrompt, callbacks) {
    const systemMessage = { role: 'system', content: systemPrompt };
    const allMessages = [systemMessage, ...messages];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + this.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 4096,
        stream: true,
        messages: allMessages
      })
    });

    if (!response.ok) {
      let errorBody = '';
      try { errorBody = await response.text(); } catch (_) {}
      throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
    }

    await this._readSSE(response, (parsed) => {
      const delta = parsed.choices &&
                    parsed.choices[0] &&
                    parsed.choices[0].delta;
      if (delta && typeof delta.content === 'string') {
        return delta.content;
      }
      return null;
    }, callbacks);
  },

  /**
   * Shared SSE reader that handles chunked data split across multiple reads.
   *
   * @param {Response}  response    - Fetch Response with a ReadableStream body.
   * @param {Function}  extractFn   - (parsedJSON) => string|null  Extracts text from a parsed SSE event.
   * @param {Object}    callbacks   - { onChunk, onComplete, onError }
   * @private
   */
  async _readSSE(response, extractFn, { onChunk, onComplete, onError } = {}) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';          // Holds incomplete line data between reads.
    let fullText = '';        // Accumulates all extracted text.

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        // Decode the incoming chunk and append to the buffer.
        buffer += decoder.decode(value, { stream: true });

        // Split on newlines but keep track of any trailing incomplete line.
        const lines = buffer.split('\n');

        // The last element is either an empty string (if the chunk ended with \n)
        // or an incomplete line that must be carried forward.
        buffer = lines.pop();

        for (const rawLine of lines) {
          const line = rawLine.trimEnd(); // Preserve leading spaces (rare in SSE) but trim \r.

          // Blank lines are SSE event separators; skip them.
          if (line === '') continue;

          // We only process "data:" lines.
          if (!line.startsWith('data:')) continue;

          const dataStr = line.slice(5).trim();

          // OpenAI sends "[DONE]" to signal end of stream.
          if (dataStr === '[DONE]') continue;

          let parsed;
          try {
            parsed = JSON.parse(dataStr);
          } catch (_) {
            // Malformed JSON in SSE data — skip this line.
            continue;
          }

          const text = extractFn(parsed);
          if (text !== null && text !== undefined && text !== '') {
            fullText += text;
            if (onChunk) onChunk(text);
          }
        }
      }

      // Flush the decoder's internal state for any remaining bytes.
      const remaining = decoder.decode();
      if (remaining) {
        buffer += remaining;
      }

      // Process any final data left in the buffer after the stream closes.
      if (buffer.trim()) {
        const line = buffer.trim();
        if (line.startsWith('data:')) {
          const dataStr = line.slice(5).trim();
          if (dataStr && dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr);
              const text = extractFn(parsed);
              if (text !== null && text !== undefined && text !== '') {
                fullText += text;
                if (onChunk) onChunk(text);
              }
            } catch (_) {}
          }
        }
      }

      if (onComplete) onComplete(fullText);

    } catch (err) {
      // Attempt to cancel the reader to release the lock before propagating.
      try { reader.cancel(); } catch (_) {}
      if (onError) {
        onError(err);
      } else {
        throw err;
      }
    }
  }
};

// Eagerly load settings so the object is ready before any call.
AIClient.reload();
