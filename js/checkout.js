/**
 * AERO-FORCE CHECKOUT LOGIC (checkout.js)
 * - Dynamic Bundle Selection & Real-Time Price Engine
 * - Extended Warranty Upsell Toggle
 * - Dropdown Select Tick Dynamic State & Default Placeholders
 * - Live Promo Countdown Timer
 * - Marquee Animation
 * - Credit Card Masking (4-digit groups, last 4 digits visible)
 * - Numeric-Only Input Validation (Card, CVV, Zip, Phone)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* --------------------------------------------------------------------------
     1. BUNDLE DEFINITIONS & DYNAMIC PRICING ENGINE
     -------------------------------------------------------------------------- */
  const BUNDLES = {
    'bundle-1': {
      qty: 1,
      name: '1x AERO-FORCE Blower',
      unitPrice: 89.00,
      totalPrice: 89.00,
      originalTotal: 178.00,
      savings: 89.00
    },
    'bundle-2': {
      qty: 2,
      name: '2x AERO-FORCE Blower',
      unitPrice: 79.00,
      totalPrice: 158.00,
      originalTotal: 356.00,
      savings: 198.00
    },
    'bundle-3': {
      qty: 3,
      name: '3x AERO-FORCE Blower',
      unitPrice: 69.00,
      totalPrice: 207.00,
      originalTotal: 534.00,
      savings: 327.00
    }
  };

  const WARRANTY_UNIT_PRICE = 9.99;

  let currentBundleKey = 'bundle-1';
  let isWarrantyActive = false;

  // DOM Elements
  const bundleCards = document.querySelectorAll('.unify-select-bundle');
  const summaryItemName = document.getElementById('summaryItemName');
  const summaryOrigPrice = document.getElementById('summaryOrigPrice');
  const summaryFinalPrice = document.getElementById('summaryFinalPrice');
  const summarySavings = document.getElementById('summarySavings');
  const summaryGrandTotal = document.getElementById('summaryGrandTotal');
  const warrantyCheckbox = document.getElementById('extendedWarrantyCheckbox');
  const warrantySummaryRow = document.getElementById('summaryWarrantyRow');
  const warrantySummaryPrice = document.getElementById('summaryWarrantyPrice');

  function updatePricing() {
    const bundle = BUNDLES[currentBundleKey] || BUNDLES['bundle-1'];
    
    // 1. Update line item details
    if (summaryItemName) {
      summaryItemName.textContent = bundle.name;
    }
    if (summaryOrigPrice) {
      summaryOrigPrice.textContent = `$${bundle.originalTotal.toFixed(2)}`;
    }
    if (summaryFinalPrice) {
      summaryFinalPrice.textContent = `$${bundle.unitPrice.toFixed(2)}/each`;
    }

    // 2. Warranty upsell calculation
    let warrantyTotal = 0;
    if (isWarrantyActive) {
      warrantyTotal = WARRANTY_UNIT_PRICE * bundle.qty;
      if (warrantySummaryRow) {
        warrantySummaryRow.style.display = 'flex';
      }
      if (warrantySummaryPrice) {
        warrantySummaryPrice.textContent = `$${warrantyTotal.toFixed(2)}`;
      }
    } else {
      if (warrantySummaryRow) {
        warrantySummaryRow.style.display = 'none';
      }
    }

    // 3. Update savings
    if (summarySavings) {
      summarySavings.textContent = `Discount: $${bundle.savings.toFixed(2)}`;
    }

    // 4. Update grand total
    const grandTotal = bundle.totalPrice + warrantyTotal;
    if (summaryGrandTotal) {
      summaryGrandTotal.textContent = `$${grandTotal.toFixed(2)}`;
    }
  }

  // Bundle click listener
  bundleCards.forEach(card => {
    card.addEventListener('click', (e) => {
      const radio = card.querySelector('input[type="radio"]');
      if (!radio) return;

      const key = card.getAttribute('data-bundle-id') || radio.value;
      if (!BUNDLES[key]) return;

      currentBundleKey = key;
      radio.checked = true;

      // Update UI classes
      bundleCards.forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');

      updatePricing();
    });
  });

  // Warranty checkbox listener
  if (warrantyCheckbox) {
    warrantyCheckbox.addEventListener('change', () => {
      isWarrantyActive = warrantyCheckbox.checked;
      updatePricing();
    });
  }

  // Initial pricing call
  updatePricing();


  /* --------------------------------------------------------------------------
     2. DYNAMIC SELECT TICK & DEFAULT PLACEHOLDER STATES
     -------------------------------------------------------------------------- */
  const selectWrappers = document.querySelectorAll('.unify-select-dropdown');
  selectWrappers.forEach(wrap => {
    const select = wrap.querySelector('select');
    if (!select) return;

    function checkSelectValue() {
      if (select.value && select.value !== '' && select.value !== 'default') {
        wrap.classList.add('has-value');
        select.classList.remove('is-placeholder');
      } else {
        wrap.classList.remove('has-value');
        select.classList.add('is-placeholder');
      }
    }

    select.addEventListener('change', checkSelectValue);
    select.addEventListener('input', checkSelectValue);
    // Initial evaluation
    checkSelectValue();
  });


  /* --------------------------------------------------------------------------
     3. LIVE PROMO COUNTDOWN TIMER (ticking from 08:51)
     -------------------------------------------------------------------------- */
  const timerEl = document.getElementById('promoTimer');
  if (timerEl) {
    let totalSeconds = 8 * 60 + 51; // 08:51 = 531s

    const timerInterval = setInterval(() => {
      if (totalSeconds <= 0) {
        clearInterval(timerInterval);
        timerEl.textContent = '00:00';
        return;
      }
      totalSeconds--;

      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      timerEl.textContent = formatted;
    }, 1000);
  }


  /* --------------------------------------------------------------------------
     5. NUMERIC INPUT & CREDIT CARD NUMBER MASKING
     - Credit Card (#ccNumber): only numbers, 4-digit groups, only last 4 visible
     - CVV (#ccCVV): only numbers, max 4 digits
     - Zip (#shipZip): only numbers, max 10 digits
     - Phone (#custPhone): only numbers, max 15 digits
     -------------------------------------------------------------------------- */

  // 1. Credit Card Input (#ccNumber)
  const ccInput = document.getElementById('ccNumber');
  if (ccInput) {
    let rawCardNumber = '';

    function formatCardNumber(clean) {
      const len = clean.length;
      let masked = '';
      for (let i = 0; i < len; i++) {
        if (i < len - 4) {
          masked += '•';
        } else {
          masked += clean[i];
        }
      }
      const groups = [];
      for (let i = 0; i < masked.length; i += 4) {
        groups.push(masked.slice(i, i + 4));
      }
      return groups.join(' ');
    }

    function countDigitsBefore(formatted, pos) {
      let count = 0;
      for (let i = 0; i < pos && i < formatted.length; i++) {
        if (formatted[i] !== ' ') count++;
      }
      return count;
    }

    function getCursorPosForDigitCount(formatted, digitCount) {
      if (digitCount <= 0) return 0;
      let counted = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== ' ') {
          counted++;
          if (counted === digitCount) {
            return i + 1;
          }
        }
      }
      return formatted.length;
    }

    function updateCardDisplay(newRaw, newCursorDigit) {
      rawCardNumber = newRaw.slice(0, 16);
      ccInput.dataset.rawValue = rawCardNumber;
      const formatted = formatCardNumber(rawCardNumber);
      ccInput.value = formatted;
      const cursorPos = getCursorPosForDigitCount(formatted, newCursorDigit);
      ccInput.setSelectionRange(cursorPos, cursorPos);
    }

    ccInput.addEventListener('keydown', (e) => {
      // Allow ctrl/cmd shortcuts (e.g. copy, paste, select all, undo)
      if (e.ctrlKey || e.metaKey) return;

      // Allow navigation and functional keys
      const allowedNavKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab', 'Enter'];
      if (allowedNavKeys.includes(e.key)) return;

      const selStart = ccInput.selectionStart;
      const selEnd = ccInput.selectionEnd;
      const currentVal = ccInput.value;

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (selStart !== selEnd) {
          const startDigit = countDigitsBefore(currentVal, selStart);
          const endDigit = countDigitsBefore(currentVal, selEnd);
          const newRaw = rawCardNumber.slice(0, startDigit) + rawCardNumber.slice(endDigit);
          updateCardDisplay(newRaw, startDigit);
        } else {
          const digitIndex = countDigitsBefore(currentVal, selStart);
          if (digitIndex > 0) {
            const newRaw = rawCardNumber.slice(0, digitIndex - 1) + rawCardNumber.slice(digitIndex);
            updateCardDisplay(newRaw, digitIndex - 1);
          }
        }
        return;
      }

      if (e.key === 'Delete') {
        e.preventDefault();
        if (selStart !== selEnd) {
          const startDigit = countDigitsBefore(currentVal, selStart);
          const endDigit = countDigitsBefore(currentVal, selEnd);
          const newRaw = rawCardNumber.slice(0, startDigit) + rawCardNumber.slice(endDigit);
          updateCardDisplay(newRaw, startDigit);
        } else {
          const digitIndex = countDigitsBefore(currentVal, selStart);
          if (digitIndex < rawCardNumber.length) {
            const newRaw = rawCardNumber.slice(0, digitIndex) + rawCardNumber.slice(digitIndex + 1);
            updateCardDisplay(newRaw, digitIndex);
          }
        }
        return;
      }

      // Check for numeric digit (0-9)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        if (selStart !== selEnd) {
          const startDigit = countDigitsBefore(currentVal, selStart);
          const endDigit = countDigitsBefore(currentVal, selEnd);
          const newRaw = rawCardNumber.slice(0, startDigit) + e.key + rawCardNumber.slice(endDigit);
          updateCardDisplay(newRaw, Math.min(startDigit + 1, 16));
        } else {
          if (rawCardNumber.length >= 16) return;
          const digitIndex = countDigitsBefore(currentVal, selStart);
          const newRaw = rawCardNumber.slice(0, digitIndex) + e.key + rawCardNumber.slice(digitIndex);
          updateCardDisplay(newRaw, Math.min(digitIndex + 1, 16));
        }
        return;
      }

      // Strictly block all non-numeric keys
      e.preventDefault();
    });

    ccInput.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      const digits = text.replace(/\D/g, '');
      if (!digits) return;

      const selStart = ccInput.selectionStart || 0;
      const selEnd = ccInput.selectionEnd || 0;
      const currentVal = ccInput.value;

      let newRaw;
      if (digits.length >= 15 || (selStart === 0 && selEnd === currentVal.length)) {
        // Full card pasted or all selected: replace entirely
        newRaw = digits.slice(0, 16);
      } else {
        const startDigit = countDigitsBefore(currentVal, selStart);
        const endDigit = countDigitsBefore(currentVal, selEnd);
        newRaw = (rawCardNumber.slice(0, startDigit) + digits + rawCardNumber.slice(endDigit)).slice(0, 16);
      }
      updateCardDisplay(newRaw, Math.min(newRaw.length, 16));
    });

    // Fallback for autofill or clear
    ccInput.addEventListener('input', () => {
      const clean = ccInput.value.replace(/[^\d•]/g, '');
      if (clean.length === 0) {
        rawCardNumber = '';
        ccInput.dataset.rawValue = '';
        ccInput.value = '';
      }
    });
  }

  // 2. Pure Numeric Inputs (Digits Only) Enforcement
  function enforceNumericOnly(inputEl, maxDigits = null) {
    if (!inputEl) return;

    inputEl.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) return;
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Tab', 'Enter'];
      if (allowedKeys.includes(e.key)) return;

      if (!/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        return;
      }

      if (maxDigits && inputEl.selectionStart === inputEl.selectionEnd && inputEl.value.length >= maxDigits) {
        e.preventDefault();
      }
    });

    const sanitize = () => {
      let sanitized = inputEl.value.replace(/\D/g, '');
      if (maxDigits && sanitized.length > maxDigits) {
        sanitized = sanitized.slice(0, maxDigits);
      }
      if (inputEl.value !== sanitized) {
        inputEl.value = sanitized;
      }
    };

    inputEl.addEventListener('input', sanitize);
    inputEl.addEventListener('blur', sanitize);

    inputEl.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
      let digits = text.replace(/\D/g, '');
      if (!digits) return;

      if (maxDigits) digits = digits.slice(0, maxDigits);
      const selStart = inputEl.selectionStart || 0;
      const selEnd = inputEl.selectionEnd || 0;
      const val = inputEl.value;
      let newVal = val.slice(0, selStart) + digits + val.slice(selEnd);
      if (maxDigits) newVal = newVal.slice(0, maxDigits);
      inputEl.value = newVal;
      const newPos = Math.min(selStart + digits.length, maxDigits || newVal.length);
      inputEl.setSelectionRange(newPos, newPos);
    });
  }

  // Apply numeric-only enforcement to CVV, Zip, and Phone
  enforceNumericOnly(document.getElementById('ccCVV'), 4);
  enforceNumericOnly(document.getElementById('shipZip'), 10);
  enforceNumericOnly(document.getElementById('custPhone'), 15);

});
