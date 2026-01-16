<script setup>
import { ref, reactive, toRaw } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import { LOGGER_NAMES } from '../../../log.js'

import ExternalLink from '../../common/ExternalLink.vue'
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'
import { ElInputNumber } from 'element-plus'
import 'element-plus/es/components/input-number/style/css'

const t = chrome.i18n.getMessage;

const primaryAnnotationPositionMin = ref(-0.2);
const primaryAnnotationPositionMax = ref(0.5);

const secondaryAnnotationPositionMin = ref(-1.2);
const secondaryAnnotationPositionMax = ref(-0.8);

const textFontSizeMax = ref(28);

const maxMeaningNumberMax = ref(20);

const partialTokenizationTokenLengthMin = ref(50000);

const debugLoggers = ref([]);




async function onChangeSetting() {
  const advanced = {
    primaryAnnotationPositionMin: primaryAnnotationPositionMin.value,
    primaryAnnotationPositionMax: primaryAnnotationPositionMax.value,

    secondaryAnnotationPositionMin: secondaryAnnotationPositionMin.value,
    secondaryAnnotationPositionMax: secondaryAnnotationPositionMax.value,

    textFontSizeMax: textFontSizeMax.value,

    maxMeaningNumberMax: maxMeaningNumberMax.value,

    partialTokenizationTokenLengthMin: partialTokenizationTokenLengthMin.value,

    debugLoggers: toRaw(debugLoggers.value),
  };
  let newOptions = { advanced };
  await updateOptions(newOptions);
}

function sendMessageToBackground(){
  chrome.runtime.sendMessage(
        {
            type: 'OPTIONS_CHANGE',
            payload: {
                
            },
        },
        (response) => {
            //console.log(response.message);
        }
    );
}
const init = async () => {
  let options = await getOptions();

  let advancedOptions = options.advanced;

  primaryAnnotationPositionMin.value = advancedOptions.primaryAnnotationPositionMin;
  primaryAnnotationPositionMax.value = advancedOptions.primaryAnnotationPositionMax;

  secondaryAnnotationPositionMin.value = advancedOptions.secondaryAnnotationPositionMin;
  secondaryAnnotationPositionMax.value = advancedOptions.secondaryAnnotationPositionMax;

  textFontSizeMax.value = advancedOptions.textFontSizeMax;

  maxMeaningNumberMax.value = advancedOptions.maxMeaningNumberMax;

  partialTokenizationTokenLengthMin.value = advancedOptions.partialTokenizationTokenLengthMin;

  debugLoggers.value = advancedOptions.debugLoggers;
  
  sendMessageToBackground();
};

init();
</script>

<template>

  <div class="sections">
    <h2 class="warning">{{ t('options_advanced_warning') }}</h2>
    <div class="section">
      <div class="label">
        <h3>{{ t('options_advanced_popup_label') }}</h3>        
      </div>
      <div class="input">
        <div class="option">
          <label>{{ t('options_advanced_primary_annotation_position_min_label') }}</label>
          <el-input-number v-model="primaryAnnotationPositionMin" @change="onChangeSetting" :step="0.1" size="small" class="right"/>
          
        </div>
        <div class="option">
          <label>{{ t('options_advanced_primary_annotation_position_max_label') }}</label>
          <el-input-number v-model="primaryAnnotationPositionMax" @change="onChangeSetting" :step="0.1" size="small" class="right"/>
          
        </div>
        
        <div class="option">
          <label>{{ t('options_advanced_secondary_annotation_position_min_label') }}</label>
          <el-input-number v-model="secondaryAnnotationPositionMin" @change="onChangeSetting" :step="0.1" size="small" class="right"/>
          
        </div>
        
        <div class="option">
          <label>{{ t('options_advanced_secondary_annotation_position_max_label') }}</label>
          <el-input-number v-model="secondaryAnnotationPositionMax" @change="onChangeSetting" :step="0.1" size="small" class="right"/>
          
        </div>

        <div class="option">
          <label>{{ t('options_advanced_secondary_text_font_size_max_label') }}</label>
          <el-input-number v-model="textFontSizeMax" @change="onChangeSetting" :step="1" size="small" class="right"/>
          
        </div>

        <div class="option">
          <label>{{ t('options_advanced_max_meaning_number_max_label') }}</label>
          <el-input-number v-model="maxMeaningNumberMax" @change="onChangeSetting" :step="1" size="small" class="right"/>
          
        </div>

        <div class="option">
          <label>{{ t('options_advanced_partial_tokenization_start_length_label') }}</label>
          <el-input-number v-model="partialTokenizationTokenLengthMin" @change="onChangeSetting" :step="1000" size="small" class="right"/>
          
        </div>
      </div>
      
    </div>

    <div class="section">
      <div class="label">
        <h3>{{ t('options_advanced_log_label') }}</h3>        
      </div>
      <div class="input">
        <div class="option">
          <label>{{ t('options_advanced_log_debug_loggers_label') }}</label>
          <el-select v-model="debugLoggers" @change="onChangeSetting" multiple size="small" class="right">
            <el-option
              v-for="item in LOGGER_NAMES"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select> 
        </div>
        
      </div>
      
    </div>
    
    
  </div>

</template>
<script>

</script>