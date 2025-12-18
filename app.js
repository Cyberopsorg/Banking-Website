// ============ IMPORTS ============
import { store, toast, uid, nowISO, normalizePhone, validatePhone, simpleHash, inr, escapeHtml } from './utils.js'
import { VALIDATION, ERRORS } from './constants.js'

// ============ STATE ============
const state = {
  user: null,
  acc: { name: 'Main Account', balance: 0, accNumber: null },
  ledger: [],
  searchQuery: '',
  pendingAction: false // Debounce flag for rapid clicks
};

// ============ DEBOUNCE HELPER ============
function withDebounce(callback) {
  if (state.pendingAction) {
    showToast('Please wait...');
    return false;
  }
  state.pendingAction = true;
  setTimeout(() => { state.pendingAction = false; }, VALIDATION.DEBOUNCE_TIME);
  return callback();
}

// ============ STORAGE ============
function loadState() {
  state.user = store.get('bb_user', null);
  state.acc = store.get('bb_acc', { name: 'Main Account', balance: 0, accNumber: null });
  state.ledger = store.get('bb_ledger', []);
  
  // Safety check: ensure ledger is always an array
  if (!Array.isArray(state.ledger)) {
    state.ledger = [];
    saveState();
  }
  
  // Safety check: ensure balance is a number
  if (state.acc && typeof state.acc.balance !== 'number') {
    state.acc.balance = 0;
    saveState();
  }
}

function saveState() {
  if (state.user) {
    store.set('bb_user', state.user);
  }
  store.set('bb_acc', state.acc);
  store.set('bb_ledger', state.ledger);
}

// ============ UI HELPERS ============
function showSection(id) {
  document.querySelectorAll('.tab-section').forEach(s => {
    s.classList.toggle('active', s.id === id);
  });
}

function showError(errorId, message, suggestion = '') {
  const el = document.getElementById(errorId);
  if (el) {
    el.textContent = suggestion ? `${message} ${suggestion}` : message;
  }
}

function clearError(errorId) {
  const el = document.getElementById(errorId);
  if (el) el.textContent = '';
}

function clearAllErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

function setInvalid(inputId) {
  const el = document.getElementById(inputId);
  if (el) el.classList.add('is-invalid');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2500);
}

function generateAccountNumber() {
  const rand = () => Math.floor(1000 + Math.random() * 9000);
  return `${rand()}-${rand()}-${rand()}`;
}

function updateAccountNumber() {
  const el = document.getElementById('accNumber');
  if (el && state.acc.accNumber) {
    el.textContent = state.acc.accNumber;
  }
}

function setButtonLoading(btn, loading) {
  if (!btn) return;
  if (loading) {
    btn.classList.add('loading');
    btn.disabled = true;
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
  }
}

// ============ VALIDATION ============
function validateAmount(value, errorId, checkBalance = false) {
  if (errorId) clearError(errorId);
  
  const strValue = String(value || '').trim();
  
  // Check for empty input
  if (!strValue) {
    if (errorId) showError(errorId, ERRORS.AMOUNT_REQUIRED);
    return { valid: false, amount: 0 };
  }
  
  const amt = Number(strValue);
  
  // Check for non-numeric input
  if (isNaN(amt)) {
    if (errorId) showError(errorId, 'Enter a valid number');
    return { valid: false, amount: 0 };
  }
  
  // Check for zero or negative
  if (amt <= 0) {
    if (errorId) showError(errorId, ERRORS.AMOUNT_NEGATIVE, 'Example: 500 or 1000');
    return { valid: false, amount: 0 };
  }
  
  // Check for excessively large amounts
  if (amt > VALIDATION.AMOUNT_MAX) {
    if (errorId) showError(errorId, ERRORS.AMOUNT_TOO_LARGE);
    return { valid: false, amount: 0 };
  }
  
  // Check decimal places
  const decimalPart = strValue.split('.')[1];
  if (decimalPart && decimalPart.length > VALIDATION.AMOUNT_DECIMALS) {
    if (errorId) showError(errorId, ERRORS.AMOUNT_TOO_MANY_DECIMALS);
    return { valid: false, amount: 0 };
  }
  
  // Round to 2 decimal places for consistency
  const roundedAmt = Math.round(amt * 100) / 100;
  
  // Check balance if needed
  if (checkBalance && roundedAmt > state.acc.balance) {
    if (errorId) showError(errorId, ERRORS.INSUFFICIENT_BALANCE, `Available: ${inr(state.acc.balance)}`);
    return { valid: false, amount: roundedAmt };
  }
  
  return { valid: true, amount: roundedAmt };
}

function validateName(name, errorId) {
  if (errorId) clearError(errorId);
  
  const trimmed = (name || '').trim();
  
  if (!trimmed) {
    if (errorId) showError(errorId, 'Enter your name');
    return { valid: false, name: '', error: 'Enter your name' };
  }
  
  if (trimmed.length < VALIDATION.NAME_MIN_LENGTH) {
    if (errorId) showError(errorId, ERRORS.NAME_TOO_SHORT);
    return { valid: false, name: trimmed, error: ERRORS.NAME_TOO_SHORT };
  }
  
  if (trimmed.length > VALIDATION.NAME_MAX_LENGTH) {
    if (errorId) showError(errorId, ERRORS.NAME_TOO_LONG);
    return { valid: false, name: trimmed, error: ERRORS.NAME_TOO_LONG };
  }
  
  // Check for potentially dangerous characters
  if (/<|>|&|"|'/.test(trimmed)) {
    if (errorId) showError(errorId, ERRORS.INVALID_NAME);
    return { valid: false, name: trimmed, error: ERRORS.INVALID_NAME };
  }
  
  return { valid: true, name: trimmed, error: null };
}

function validateMobileEnhanced(input, errorId) {
  if (errorId) clearError(errorId);
  
  const raw = String(input || '').trim();
  
  // Empty check
  if (!raw) {
    if (errorId) showError(errorId, ERRORS.INVALID_MOBILE, ERRORS.MOBILE_HINT);
    return { valid: false, mobile: '' };
  }
  
  // Check for multiple + signs or + in wrong place
  if (/^\++/.test(raw) || /\+.*\+/.test(raw)) {
    if (errorId) showError(errorId, ERRORS.INVALID_MOBILE_CHARS, 'Only one + allowed at start');
    return { valid: false, mobile: '' };
  }
  
  // Check for invalid characters (allow digits, spaces, dashes, and leading +)
  const cleaned = raw.replace(/[\s-]/g, '');
  if (cleaned.startsWith('+')) {
    if (!/^\+[0-9]+$/.test(cleaned)) {
      if (errorId) showError(errorId, ERRORS.INVALID_MOBILE_CHARS);
      return { valid: false, mobile: '' };
    }
  } else {
    if (!/^[0-9]+$/.test(cleaned)) {
      if (errorId) showError(errorId, ERRORS.INVALID_MOBILE_CHARS);
      return { valid: false, mobile: '' };
    }
  }
  
  const mobile = normalizePhone(raw);
  
  if (!validatePhone(mobile)) {
    if (errorId) showError(errorId, ERRORS.INVALID_MOBILE, ERRORS.MOBILE_HINT);
    return { valid: false, mobile: '' };
  }
  
  return { valid: true, mobile };
}

// ============ PROFILE ============
function updateProfile() {
  const nameEl = document.getElementById('profileName');
  const mobileEl = document.getElementById('profileMobile');
  const accNumEl = document.getElementById('profileAccNum');
  
  if (nameEl && state.user) nameEl.textContent = state.user.name;
  if (mobileEl && state.user) mobileEl.textContent = state.user.mobile;
  if (accNumEl && state.acc) accNumEl.textContent = state.acc.accNumber || '-';
}

// ============ SKELETONS ============
function showSkeletons() {
  document.getElementById('balanceSkeleton')?.style.setProperty('display', 'block');
  document.getElementById('accBalance')?.style.setProperty('display', 'none');
  document.getElementById('txSkeleton')?.style.setProperty('display', 'block');
  document.getElementById('txTable')?.style.setProperty('display', 'none');
}

function hideSkeletons() {
  setTimeout(() => {
    document.getElementById('balanceSkeleton')?.style.setProperty('display', 'none');
    document.getElementById('accBalance')?.style.setProperty('display', 'block');
    document.getElementById('txSkeleton')?.style.setProperty('display', 'none');
    const txTable = document.getElementById('txTable');
    const txEmpty = document.getElementById('txEmpty');
    if (state.ledger && state.ledger.length > 0) {
      txTable?.style.setProperty('display', 'table');
      txEmpty?.style.setProperty('display', 'none');
    } else {
      txTable?.style.setProperty('display', 'none');
      txEmpty?.style.setProperty('display', 'block');
    }
  }, 500);
}

// ============ ANIMATIONS ============
function animateCountUp(element, targetValue, duration = 1000) {
  const startValue = 0;
  const startTime = performance.now();
  
  element.classList.add('counting');
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = startValue + (targetValue - startValue) * easeProgress;
    
    element.textContent = inr(Math.floor(currentValue));
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = inr(targetValue);
      element.classList.remove('counting');
    }
  }
  
  requestAnimationFrame(update);
}

// ============ WELCOME BANNER ============
function showWelcomeBanner(isNewLogin = false) {
  const banner = document.getElementById('welcomeBanner');
  const welcomeText = document.getElementById('welcomeText');
  const lastLoginText = document.getElementById('lastLoginText');
  
  if (!banner || !state.user) return;
  
  if (isNewLogin) {
    welcomeText.textContent = `Welcome back, ${state.user.name}! 👋`;
  } else {
    welcomeText.textContent = `Welcome, ${state.user.name}!`;
  }
  
  const lastLogin = store.get('bb_last_login', null);
  if (lastLogin && isNewLogin) {
    const lastDate = new Date(lastLogin);
    lastLoginText.textContent = `Last login: ${lastDate.toLocaleString('en-IN')}`;
  } else {
    lastLoginText.textContent = '';
  }
  
  banner.style.display = 'flex';
}

// ============ TUTORIAL ============
function showTutorial() {
  const hasSeenTutorial = store.get('bb_tutorial_seen', false);
  if (!hasSeenTutorial) {
    document.getElementById('tutorialModal').style.display = 'flex';
  }
}

document.getElementById('closeTutorial')?.addEventListener('click', () => {
  document.getElementById('tutorialModal').style.display = 'none';
  store.set('bb_tutorial_seen', true);
});

document.getElementById('closeBanner')?.addEventListener('click', () => {
  document.getElementById('welcomeBanner').style.display = 'none';
});

document.getElementById('printStmtBtn')?.addEventListener('click', () => {
  window.print();
});

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', (e) => {
  // Escape to close modals
  if (e.key === 'Escape') {
    document.getElementById('tutorialModal').style.display = 'none';
  }
  
  // Enter to submit forms
  if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
    const form = e.target.closest('form');
    if (form) {
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn && document.activeElement !== submitBtn) {
        // Form will handle submit naturally
      }
    }
  }
});

// ============ LARGE TRANSACTION CONFIRMATION ============
function confirmLargeTransaction(amount, type) {
  return new Promise((resolve) => {
    if (amount < VALIDATION.LARGE_TRANSACTION_THRESHOLD) {
      resolve(true);
      return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal confirm-modal';
    modal.innerHTML = `
      <div class="modal-content confirm-content">
        <h2>⚠️ Large ${type}</h2>
        <p>You are about to ${type.toLowerCase()} <strong>${inr(amount)}</strong></p>
        <p class="hint">This is above the ₹${VALIDATION.LARGE_TRANSACTION_THRESHOLD.toLocaleString('en-IN')} threshold.</p>
        <div class="confirm-actions">
          <button class="btn-primary confirm-yes">Yes, proceed</button>
          <button class="btn-secondary confirm-no">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.confirm-yes').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(true);
    });
    
    modal.querySelector('.confirm-no').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(false);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        resolve(false);
      }
    });
    
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        document.removeEventListener('keydown', escHandler);
        resolve(false);
      }
    };
    document.addEventListener('keydown', escHandler);
  });
}

// ============ BALANCE & CREDIT ============
function updateBalance(animate = false) {
  const el = document.getElementById('accBalance');
  if (!el) return;
  
  if (animate) {
    animateCountUp(el, state.acc.balance);
  } else {
    el.textContent = inr(state.acc.balance);
  }
  
  el.classList.add('highlight-pulse');
  setTimeout(() => el.classList.remove('highlight-pulse'), 1000);
}

function updateCreditScore() {
  const scoreEl = document.getElementById('creditScoreValue');
  const labelEl = document.getElementById('creditScoreLabel');
  const barEl = document.getElementById('creditScoreBar');
  if (!scoreEl) return;

  const balance = state.acc.balance;
  let score;
  if (balance <= 0) score = 300;
  else if (balance < 1000) score = 350 + Math.floor(balance / 10);
  else if (balance < 5000) score = 450 + Math.floor((balance - 1000) / 40);
  else if (balance < 10000) score = 550 + Math.floor((balance - 5000) / 50);
  else if (balance < 25000) score = 650 + Math.floor((balance - 10000) / 150);
  else if (balance < 50000) score = 750 + Math.floor((balance - 25000) / 500);
  else score = Math.min(850, 800 + Math.floor((balance - 50000) / 2000));

  let label, cssClass, color;
  if (score >= 750) { label = 'Excellent'; cssClass = 'excellent'; color = '#059669'; }
  else if (score >= 650) { label = 'Good'; cssClass = 'good'; color = '#10b981'; }
  else if (score >= 500) { label = 'Fair'; cssClass = 'fair'; color = '#f59e0b'; }
  else { label = 'Poor'; cssClass = 'poor'; color = '#ef4444'; }

  scoreEl.textContent = score;
  scoreEl.className = 'score ' + cssClass;
  labelEl.textContent = `${label} - Based on ₹${balance.toLocaleString('en-IN')} balance`;
  barEl.style.width = ((score - 300) / 550 * 100) + '%';
  barEl.style.background = color;
}

// ============ TRANSACTIONS ============
function updateTransactions() {
  const tbody = document.querySelector('#txTable tbody');
  const emptyEl = document.getElementById('txEmpty');
  if (!tbody) return;

  let filtered = state.ledger || [];
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(r => 
      r.type.toLowerCase().includes(q) ||
      (r.ref && r.ref.toLowerCase().includes(q)) ||
      String(r.amount).includes(q)
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    if (emptyEl) {
      if (state.searchQuery && state.ledger.length > 0) {
        emptyEl.innerHTML = '<div class="no-results"><div class="no-results-icon">🔍</div><p>No matching transactions</p><p class="hint">Try a different search term</p></div>';
      } else {
        emptyEl.innerHTML = '<div class="empty-icon">📭</div><p>No transactions yet</p><p class="hint">Make your first deposit to get started!</p>';
      }
      emptyEl.style.display = 'block';
    }
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  tbody.innerHTML = filtered.slice(0, 20).map(r => {
    const badgeClass = r.type === 'Deposit' ? 'deposit' : r.type === 'Transfer' ? 'transfer' : 'withdraw';
    return `<tr>
      <td><span class="badge ${badgeClass}">${r.type}</span>${r.ref ? `<br><small style="color:#6b7280">${r.ref}</small>` : ''}</td>
      <td>${inr(r.amount)}</td>
      <td>${new Date(r.dt).toLocaleString()}</td>
      <td>${inr(r.balance)}</td>
    </tr>`;
  }).join('');
}

// ============ REFRESH UI ============
function refreshUI(animate = false) {
  updateBalance(animate);
  updateCreditScore();
  updateTransactions();
  updateAccountNumber();
  updateProfile();
  hideSkeletons();
}

// ============ AUTH: SIGNUP ============
document.getElementById('signup-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  clearAllErrors();

  const nameInput = document.getElementById('su-name').value;
  const mobileInput = document.getElementById('su-mobile').value;
  const pin = document.getElementById('su-pin').value.trim();

  let hasError = false;

  // Validate name
  const nameResult = validateName(nameInput, 'su-name-error');
  if (!nameResult.valid) {
    setInvalid('su-name');
    hasError = true;
  }

  // Validate mobile
  const mobileResult = validateMobileEnhanced(mobileInput, 'su-mobile-error');
  if (!mobileResult.valid) {
    setInvalid('su-mobile');
    hasError = true;
  }

  // Validate PIN
  if (!VALIDATION.PIN_PATTERN.test(pin)) {
    showError('su-pin-error', ERRORS.INVALID_PIN, 'Example: 1234');
    setInvalid('su-pin');
    hasError = true;
  }

  if (hasError) return;

  // Create user with XSS-safe name
  state.user = {
    id: uid('u'),
    name: escapeHtml(nameResult.name),
    mobile: mobileResult.mobile,
    pinHash: simpleHash(pin)
  };
  state.acc = { name: 'Main Account', balance: 0, accNumber: generateAccountNumber() };
  state.ledger = [];
  
  saveState();
  store.set('bb_last_login', nowISO());
  
  showSkeletons();
  showToast('Account created successfully!');
  refreshUI(true);
  showSection('home');
  showWelcomeBanner(false);
  showTutorial();
});

// ============ AUTH: LOGIN ============
document.getElementById('login-form')?.addEventListener('submit', function(e) {
  e.preventDefault();
  clearAllErrors();

  const mobile = normalizePhone(document.getElementById('li-mobile').value.trim());
  const pin = document.getElementById('li-pin').value.trim();

  const storedUser = store.get('bb_user', null);

  if (!storedUser) {
    showError('li-mobile-error', 'No account found.', 'Please sign up first using the Sign Up tab.');
    setInvalid('li-mobile');
    return;
  }

  if (storedUser.mobile !== mobile) {
    showError('li-mobile-error', 'Mobile number not registered.', 'Check the number or sign up.');
    setInvalid('li-mobile');
    return;
  }

  if (storedUser.pinHash !== simpleHash(pin)) {
    showError('li-pin-error', 'Incorrect PIN.', 'Try again or contact support.');
    setInvalid('li-pin');
    return;
  }

  state.user = storedUser;
  state.acc = store.get('bb_acc', { name: 'Main Account', balance: 0, accNumber: generateAccountNumber() });
  state.ledger = store.get('bb_ledger', []);
  
  // Generate account number if missing (for existing users)
  if (!state.acc.accNumber) {
    state.acc.accNumber = generateAccountNumber();
    saveState();
  }

  const previousLogin = store.get('bb_last_login', null);
  store.set('bb_last_login', nowISO());

  showSkeletons();
  showToast('Login successful!');
  refreshUI(true);
  showSection('home');
  showWelcomeBanner(true);
  showTutorial();
});

// ============ LOGOUT ============
document.getElementById('logoutBtn')?.addEventListener('click', function() {
  if (!confirm('Are you sure you want to log out?')) return;
  
  state.user = null;
  showToast('Logged out successfully');
  showSection('auth');
  
  // Clear login form
  const liMobile = document.getElementById('li-mobile');
  const liPin = document.getElementById('li-pin');
  if (liMobile) liMobile.value = '';
  if (liPin) liPin.value = '';
});

// ============ DEPOSIT ============
document.getElementById('depSubmit')?.addEventListener('click', async function() {
  const input = document.getElementById('depAmount');
  const btn = this;
  
  if (state.pendingAction) {
    showToast('Please wait...');
    return;
  }

  const { valid, amount: amt } = validateAmount(input.value, 'depAmountError');
  if (!valid) {
    setInvalid('depAmount');
    return;
  }

  // Confirm large transaction
  const confirmed = await confirmLargeTransaction(amt, 'Deposit');
  if (!confirmed) return;

  state.pendingAction = true;
  setButtonLoading(btn, true);
  
  setTimeout(() => {
    state.acc.balance += amt;
    state.ledger.unshift({
      dt: nowISO(),
      type: 'Deposit',
      ref: 'Cash Deposit',
      amount: amt,
      balance: state.acc.balance
    });
    
    saveState();
    refreshUI(true);
    showToast('Deposited ' + inr(amt));
    input.value = '';
    clearError('depAmountError');
    setButtonLoading(btn, false);
    state.pendingAction = false;
  }, VALIDATION.DEBOUNCE_TIME);
});

// ============ WITHDRAW ============
document.getElementById('wdSubmit')?.addEventListener('click', async function() {
  const input = document.getElementById('wdAmount');
  const btn = this;
  
  if (state.pendingAction) {
    showToast('Please wait...');
    return;
  }

  const { valid, amount: amt } = validateAmount(input.value, 'wdAmountError', true);
  if (!valid) {
    setInvalid('wdAmount');
    return;
  }

  // Confirm large transaction
  const confirmed = await confirmLargeTransaction(amt, 'Withdrawal');
  if (!confirmed) return;

  state.pendingAction = true;
  setButtonLoading(btn, true);
  
  setTimeout(() => {
    state.acc.balance -= amt;
    state.ledger.unshift({
      dt: nowISO(),
      type: 'Withdraw',
      ref: 'Cash Withdrawal',
      amount: amt,
      balance: state.acc.balance
    });
    
    saveState();
    refreshUI(true);
    showToast('Withdrawn ' + inr(amt));
    input.value = '';
    clearError('wdAmountError');
    setButtonLoading(btn, false);
    state.pendingAction = false;
  }, VALIDATION.DEBOUNCE_TIME);
});

// ============ TRANSFER ============
document.getElementById('tfSubmit')?.addEventListener('click', async function() {
  const mobileInput = document.getElementById('tfMobile');
  const amountInput = document.getElementById('tfAmount');
  const btn = this;
  
  if (state.pendingAction) {
    showToast('Please wait...');
    return;
  }

  clearError('tfMobileError');
  clearError('tfAmountError');
  mobileInput.classList.remove('is-invalid');
  amountInput.classList.remove('is-invalid');

  let hasError = false;

  // Validate mobile
  const mobileResult = validateMobileEnhanced(mobileInput.value, 'tfMobileError');
  if (!mobileResult.valid) {
    mobileInput.classList.add('is-invalid');
    hasError = true;
  }

  // Check self-transfer
  if (mobileResult.valid && state.user && mobileResult.mobile === state.user.mobile) {
    showError('tfMobileError', ERRORS.SELF_TRANSFER);
    mobileInput.classList.add('is-invalid');
    hasError = true;
  }

  // Validate amount
  const amountResult = validateAmount(amountInput.value, 'tfAmountError', true);
  if (!amountResult.valid) {
    amountInput.classList.add('is-invalid');
    hasError = true;
  }

  if (hasError) return;

  // Confirm large transaction
  const confirmed = await confirmLargeTransaction(amountResult.amount, 'Transfer');
  if (!confirmed) return;

  state.pendingAction = true;
  setButtonLoading(btn, true);
  
  setTimeout(() => {
    state.acc.balance -= amountResult.amount;
    state.ledger.unshift({
      dt: nowISO(),
      type: 'Transfer',
      ref: 'To: ' + mobileResult.mobile,
      amount: amountResult.amount,
      balance: state.acc.balance
    });
    
    saveState();
    refreshUI(true);
    showToast('Transferred ' + inr(amountResult.amount));
    mobileInput.value = '';
    amountInput.value = '';
    setButtonLoading(btn, false);
    state.pendingAction = false;
  }, 800);
});

// ============ PIN TOGGLES ============
document.getElementById('su-pin-toggle')?.addEventListener('click', function() {
  const input = document.getElementById('su-pin');
  if (input.type === 'password') {
    input.type = 'text';
    this.textContent = 'Hide';
  } else {
    input.type = 'password';
    this.textContent = 'Show';
  }
});

document.getElementById('li-pin-toggle')?.addEventListener('click', function() {
  const input = document.getElementById('li-pin');
  if (input.type === 'password') {
    input.type = 'text';
    this.textContent = 'Hide';
  } else {
    input.type = 'password';
    this.textContent = 'Show';
  }
});

// ============ SEARCH ============
document.getElementById('txSearch')?.addEventListener('input', function(e) {
  state.searchQuery = e.target.value.trim();
  updateTransactions();
});

// ============ EDIT NAME ============
document.getElementById('editNameBtn')?.addEventListener('click', function() {
  document.getElementById('editNameForm').style.display = 'block';
  document.getElementById('newNameInput').value = state.user?.name || '';
  document.getElementById('newNameInput').focus();
});

document.getElementById('cancelEditBtn')?.addEventListener('click', function() {
  document.getElementById('editNameForm').style.display = 'none';
});

document.getElementById('saveNameBtn')?.addEventListener('click', function() {
  const newNameInput = document.getElementById('newNameInput');
  const nameResult = validateName(newNameInput.value, null);
  
  if (!nameResult.valid) {
    showToast(nameResult.error || 'Invalid name');
    return;
  }
  
  const btn = this;
  setButtonLoading(btn, true);
  
  setTimeout(() => {
    state.user.name = escapeHtml(nameResult.name);
    saveState();
    updateProfile();
    document.getElementById('editNameForm').style.display = 'none';
    showToast('Name updated successfully!');
    setButtonLoading(btn, false);
  }, 500);
});

// ============ CHANGE PIN ============
document.getElementById('changePinBtn')?.addEventListener('click', function() {
  const currentPin = document.getElementById('currentPin').value.trim();
  const newPin = document.getElementById('newPin').value.trim();
  const errorEl = document.getElementById('pinChangeError');
  
  if (errorEl) errorEl.textContent = '';
  
  if (!currentPin || !newPin) {
    if (errorEl) errorEl.textContent = 'Please fill in both PIN fields';
    return;
  }
  
  if (simpleHash(currentPin) !== state.user.pinHash) {
    if (errorEl) errorEl.textContent = ERRORS.WRONG_PIN;
    return;
  }
  
  if (!VALIDATION.PIN_PATTERN.test(newPin)) {
    if (errorEl) errorEl.textContent = ERRORS.INVALID_PIN;
    return;
  }
  
  const btn = this;
  setButtonLoading(btn, true);
  
  setTimeout(() => {
    state.user.pinHash = simpleHash(newPin);
    saveState();
    document.getElementById('currentPin').value = '';
    document.getElementById('newPin').value = '';
    showToast('PIN changed successfully!');
    setButtonLoading(btn, false);
  }, 500);
});

// ============ INIT ============
loadState();

if (state.user) {
  showSkeletons();
  refreshUI();
  showSection('home');
} else {
  showSection('auth');
}
