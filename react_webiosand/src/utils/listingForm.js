/**
 * Returns today's date in the YYYY-MM-DD format used by the database date
 * columns and by the sitting request form.
 *
 * @param {Date} [now]
 * @returns {string}
 */
function getTodayIsoDate(now = new Date()) {
  return now.toISOString().split('T')[0];
}

/**
 * Checks whether a string is shaped like an ISO calendar date.
 *
 * @param {string} value
 * @returns {boolean}
 */
function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Parses an ISO date string as a local calendar date for display.
 *
 * @param {string} dateStr
 * @returns {Date}
 */
function parseIsoDateAsLocal(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Parses an ISO date string as UTC midnight for stable date arithmetic.
 *
 * @param {string} dateStr
 * @returns {number}
 */
function isoDateToUtcMilliseconds(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

/**
 * Trims optional text input and returns null for blank values.
 *
 * @param {string | null | undefined} value
 * @returns {string | null}
 */
function optionalText(value) {
  const text = (value ?? '').trim();
  return text || null;
}

/**
 * Counts whole calendar days between two ISO date strings.
 *
 * @param {string | null | undefined} start
 * @param {string | null | undefined} end
 * @returns {number | null}
 */
function daysBetween(start, end) {
  if (!start || !end) return null;
  const milliseconds = isoDateToUtcMilliseconds(end) - isoDateToUtcMilliseconds(start);
  return Math.round(milliseconds / (1000 * 60 * 60 * 24));
}

/**
 * Formats a compact date label for listing cards.
 *
 * @param {string | null | undefined} dateStr
 * @returns {string}
 */
function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const date = parseIsoDateAsLocal(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Formats a detailed date label for the listing detail screen.
 *
 * @param {string | null | undefined} dateStr
 * @returns {string}
 */
function formatLongDate(dateStr) {
  if (!dateStr) return '-';
  return parseIsoDateAsLocal(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Validates the sitting request form before inserting a listing row.
 *
 * @param {object} form
 * @param {number | string | null | undefined} form.selectedPlantId
 * @param {string} form.title
 * @param {string} form.startDate
 * @param {string} form.endDate
 * @param {string} [todayIso]
 * @returns {{ valid: true } | { valid: false, title: string, message: string }}
 */
function validateSittingRequestForm(form, todayIso = getTodayIsoDate()) {
  if (!form.selectedPlantId) {
    return { valid: false, title: 'Required', message: 'Please select a plant.' };
  }

  if (!(form.title ?? '').trim()) {
    return { valid: false, title: 'Required', message: 'Please add a listing title.' };
  }

  if (!isIsoDate(form.startDate ?? '') || !isIsoDate(form.endDate ?? '')) {
    return {
      valid: false,
      title: 'Invalid dates',
      message: 'Use YYYY-MM-DD format (e.g. 2026-06-01).',
    };
  }

  if (form.endDate < form.startDate) {
    return {
      valid: false,
      title: 'Invalid dates',
      message: 'End date must be on or after start date.',
    };
  }

  if (form.startDate < todayIso) {
    return {
      valid: false,
      title: 'Invalid dates',
      message: 'Start date cannot be in the past.',
    };
  }

  return { valid: true };
}

/**
 * Normalizes form state into the service payload for creating a sitting request.
 *
 * @param {object} form
 * @returns {object}
 */
function buildSittingRequestPayload(form) {
  return {
    plantId: form.selectedPlantId,
    ownerUserId: form.ownerUserId,
    title: (form.title ?? '').trim(),
    description: optionalText(form.description),
    startDate: form.startDate,
    endDate: form.endDate,
    sittingNotes: optionalText(form.sittingNotes),
  };
}

module.exports = {
  buildSittingRequestPayload,
  daysBetween,
  formatLongDate,
  formatShortDate,
  getTodayIsoDate,
  isIsoDate,
  optionalText,
  parseIsoDateAsLocal,
  validateSittingRequestForm,
};
