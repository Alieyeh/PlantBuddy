const assert = require('node:assert/strict');
const test = require('node:test');

const {
  buildListingPayload,
  buildSittingRequestPayload,
  daysBetween,
  formatLongDate,
  formatShortDate,
  getTodayIsoDate,
  isIsoDate,
  normalizeCurrencyCode,
  optionalText,
  parseMoneyAmount,
  parseIsoDateAsLocal,
  validateListingForm,
  validateSittingRequestForm,
} = require('../../src/utils/listingForm');

test('getTodayIsoDate returns the YYYY-MM-DD part of a Date', () => {
  assert.equal(getTodayIsoDate(new Date('2026-06-15T10:30:00.000Z')), '2026-06-15');
});

test('isIsoDate validates the form date shape', () => {
  assert.equal(isIsoDate('2026-06-01'), true);
  assert.equal(isIsoDate('06-01-2026'), false);
  assert.equal(isIsoDate('2026-6-1'), false);
  assert.equal(isIsoDate(''), false);
});

test('daysBetween counts whole calendar days between ISO dates', () => {
  assert.equal(daysBetween('2026-06-01', '2026-06-14'), 13);
  assert.equal(daysBetween('2026-06-01', '2026-06-01'), 0);
  assert.equal(daysBetween(null, '2026-06-01'), null);
});

test('date formatters display stable local calendar dates', () => {
  const parsed = parseIsoDateAsLocal('2026-06-15');

  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 5);
  assert.equal(parsed.getDate(), 15);
  assert.equal(formatShortDate('2026-06-15'), 'Jun 15');
  assert.match(formatLongDate('2026-06-15'), /2026/);
  assert.equal(formatShortDate(null), '');
  assert.equal(formatLongDate(null), '-');
});

test('optionalText trims optional listing copy', () => {
  assert.equal(optionalText('  Away for two weeks  '), 'Away for two weeks');
  assert.equal(optionalText('  '), null);
  assert.equal(optionalText(undefined), null);
});

test('money helpers normalize price and currency input', () => {
  assert.equal(parseMoneyAmount('19.99'), 19.99);
  assert.equal(parseMoneyAmount(' 12 '), 12);
  assert.equal(parseMoneyAmount('-2'), null);
  assert.equal(parseMoneyAmount('abc'), null);
  assert.equal(normalizeCurrencyCode(' gbp '), 'GBP');
  assert.equal(normalizeCurrencyCode(''), null);
});

test('validateSittingRequestForm catches invalid sitting request state', () => {
  const validBase = {
    selectedPlantId: 42,
    title: 'Sitter needed',
    startDate: '2026-06-01',
    endDate: '2026-06-14',
  };

  assert.deepEqual(
    validateSittingRequestForm({ ...validBase, selectedPlantId: null }, '2026-05-01'),
    { valid: false, title: 'Required', message: 'Please select a plant.' }
  );
  assert.deepEqual(
    validateSittingRequestForm({ ...validBase, title: '   ' }, '2026-05-01'),
    { valid: false, title: 'Required', message: 'Please add a listing title.' }
  );
  assert.deepEqual(
    validateSittingRequestForm({ ...validBase, startDate: '01-06-2026' }, '2026-05-01'),
    {
      valid: false,
      title: 'Invalid dates',
      message: 'Use YYYY-MM-DD format (e.g. 2026-06-01).',
    }
  );
  assert.deepEqual(
    validateSittingRequestForm({ ...validBase, endDate: '2026-05-31' }, '2026-05-01'),
    {
      valid: false,
      title: 'Invalid dates',
      message: 'End date must be on or after start date.',
    }
  );
  assert.deepEqual(
    validateSittingRequestForm({ ...validBase, startDate: '2026-04-30' }, '2026-05-01'),
    {
      valid: false,
      title: 'Invalid dates',
      message: 'Start date cannot be in the past.',
    }
  );
  assert.deepEqual(validateSittingRequestForm(validBase, '2026-05-01'), { valid: true });
});

test('buildSittingRequestPayload trims optional text into service payload', () => {
  assert.deepEqual(
    buildSittingRequestPayload({
      selectedPlantId: 42,
      ownerUserId: 'owner-uuid',
      title: ' Sitter needed ',
      description: '  ',
      startDate: '2026-06-01',
      endDate: '2026-06-14',
      sittingNotes: ' Water gently ',
    }),
    {
      plantId: 42,
      ownerUserId: 'owner-uuid',
      title: 'Sitter needed',
      description: null,
      startDate: '2026-06-01',
      endDate: '2026-06-14',
      sittingNotes: 'Water gently',
    }
  );
});

test('validateListingForm applies mode-specific rules for gift and sale', () => {
  const validBase = {
    selectedPlantId: 7,
    title: 'Lovely plant',
    listingType: 'GIFT',
  };

  assert.deepEqual(validateListingForm(validBase, '2026-05-01'), { valid: true });
  assert.deepEqual(
    validateListingForm({ ...validBase, listingType: 'SALE', salePrice: '0', currencyCode: 'GBP' }, '2026-05-01'),
    {
      valid: false,
      title: 'Invalid price',
      message: 'Please enter a sale price greater than 0.',
    }
  );
  assert.deepEqual(
    validateListingForm({ ...validBase, listingType: 'SALE', salePrice: '12.50', currencyCode: 'gb' }, '2026-05-01'),
    {
      valid: false,
      title: 'Invalid currency',
      message: 'Use a 3-letter currency code such as GBP.',
    }
  );
  assert.deepEqual(
    validateListingForm({ ...validBase, listingType: 'SALE', salePrice: '12.50', currencyCode: 'gbp' }, '2026-05-01'),
    { valid: true }
  );
});

test('buildListingPayload maps supported listing modes into insert payloads', () => {
  assert.deepEqual(
    buildListingPayload({
      selectedPlantId: 8,
      ownerUserId: 'owner-uuid',
      listingType: 'GIFT',
      title: ' Free to a good home ',
      description: '  Healthy and established ',
      giftNotes: '  Prefer pickup this week ',
    }),
    {
      plantId: 8,
      ownerUserId: 'owner-uuid',
      listingType: 'GIFT',
      title: 'Free to a good home',
      description: 'Healthy and established',
      giftNotes: 'Prefer pickup this week',
    }
  );

  assert.deepEqual(
    buildListingPayload({
      selectedPlantId: 9,
      ownerUserId: 'owner-uuid',
      listingType: 'SALE',
      title: ' Rare cutting ',
      description: '  Rooted and healthy ',
      salePrice: '14.50',
      currencyCode: ' gbp ',
    }),
    {
      plantId: 9,
      ownerUserId: 'owner-uuid',
      listingType: 'SALE',
      title: 'Rare cutting',
      description: 'Rooted and healthy',
      salePrice: 14.5,
      currencyCode: 'GBP',
    }
  );
});
