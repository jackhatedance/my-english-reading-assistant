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
const selectedRegion = ref('none');


const enableRootAndAffix = ref(false);

async function onChangeRegion() {
  const pronunciation = {
    region: selectedRegion.value,
  };
  let newOptions = { pronunciation };
  await updateOptions(newOptions);
}

async function onChangeRootAndAffixMode(){
    const rootAndAffix = {
        enabled: enableRootAndAffix.value,
    };
    let newOptions = {rootAndAffix};
    await updateOptions(newOptions);
}

function updateRegion(options){
  selectedRegion.value = options.pronunciation.region;
}

function updateRootAndAffixMode(options){
  enableRootAndAffix.value = options.rootAndAffix?.enabled;
}

const init = async () => {
  let options = await getOptions();
  updateRegion(options);  
  updateRootAndAffixMode(options);  
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
          <el-select data-testid="region" class="region" v-model="selectedRegion" @change="onChangeRegion" >
            <el-option value="none" :label="t('options_general_pronunciation_region_none')" />
            <el-option value="uk" :label="t('options_general_pronunciation_region_uk')" />
            <el-option value="us" :label="t('options_general_pronunciation_region_us')" />
            <el-option value="all" :label="t('options_general_pronunciation_region_all')" />
          </el-select> 
        </div>
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
          <el-switch class="right" data-testid="root-and-affix-mode" v-model="enableRootAndAffix" @change="onChangeRootAndAffixMode" />
        </div>
        
      </div>
      
    </div>

    
  </div>

</template>
<script>

</script>