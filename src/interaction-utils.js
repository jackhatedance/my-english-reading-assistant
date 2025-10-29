const INTERACTION_KEY_CLICK_WORD = 'clickWord';
const INTERACTION_KEY_HOVER_WORD = 'hoverWord';
const INTERACTION_KEY_SELECT_TEXT = 'selectText';

function getEffectiveInteractionOption(options, siteOptions, key){
  let option = siteOptions.interaction[key];
  if(option ==null){
    option = options.interaction[key];
  }
  return option;
}

export { INTERACTION_KEY_CLICK_WORD, INTERACTION_KEY_HOVER_WORD, INTERACTION_KEY_SELECT_TEXT, getEffectiveInteractionOption }