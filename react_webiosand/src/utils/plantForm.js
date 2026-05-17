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
 * @param {string} [form.specialInstructions]
 * @returns {object}
 */
function buildPlantPayload(form) {
  return {
    name: (form.name ?? '').trim(),
    species: optionalText(form.species),
    description: optionalText(form.description),
    location_notes: optionalText(form.locationNotes),
    size_description: optionalText(form.sizeDescription),
    health_status: optionalText(form.healthStatus),
    light_requirements: optionalText(form.lightRequirements),
    humidity_requirements: optionalText(form.humidityRequirements),
    watering_frequency_days: parseOptionalInteger(form.wateringFrequency),
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
  buildPlantPayload,
  optionalText,
  parseOptionalInteger,
  validatePlantForm,
};
