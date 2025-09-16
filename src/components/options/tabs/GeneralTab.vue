<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import HelpLink from '../../HelpLink.vue'

const t = chrome.i18n.getMessage;
const selectedRegion = ref('none');
const selectedAutoEnable = ref('none');

async function onChangeRegion() {
  const pronunciation = {
    region: selectedRegion.value,
  };
  let newOptions = { pronunciation };
  await updateOptions(newOptions);
}

async function onChangeAutoEnable() {
  const enable = {
    auto: selectedAutoEnable.value,
  };
  let newOptions = { enable };
  await updateOptions(newOptions);
}

function updateRegion(region){
  selectedRegion.value = region;
}

function updateAutoEnable(value){
  selectedAutoEnable.value = value;
}

const init = async () => {
  let options = await getOptions();
  updateRegion(options.pronunciation.region);  
  updateAutoEnable(options.enable.auto);  
};

init();
</script>

<template>

  <div class="sections">

    <div class="section">
      <div class="label">
        <h3>{{ t('options_general_enable_label') }}</h3>        
      </div>
      <div class="input">
        <div>
          <label>{{ t('options_general_enable_auto_label') }}<HelpLink type="guide" keyword="默认开关模式"/></label>
          <select data-testid="auto-enable" class="auto-enable" v-model="selectedAutoEnable" @change="onChangeAutoEnable" >
            
            <option value="all">{{ t('options_general_enable_auto_all') }}</option>
            <option value="none">{{ t('options_general_enable_auto_none') }}</option>
            <option value="english">{{ t('options_general_enable_auto_english') }}</option>
            
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
    
  </div>

</template>
