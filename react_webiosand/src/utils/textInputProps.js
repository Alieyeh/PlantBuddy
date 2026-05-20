const TEXTBOX_SPELLCHECK_PROPS = Object.freeze({
  autoCorrect: true,
  spellCheck: true,
  autoCapitalize: 'sentences',
});

const SHORT_TEXTBOX_SUGGESTION_PROPS = Object.freeze({
  autoCorrect: true,
  spellCheck: true,
  autoCapitalize: 'words',
});

const SEARCH_TEXTBOX_SUGGESTION_PROPS = Object.freeze({
  autoCorrect: true,
  spellCheck: true,
  autoCapitalize: 'none',
});

const MACHINE_TEXTBOX_PROPS = Object.freeze({
  autoCorrect: false,
  spellCheck: false,
  autoCapitalize: 'none',
});

/**
 * Shared React Native TextInput props for fields where users write natural
 * language. Web uses spellCheck, while mobile keyboards use autoCorrect.
 */
module.exports = {
  MACHINE_TEXTBOX_PROPS,
  SEARCH_TEXTBOX_SUGGESTION_PROPS,
  SHORT_TEXTBOX_SUGGESTION_PROPS,
  TEXTBOX_SPELLCHECK_PROPS,
};
