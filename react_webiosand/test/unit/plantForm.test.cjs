const assert = require('node:assert/strict');
const test = require('node:test');

const {
  PLANT_AGE_OPTIONS,
  WATERING_FREQUENCY_UNITS,
  buildPlantPayload,
  formatWateringFrequency,
  normalizePlantAgeDescription,
  normalizeWateringFrequencyUnit,
  optionalText,
  parseOptionalInteger,
  validatePlantForm,
} = require('../../src/utils/plantForm');

test('parseOptionalInteger handles optional numeric form input', () => {
  assert.equal(parseOptionalInteger(null), null);
  assert.equal(parseOptionalInteger(undefined), null);
  assert.equal(parseOptionalInteger(''), null);
  assert.equal(parseOptionalInteger('   '), null);
  assert.equal(parseOptionalInteger('7'), 7);
  assert.equal(parseOptionalInteger(' 12 '), 12);
  assert.equal(parseOptionalInteger('abc'), null);
  assert.equal(parseOptionalInteger('7abc'), null);
  assert.equal(parseOptionalInteger('2.5'), null);
  assert.equal(parseOptionalInteger('-1'), null);
  assert.equal(parseOptionalInteger('0'), null);
});

test('validatePlantForm requires a plant name', () => {
  assert.deepEqual(validatePlantForm({ name: '   ' }), {
    valid: false,
    title: 'Error',
    message: 'Plant name is required',
  });

  assert.deepEqual(validatePlantForm({ name: 'Gerald' }), { valid: true });
});

test('validatePlantForm enforces database-shaped plant field types and limits', () => {
  assert.deepEqual(
    validatePlantForm({ name: 'Fern', wateringFrequency: 'weekly', wateringFrequencyUnit: 'days' }),
    {
      valid: false,
      title: 'Invalid watering frequency',
      message: 'Watering frequency must be a whole number greater than 0.',
    }
  );

  assert.deepEqual(
    validatePlantForm({ name: 'Fern', wateringFrequency: '2', wateringFrequencyUnit: 'years' }),
    {
      valid: false,
      title: 'Invalid watering unit',
      message: 'Choose days, weeks, or months for the watering frequency unit.',
    }
  );

  assert.deepEqual(
    validatePlantForm({ name: 'Fern', ageDescription: 'Very ancient' }),
    {
      valid: false,
      title: 'Invalid plant age',
      message: 'Choose one of the plant age options.',
    }
  );

  assert.equal(validatePlantForm({ name: 'x'.repeat(151) }).valid, false);
  assert.deepEqual(
    validatePlantForm({
      name: 'Fern',
      ageDescription: 'Young plant',
      wateringFrequency: '2',
      wateringFrequencyUnit: 'weeks',
    }),
    { valid: true }
  );
});

test('optionalText trims text and preserves null for blank values', () => {
  assert.equal(optionalText('  Sunny window  '), 'Sunny window');
  assert.equal(optionalText('   '), null);
  assert.equal(optionalText(undefined), null);
});

test('watering frequency helpers normalize units and display labels', () => {
  assert.deepEqual(WATERING_FREQUENCY_UNITS.map((unit) => unit.value), ['days', 'weeks', 'months']);
  assert.equal(normalizeWateringFrequencyUnit('weeks'), 'weeks');
  assert.equal(normalizeWateringFrequencyUnit('bad-value'), 'days');
  assert.equal(formatWateringFrequency('1', 'weeks'), 'Every 1 week');
  assert.equal(formatWateringFrequency('2', 'months'), 'Every 2 months');
  assert.equal(formatWateringFrequency('7', 'days', true), 'Every 7d');
  assert.equal(formatWateringFrequency('', 'days'), null);
});

test('plant age helpers normalize optional life-stage choices', () => {
  assert.deepEqual(PLANT_AGE_OPTIONS.map((option) => option.value), [
    null,
    'Cutting / propagation',
    'Seedling',
    'Young plant',
    'Mature plant',
    'Established plant',
  ]);
  assert.equal(normalizePlantAgeDescription('Young plant'), 'Young plant');
  assert.equal(normalizePlantAgeDescription('  Seedling  '), 'Seedling');
  assert.equal(normalizePlantAgeDescription('Very old'), null);
  assert.equal(normalizePlantAgeDescription(''), null);
});

test('buildPlantPayload trims text and converts blank optional fields to null', () => {
  assert.deepEqual(
    buildPlantPayload({
      name: '  Gerald  ',
      species: ' Monstera deliciosa ',
      description: '',
      locationNotes: ' Living room ',
      ageDescription: 'Mature plant',
      sizeDescription: '',
      healthStatus: ' Healthy ',
      lightRequirements: ' Bright indirect ',
      humidityRequirements: '',
      wateringFrequency: ' 7 ',
      wateringFrequencyUnit: 'weeks',
      specialInstructions: ' Do not move ',
    }),
    {
      name: 'Gerald',
      species: 'Monstera deliciosa',
      description: null,
      location_notes: 'Living room',
      age_description: 'Mature plant',
      size_description: null,
      health_status: 'Healthy',
      light_requirements: 'Bright indirect',
      humidity_requirements: null,
      watering_frequency_days: 7,
      watering_frequency_unit: 'weeks',
      special_instructions: 'Do not move',
    }
  );
});

test('buildPlantPayload defaults watering unit for old or blank forms', () => {
  assert.equal(buildPlantPayload({ name: 'Fern', wateringFrequency: '3' }).watering_frequency_unit, 'days');
  assert.equal(buildPlantPayload({ name: 'Fern', wateringFrequency: '' }).watering_frequency_unit, 'days');
});
