// Utilities: INR formatting, dates, storage, CSV, toast

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
const INR_NUM = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function inr(amount) {
  const n = Number(amount || 0);
  return INR.format(n);
}
export function inrNum(amount) {
  const n = Number(amount || 0);
  return INR_NUM.format(n);
}

export function nowISO() { return new Date().toISOString(); }
export function fmtDateTime(iso) { const d = new Date(iso); return d.toLocaleString('en-IN'); }

export const store = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key) { localStorage.removeItem(key); }
};

export function toast(msg, ms = 2500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, ms);
}

export function csvExport(rows, filename = 'statements.csv') {
  if (!rows || !rows.length) return toast('Nothing to export');
  const esc = (s) => String(s).replaceAll('"', '""');
  const header = Object.keys(rows[0]);
  const content = [header.join(','), ...rows.map(r => header.map(h => `"${esc(r[h])}"`).join(','))].join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function validateIFSC(ifsc) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(String(ifsc || '').trim());
}

// Phone helpers: normalize and validate real-world formats (+91, +254, local 0..., plain 10 digits)
export function normalizePhone(input) {
  if (!input) return '';
  let s = String(input).trim();
  // Allow spaces/dashes; keep leading + if present
  const hasPlus = s.startsWith('+');
  s = s.replace(/[\s-]/g, '');
  if (!hasPlus) s = s.replace(/[^0-9]/g, '');
  return s;
}
export function validatePhone(input) {
  const s = normalizePhone(input);
  // Accept patterns:
  // +91XXXXXXXXXX (10 digits)
  // +254XXXXXXXXX (9 digits)
  // 0XXXXXXXXX or 0XXXXXXXXXX (9–10 digits)
  // XXXXXXXXXX (10 digits)
  if (/^\+91[0-9]{10}$/.test(s)) return true;
  if (/^\+254[0-9]{9}$/.test(s)) return true;
  if (/^0[0-9]{9,10}$/.test(s)) return true;
  if (/^[0-9]{10}$/.test(s)) return true;
  return false;
}

// Demo-level hashing for PIN (non-cryptographic; for learning only)
export function simpleHash(str) {
  const s = String(str || '');
  let h = 5381;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) + h) + s.charCodeAt(i); }
  // Return hex-like string
  return 'h' + (h >>> 0).toString(16);
}

// HTML escaping to prevent XSS (for user-entered text)
export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function validatePAN(p) { return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(String(p || '').trim()); }
export function validateAadhaar(a) { return /^[0-9]{12}$/.test(String(a || '').trim()); }

export function uid(prefix = 'id') { return `${prefix}_${Math.random().toString(36).slice(2, 8)}`; }