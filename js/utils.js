/**
 * ORNEVA LABS - Core Utilities
 * "The Origin of New Possibilities"
 */

// Global Configuration
const CONFIG = {
  APP_NAME: "Orneva Labs",
  TAGLINE: "The Origin of New Possibilities",
  SECONDARY_TAGLINE: "Learn something useful. Build something real.",
  UPI_ID: "9172750062@fam",
  PAYEE_NAME: "Orneva Labs",
  WHATSAPP_NUMBER: "9172750062",
  // Google Apps Script Web App URL (empty string defaults to seamless local engine)
  API_URL: "", 
  DEFAULT_CURRENCY: "₹",
  STORAGE_KEYS: {
    STUDENT_SESSION: "orneva_student_session",
    ADMIN_SESSION: "orneva_admin_session",
    LOCAL_DB: "orneva_local_db_v1",
    SETTINGS: "orneva_settings",
    THEME: "orneva_theme"
  }
};

// DOM Selectors
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

// Escape HTML for XSS prevention
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Currency Formatter
function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

// Date Formatter
function formatDate(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return String(dateInput);
  }
}

function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return String(dateInput);
  }
}

// Generate Unique Transaction Reference ID: ORN-YYYYMMDD-XXXXXX
function generateTransactionId() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ORN-${y}${m}${d}-${rand}`;
}

// Debounce Utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Toast Notification System
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('orneva-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'orneva-toast-container';
    container.className = 'orneva-toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `orneva-toast toast-${type}`;
  
  const iconMap = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff5722" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || iconMap.info}</span>
    <span class="toast-text">${escapeHtml(message)}</span>
    <button class="toast-close" aria-label="Close notification">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));

  const closeBtn = toast.querySelector('.toast-close');
  const dismiss = () => {
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  };

  closeBtn.addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

// Secure Client-side SHA-256 for password hash simulation (standard Web Crypto API)
async function hashPassword(plainText) {
  if (!plainText) return '';
  try {
    const encoder = typeof TextEncoder !== 'undefined' ? new TextEncoder() : (typeof require !== 'undefined' ? new (require('util').TextEncoder)() : null);
    if (!encoder) throw new Error("No TextEncoder");
    const data = encoder.encode("orneva_salt_" + plainText);
    const subtle = (typeof crypto !== 'undefined' && crypto.subtle) ? crypto.subtle : (typeof crypto !== 'undefined' && crypto.webcrypto && crypto.webcrypto.subtle ? crypto.webcrypto.subtle : (typeof require !== 'undefined' ? require('crypto').webcrypto.subtle : null));
    if (!subtle) throw new Error("No subtle crypto");
    const hashBuffer = await subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback simple hash for older environments
    let hash = 0;
    const str = "orneva_salt_" + plainText;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }
}

// Generate Dynamic UPI QR Code URL / Generator using standard QR Image API or Canvas
function generateUpiQrUrl(upiString, size = 260) {
  const encoded = encodeURIComponent(upiString);
  // High availability QR generator URL with dark / burnt-orange friendly parameters
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encoded}&size=${size}x${size}&margin=10&color=111318&bgcolor=ffffff`;
}

// Build UPI URI Scheme
function buildUpiUri(upiId, payeeName, amount, transactionRef, note = "Orneva Labs Course") {
  const cleanAmount = Number(amount).toFixed(2);
  const encodedPayee = encodeURIComponent(payeeName);
  const encodedNote = encodeURIComponent(note);
  return `upi://pay?pa=${upiId}&pn=${encodedPayee}&am=${cleanAmount}&cu=INR&tr=${transactionRef}&tn=${encodedNote}`;
}

// WhatsApp Link Generator
function buildWhatsAppLink(phone, message) {
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const fullPhone = cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone;
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${fullPhone}?text=${encodedMsg}`;
}

// Export utilities
window.OrnevaUtils = {
  CONFIG,
  $,
  $$,
  escapeHtml,
  formatCurrency,
  formatDate,
  formatDateTime,
  generateTransactionId,
  debounce,
  showToast,
  hashPassword,
  generateUpiQrUrl,
  buildUpiUri,
  buildWhatsAppLink
};
