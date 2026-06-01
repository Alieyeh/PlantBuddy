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
  if (!/^\d+$/.test(text)) return null;

  const number = Number.parseInt(text, 10);
  return number > 0 ? number : null;
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

const PLANT_AGE_OPTIONS = Object.freeze([
  { value: null, label: 'Not sure' },
  { value: 'Cutting / propagation', label: 'Cutting' },
  { value: 'Seedling', label: 'Seedling' },
  { value: 'Young plant', label: 'Young' },
  { value: 'Mature plant', label: 'Mature' },
  { value: 'Established plant', label: 'Established' },
]);

const PLANT_TEXT_LIMITS = Object.freeze({
  name: 150,
  species: 150,
  sizeDescription: 100,
  healthStatus: 100,
  lightRequirements: 120,
  humidityRequirements: 120,
});

function normalizeWateringFrequencyUnit(value) {
  const unit = String(value ?? '').trim().toLowerCase();
  return WATERING_FREQUENCY_UNITS.some((option) => option.value === unit) ? unit : 'days';
}

function normalizePlantAgeDescription(value) {
  const text = optionalText(value);
  if (!text) return null;

  return PLANT_AGE_OPTIONS.some((option) => option.value === text) ? text : null;
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

function isAllowedWateringFrequencyUnit(value) {
  const unit = String(value ?? '').trim().toLowerCase();
  return WATERING_FREQUENCY_UNITS.some((option) => option.value === unit);
}

function isAllowedPlantAgeDescription(value) {
  const text = optionalText(value);
  if (!text) return true;

  return PLANT_AGE_OPTIONS.some((option) => option.value === text);
}

function isWithinLimit(value, limit) {
  return String(value ?? '').trim().length <= limit;
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
 * @param {string} [form.ageDescription]
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
    age_description: normalizePlantAgeDescription(form.ageDescription),
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

  for (const [field, limit] of Object.entries(PLANT_TEXT_LIMITS)) {
    if (!isWithinLimit(form[field], limit)) {
      return {
        valid: false,
        title: 'Too long',
        message: `Please keep ${field.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)} to ${limit} characters or fewer.`,
      };
    }
  }

  const wateringText = String(form.wateringFrequency ?? '').trim();
  if (wateringText && parseOptionalInteger(wateringText) == null) {
    return {
      valid: false,
      title: 'Invalid watering frequency',
      message: 'Watering frequency must be a whole number greater than 0.',
    };
  }

  if (wateringText && !isAllowedWateringFrequencyUnit(form.wateringFrequencyUnit)) {
    return {
      valid: false,
      title: 'Invalid watering unit',
      message: 'Choose days, weeks, or months for the watering frequency unit.',
    };
  }

  if (!isAllowedPlantAgeDescription(form.ageDescription)) {
    return {
      valid: false,
      title: 'Invalid plant age',
      message: 'Choose one of the plant age options.',
    };
  }

  return { valid: true };
}

module.exports = {
  PLANT_AGE_OPTIONS,
  WATERING_FREQUENCY_UNITS,
  buildPlantPayload,
  formatWateringFrequency,
  isAllowedPlantAgeDescription,
  isAllowedWateringFrequencyUnit,
  normalizePlantAgeDescription,
  normalizeWateringFrequencyUnit,
  optionalText,
  parseOptionalInteger,
  validatePlantForm,
};
