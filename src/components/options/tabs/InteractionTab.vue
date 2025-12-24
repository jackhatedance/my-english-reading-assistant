<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import ExternalLink from '../../common/ExternalLink.vue'
import { SWITCH_MODE_OPTION_ON, SWITCH_MODE_OPTION_OFF, SWITCH_MODE_OPTION_AUTO } from '../../../switch-mode.js'
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'

const t = chrome.i18n.getMessage;

const clickWord = ref(true);
const hoverWord = ref(true);
const selectText = ref(false);


async function onChangeInteraction() {
  const _interaction = {
    clickWord: clickWord.value,
    hoverWord: hoverWord.value,
    selectText: selectText.value,
  };
  let newOptions = { interaction: _interaction };
  await updateOptions(newOptions);
}

function updateInteraction(options){
  clickWord.value = options.interaction.clickWord;
  hoverWord.value = options.interaction.hoverWord;
  selectText.value = options.interaction.selectText;
}

const init = async () => {
  let options = await getOptions();

  updateInteraction(options);
};

init();
</script>

<template>

  <div class="sections">


    <div class="section">
      <div class="label">
        <h3>{{ t('options_general_interaction_label') }}</h3>        
      </div>
      <div class="input">
        <div>
          <div class="option">
            <label>{{ t('options_general_interaction_click_word_label') }}</label>
            <el-switch class="right" @change="onChangeInteraction" v-model="clickWord" />
          </div>
          
          <div class="option">
            <label>{{ t('options_general_interaction_hover_word_label') }}</label>
            <el-switch class="right" @change="onChangeInteraction" v-model="hoverWord" />
  
          </div>

          <div class="option">
            <label>{{ t('options_general_interaction_select_text_label') }}</label>
            <el-switch class="right" @change="onChangeInteraction" v-model="selectText" />
          </div>
        </div>
      </div>
      <div class="action">

      </div>
    </div>
    
  </div>

</template>
<script>

</script>