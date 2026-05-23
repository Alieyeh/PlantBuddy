const TEXTBOX_SPELLCHECK_PROPS = Object.freeze({
  autoCorrect: true,
  spellCheck: true,
  autoComplete: 'on',
  autoCapitalize: 'sentences',
  inputMode: 'text',
});

const SHORT_TEXTBOX_SUGGESTION_PROPS = Object.freeze({
  autoCorrect: true,
  spellCheck: true,
  autoComplete: 'on',
  autoCapitalize: 'words',
  inputMode: 'text',
});

const SEARCH_TEXTBOX_SUGGESTION_PROPS = Object.freeze({
  autoCorrect: true,
  spellCheck: true,
  autoComplete: 'on',
  autoCapitalize: 'none',
  inputMode: 'search',
});

const MACHINE_TEXTBOX_PROPS = Object.freeze({
  autoCorrect: false,
  spellCheck: false,
  autoComplete: 'off',
  autoCapitalize: 'none',
});

/**
 * Shared React Native TextInput props. Web spellcheck still depends on the
 * user's browser/OS language settings, so these props request suggestions
 * rather than guaranteeing visible underlines in every environment.
 */
module.exports = {
  MACHINE_TEXTBOX_PROPS,
  SEARCH_TEXTBOX_SUGGESTION_PROPS,
  SHORT_TEXTBOX_SUGGESTION_PROPS,
  TEXTBOX_SPELLCHECK_PROPS,
};
