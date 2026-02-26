// ============================================================
// CLOSE THE SKY — logger.js
// Batch event logging to Google Sheets via Apps Script
// ============================================================

const Logger = {
  _events: [],
  _sessionId: Math.random().toString(36).slice(2, 10),

  log(event, data = {}) {
    if (!CONFIG.ANALYTICS.ENABLED) return;
    this._events.push({
      timestamp: new Date().toISOString(),
      session_id: this._sessionId,
      event,
      ...data,
    });
  },

  async flush() {
    const url = CONFIG.ANALYTICS.SHEETS_WEBHOOK_URL;
    if (!url || url === 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') return;
    if (this._events.length === 0) return;

    const payload = [...this._events];
    this._events = [];

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: payload }),
      });
    } catch (e) {
      // Silent fail — never interrupt gameplay
      console.warn('Logger flush failed:', e);
    }
  },

  reset() { this._events = []; },
};
