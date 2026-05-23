const assert = require('node:assert/strict');
const test = require('node:test');

const {
  MACHINE_TEXTBOX_PROPS,
  SEARCH_TEXTBOX_SUGGESTION_PROPS,
  SHORT_TEXTBOX_SUGGESTION_PROPS,
  TEXTBOX_SPELLCHECK_PROPS,
} = require('../../src/utils/textInputProps');

test('natural language text boxes enable spellcheck and suggestions', () => {
  assert.equal(TEXTBOX_SPELLCHECK_PROPS.spellCheck, true);
  assert.equal(TEXTBOX_SPELLCHECK_PROPS.autoCorrect, true);
  assert.equal(TEXTBOX_SPELLCHECK_PROPS.autoComplete, 'on');
  assert.equal(TEXTBOX_SPELLCHECK_PROPS.autoCapitalize, 'sentences');
  assert.equal(TEXTBOX_SPELLCHECK_PROPS.inputMode, 'text');
});

test('short display fields use word capitalization with suggestions', () => {
  assert.equal(SHORT_TEXTBOX_SUGGESTION_PROPS.spellCheck, true);
  assert.equal(SHORT_TEXTBOX_SUGGESTION_PROPS.autoCorrect, true);
  assert.equal(SHORT_TEXTBOX_SUGGESTION_PROPS.autoComplete, 'on');
  assert.equal(SHORT_TEXTBOX_SUGGESTION_PROPS.autoCapitalize, 'words');
  assert.equal(SHORT_TEXTBOX_SUGGESTION_PROPS.inputMode, 'text');
});

test('search boxes can use suggestions without sentence capitalization', () => {
  assert.equal(SEARCH_TEXTBOX_SUGGESTION_PROPS.spellCheck, true);
  assert.equal(SEARCH_TEXTBOX_SUGGESTION_PROPS.autoCorrect, true);
  assert.equal(SEARCH_TEXTBOX_SUGGESTION_PROPS.autoComplete, 'on');
  assert.equal(SEARCH_TEXTBOX_SUGGESTION_PROPS.autoCapitalize, 'none');
  assert.equal(SEARCH_TEXTBOX_SUGGESTION_PROPS.inputMode, 'search');
});

test('machine-readable fields disable spelling behavior', () => {
  assert.equal(MACHINE_TEXTBOX_PROPS.spellCheck, false);
  assert.equal(MACHINE_TEXTBOX_PROPS.autoCorrect, false);
  assert.equal(MACHINE_TEXTBOX_PROPS.autoComplete, 'off');
  assert.equal(MACHINE_TEXTBOX_PROPS.autoCapitalize, 'none');
});
