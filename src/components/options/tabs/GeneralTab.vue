<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import HelpLink from '../../HelpLink.vue'
import { SWITCH_MODE_OPTION_ON, SWITCH_MODE_OPTION_OFF, SWITCH_MODE_OPTION_AUTO } from '../../../switch-mode.js'

const t = chrome.i18n.getMessage;
const selectedRegion = ref('none');
const selectedSwitchMode = ref('none');

const enableRootAndAffix = ref(false);

const clickWord = ref(true);
const hoverWord = ref(true);
const selectText = ref(false);

async function onChangeRegion() {
  const pronunciation = {
    region: selectedRegion.value,
  };
  let newOptions = { pronunciation };
  await updateOptions(newOptions);
}

async function onChangeSwitchMode() {
  const _switch = {
    mode: selectedSwitchMode.value,
  };
  let newOptions = { switch: _switch };
  await updateOptions(newOptions);
}

async function onChangeRootAndAffixMode(){
    const rootAndAffix = {
        enabled: enableRootAndAffix.value,
    };
    let newOptions = {rootAndAffix};
    await updateOptions(newOptions);
}

async function onChangeInteraction() {
  const _interaction = {
    clickWord: clickWord.value,
    hoverWord: hoverWord.value,
    selectText: selectText.value,
  };
  let newOptions = { interaction: _interaction };
  await updateOptions(newOptions);
}

function updateRegion(options){
  selectedRegion.value = options.pronunciation.region;
}

function updateSwitchMode(options){
  selectedSwitchMode.value = options.switch.mode;
}

function updateRootAndAffixMode(options){
  enableRootAndAffix.value = options.rootAndAffix?.enabled;
}

function updateInteraction(options){
  clickWord.value = options.interaction.clickWord;
  hoverWord.value = options.interaction.hoverWord;
  selectText.value = options.interaction.selectText;
}

const init = async () => {
  let options = await getOptions();
  updateRegion(options);  
  updateSwitchMode(options);
  updateRootAndAffixMode(options);  
  updateInteraction(options);
};

init();
</script>

<template>

  <div class="sections">

    <div class="section">
      <div class="label">
        <h3>{{ t('options_general_switch_label') }}</h3>        
      </div>
      <div class="input">
        <div>
          <label>{{ t('options_general_switch_mode_label') }}<HelpLink type="guide" keyword="默认开关模式"/></label>
          <select data-testid="switch-mode" class="switch-mode" v-model="selectedSwitchMode" @change="onChangeSwitchMode" >
            
            <option :value="SWITCH_MODE_OPTION_ON">{{ t('options_general_switch_mode_on') }}</option>
            <option :value="SWITCH_MODE_OPTION_OFF">{{ t('options_general_switch_mode_off') }}</option>
            <option :value="SWITCH_MODE_OPTION_AUTO">{{ t('options_general_switch_mode_auto') }}</option>
            
          </select> 
        </div>
      </div>
      <div class="action">

      </div>
    </div>
    
    <div class="section">
      <div class="label">
        <h3>{{ t('options_general_pronunciation_label') }}</h3>        
      </div>
      <div class="input">
        <div>
          <label>{{ t('options_general_pronunciation_region_label') }}</label>
          <select data-testid="region" class="region" v-model="selectedRegion" @change="onChangeRegion" >
            <option value="none">{{ t('options_general_pronunciation_region_none') }}</option>
            <option value="uk">{{ t('options_general_pronunciation_region_uk') }}</option>
            <option value="us">{{ t('options_general_pronunciation_region_us') }}</option>
            <option value="all">{{ t('options_general_pronunciation_region_all') }}</option>
          </select> 
        </div>
      </div>
      <div class="action">

      </div>
    </div>
    
    <div class="section">
      <div class="label">
        <h3>{{ t('options_general_root_and_affix_label') }}</h3> 
        <p>{{ t('optionsRootAndAffixLabelDesc') }}</p>
      </div>
  
      <div class="input">
        <div>
          <label>{{ t('optionsRootAndAffixModeLabel') }}</label>
          <input data-testid="root-and-affix-mode" type="checkbox" v-model="enableRootAndAffix" @change="onChangeRootAndAffixMode">
        </div>
        
      </div>
      <div class="action">
        
      </div>
    </div>

    <div class="section">
      <div class="label">
        <h3>{{ t('options_general_interaction_label') }}</h3>        
      </div>
      <div class="input">
        <div>
          <div>
            <label>{{ t('options_general_interaction_click_word_label') }}</label>
            <input type="checkbox" @change="onChangeInteraction" v-model="clickWord">
          </div>
          
          <div>
            <label>{{ t('options_general_interaction_hover_word_label') }}</label>
            <input type="checkbox" @change="onChangeInteraction" v-model="hoverWord">
  
          </div>

          <div>
            <label>{{ t('options_general_interaction_select_text_label') }}</label>
            <input type="checkbox" @change="onChangeInteraction" v-model="selectText">
          </div>
        </div>
      </div>
      <div class="action">

      </div>
    </div>
    
  </div>

</template>
