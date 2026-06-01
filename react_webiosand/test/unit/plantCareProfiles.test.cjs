const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildCareProfilePatch,
  findBestPlantCareProfile,
  hasExistingCareValues,
  normalizeCareSearchText,
  scorePlantCareProfile,
} = require('../../src/utils/plantCareProfiles');

const profiles = [
  {
    common_name: 'Monstera',
    scientific_name: 'Monstera deliciosa',
    aliases: ['Swiss cheese plant'],
    age_description: null,
    watering_frequency_days: 7,
    watering_frequency_unit: 'days',
    light_requirements: 'Bright indirect light',
    humidity_requirements: 'Medium to high humidity',
    location_notes: 'Near a bright window',
    care_notes: 'Let the top soil dry before watering.',
    sort_order: 10,
    is_active: true,
  },
  {
    common_name: 'Monstera',
    scientific_name: 'Monstera deliciosa',
    aliases: ['Young monstera'],
    age_description: 'Seedling',
    watering_frequency_days: 5,
    watering_frequency_unit: 'days',
    light_requirements: 'Bright indirect light',
    humidity_requirements: 'High humidity',
    location_notes: 'Warm bright spot',
    care_notes: 'Keep soil lightly moist while roots establish.',
    sort_order: 11,
    is_active: true,
  },
  {
    common_name: 'Snake plant',
    scientific_name: 'Dracaena trifasciata',
    aliases: ['Sansevieria'],
    age_description: null,
    watering_frequency_days: 3,
    watering_frequency_unit: 'weeks',
    light_requirements: 'Low to bright indirect light',
    humidity_requirements: 'Low to average humidity',
    sort_order: 30,
    is_active: true,
  },
];

test('normalizeCareSearchText creates stable species matching text', () => {
  assert.equal(normalizeCareSearchText('  Monstera-deliciosa!! '), 'monstera deliciosa');
  assert.equal(normalizeCareSearchText(null), '');
});

test('findBestPlantCareProfile matches common, scientific, and alias names', () => {
  assert.equal(findBestPlantCareProfile(profiles, 'Monstera')?.common_name, 'Monstera');
  assert.equal(findBestPlantCareProfile(profiles, 'Dracaena trifasciata')?.common_name, 'Snake plant');
  assert.equal(findBestPlantCareProfile(profiles, 'sansevieria')?.common_name, 'Snake plant');
});

test('findBestPlantCareProfile prefers exact age profiles when available', () => {
  assert.equal(findBestPlantCareProfile(profiles, 'Monstera deliciosa', 'Seedling')?.watering_frequency_days, 5);
  assert.equal(findBestPlantCareProfile(profiles, 'Monstera deliciosa', 'Mature plant')?.watering_frequency_days, 7);
});

test('scorePlantCareProfile ignores inactive and non-matching age-specific rows', () => {
  assert.equal(scorePlantCareProfile({ ...profiles[0], is_active: false }, 'Monstera', null), 0);
  assert.equal(scorePlantCareProfile(profiles[1], 'Monstera', 'Mature plant'), 0);
});

test('buildCareProfilePatch fills blank fields without overwriting user text', () => {
  const patch = buildCareProfilePatch(profiles[0], {
    wateringFrequency: '',
    wateringFrequencyUnit: 'days',
    lightRequirements: 'Already bright',
    humidityRequirements: '',
    locationNotes: '',
    specialInstructions: 'Already careful',
  });

  assert.deepEqual(patch, {
    wateringFrequency: '7',
    wateringFrequencyUnit: 'days',
    humidityRequirements: 'Medium to high humidity',
    locationNotes: 'Near a bright window',
  });
});

test('buildCareProfilePatch can replace existing care values when requested', () => {
  const patch = buildCareProfilePatch(profiles[2], {
    wateringFrequency: '1',
    wateringFrequencyUnit: 'days',
    lightRequirements: 'Old light',
  }, true);

  assert.equal(patch.wateringFrequency, '3');
  assert.equal(patch.wateringFrequencyUnit, 'weeks');
  assert.equal(patch.lightRequirements, 'Low to bright indirect light');
});

test('hasExistingCareValues ignores the unit selector by itself', () => {
  assert.equal(hasExistingCareValues({ wateringFrequencyUnit: 'days' }), false);
  assert.equal(hasExistingCareValues({ wateringFrequencyUnit: 'days', lightRequirements: 'Bright' }), true);
});
