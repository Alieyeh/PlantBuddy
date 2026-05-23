/**
 * Converts optional numeric form input into the integer value expected by the
 * database. Empty input stays null so optional fields can be omitted cleanly.
 *
 * @param {string | number | null | undefined} value
 * @returns {number | null}
 */
function parseOptionalInteger(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;

  const number = Number.parseInt(text, 10);
  return Number.isNaN(number) ? null : number;
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

const WATERING_FREQUENCY_UNITS = Object.freeze([
  { value: 'days', label: 'Days', singular: 'day' },
  { value: 'weeks', label: 'Weeks', singular: 'week' },
  { value: 'months', label: 'Months', singular: 'month' },
]);

function normalizeWateringFrequencyUnit(value) {
  const unit = String(value ?? '').trim().toLowerCase();
  return WATERING_FREQUENCY_UNITS.some((option) => option.value === unit) ? unit : 'days';
}

function formatWateringFrequency(amount, unit = 'days', compact = false) {
  const frequency = parseOptionalInteger(amount);
  if (!frequency) return null;

  const normalizedUnit = normalizeWateringFrequencyUnit(unit);
  const option = WATERING_FREQUENCY_UNITS.find((item) => item.value === normalizedUnit);
  const displayUnit = frequency === 1 ? option.singular : option.value;

  if (compact) {
    const suffix = normalizedUnit === 'days' ? 'd' : normalizedUnit === 'weeks' ? 'wk' : 'mo';
    return `Every ${frequency}${suffix}`;
  }

  return `Every ${frequency} ${displayUnit}`;
}

/**
 * Normalizes plant form fields into the snake_case shape used by Supabase.
 * Blank optional text fields are stored as null instead of empty strings.
 *
 * @param {object} form
 * @param {string} form.name
 * @param {string} [form.species]
 * @param {string} [form.description]
 * @param {string} [form.locationNotes]
 * @param {string} [form.sizeDescription]
 * @param {string} [form.healthStatus]
 * @param {string} [form.lightRequirements]
 * @param {string} [form.humidityRequirements]
 * @param {string} [form.wateringFrequency]
 * @param {string} [form.wateringFrequencyUnit]
 * @param {string} [form.specialInstructions]
 * @returns {object}
 */
function buildPlantPayload(form) {
  const wateringFrequencyDays = parseOptionalInteger(form.wateringFrequency);

  return {
    name: (form.name ?? '').trim(),
    species: optionalText(form.species),
    description: optionalText(form.description),
    location_notes: optionalText(form.locationNotes),
    size_description: optionalText(form.sizeDescription),
    health_status: optionalText(form.healthStatus),
    light_requirements: optionalText(form.lightRequirements),
    humidity_requirements: optionalText(form.humidityRequirements),
    watering_frequency_days: wateringFrequencyDays,
    watering_frequency_unit: wateringFrequencyDays ? normalizeWateringFrequencyUnit(form.wateringFrequencyUnit) : 'days',
    special_instructions: optionalText(form.specialInstructions),
  };
}

/**
 * Checks the current plant form for the minimum fields needed before saving.
 *
 * @param {object} form
 * @param {string} form.name
 * @returns {{ valid: true } | { valid: false, title: string, message: string }}
 */
function validatePlantForm(form) {
  if (!(form.name ?? '').trim()) {
    return { valid: false, title: 'Error', message: 'Plant name is required' };
  }

  return { valid: true };
}

module.exports = {
  WATERING_FREQUENCY_UNITS,
  buildPlantPayload,
  formatWateringFrequency,
  normalizeWateringFrequencyUnit,
  optionalText,
  parseOptionalInteger,
  validatePlantForm,
};
