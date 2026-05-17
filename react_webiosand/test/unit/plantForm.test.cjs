const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildPlantPayload,
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
});

test('validatePlantForm requires a plant name', () => {
  assert.deepEqual(validatePlantForm({ name: '   ' }), {
    valid: false,
    title: 'Error',
    message: 'Plant name is required',
  });

  assert.deepEqual(validatePlantForm({ name: 'Gerald' }), { valid: true });
});

test('optionalText trims text and preserves null for blank values', () => {
  assert.equal(optionalText('  Sunny window  '), 'Sunny window');
  assert.equal(optionalText('   '), null);
  assert.equal(optionalText(undefined), null);
});

test('buildPlantPayload trims text and converts blank optional fields to null', () => {
  assert.deepEqual(
    buildPlantPayload({
      name: '  Gerald  ',
      species: ' Monstera deliciosa ',
      description: '',
      locationNotes: ' Living room ',
      sizeDescription: '',
      healthStatus: ' Healthy ',
      lightRequirements: ' Bright indirect ',
      humidityRequirements: '',
      wateringFrequency: ' 7 ',
      specialInstructions: ' Do not move ',
    }),
    {
      name: 'Gerald',
      species: 'Monstera deliciosa',
      description: null,
      location_notes: 'Living room',
      size_description: null,
      health_status: 'Healthy',
      light_requirements: 'Bright indirect',
      humidity_requirements: null,
      watering_frequency_days: 7,
      special_instructions: 'Do not move',
    }
  );
});
