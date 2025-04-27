<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';

const t = chrome.i18n.getMessage;
const selectedRegion = ref('none');

async function onChangeRegion() {
  const pronunciation = {
    region: selectedRegion.value,
  };
  let newOptions = { pronunciation };
  await updateOptions(newOptions);
}

function updateRegion(region){
  selectedRegion.value = region;
}

const init = async () => {
  let options = await getOptions();
  updateRegion(options.pronunciation.region);  
};

init();
</script>

<template>

  <div class="sections">
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
