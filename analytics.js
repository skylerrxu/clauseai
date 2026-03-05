/**
 * analytics.js
 * Anonymous usage tracking for SignFlow via Supabase REST API.
 * All tracking is silent — errors are caught and suppressed so that
 * analytics failures never affect the user experience.
 */

const Analytics = {
  // Replace these placeholder values with your actual Supabase project details.
  supabaseUrl: 'https://rgxujtzhsycsrvfnxylg.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJneHVqdHpoc3ljc3J2Zm54eWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MzUwMzAsImV4cCI6MjA4ODMxMTAzMH0.k9S6GDHdROKH2d92bzIMxCE_TYTbr6f4nsGOycJr5ZU',

  /**
   * Stable anonymous session identifier.
   * Persists for the duration of the browser tab session.
   */
  sessionId: (() => {
    const storageKey = 'sf_session';
    let id = sessionStorage.getItem(storageKey);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(storageKey, id);
    }
    return id;
  })(),

  /**
   * Track an analytics event.
   * @param {string} eventType - Short event identifier (e.g. 'generate', 'export').
   * @param {Object} extra     - Additional key/value pairs to include in the event row.
   */
  async track(eventType, extra = {}) {
    // Bail out silently if Supabase has not been configured yet.
    if (this.supabaseUrl.includes('YOUR_PROJECT')) return;

    try {
      await fetch(`${this.supabaseUrl}/rest/v1/events`, {
        method: 'POST',
        headers: {
          'apikey': this.supabaseAnonKey,
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          event_type: eventType,
          session_id: this.sessionId,
          ...extra
        })
      });
    } catch (_) {
      // Silent fail — analytics must never disrupt the application.
    }
  },

  // ---------------------------------------------------------------------------
  // Convenience tracking methods
  // ---------------------------------------------------------------------------

  /**
   * Track a prompt-improvement action.
   * @param {string} provider - 'claude' or 'openai'
   */
  trackImprove(provider) {
    return this.track('improve', { provider });
  },

  /**
   * Track a contract generation action.
   * @param {string} provider      - 'claude' or 'openai'
   * @param {string} contractType  - Free-form contract type label (e.g. 'freelancer', 'service').
   */
  trackGenerate(provider, contractType) {
    return this.track('generate', { provider, contract_type: contractType });
  },

  /**
   * Track a contract refinement (chat-style edit) action.
   * @param {string} provider - 'claude' or 'openai'
   */
  trackRefine(provider) {
    return this.track('refine', { provider });
  },

  /**
   * Track an inline text-selection edit action.
   * @param {string} provider - 'claude' or 'openai'
   */
  trackInlineEdit(provider) {
    return this.track('inline_edit', { provider });
  },

  /**
   * Track a contract export action.
   * @param {string} provider - 'claude' or 'openai'
   * @param {string} format   - Export format, e.g. 'pdf', 'docx', 'html'.
   */
  trackExport(provider, format) {
    return this.track('export', { provider, format });
  }
};
