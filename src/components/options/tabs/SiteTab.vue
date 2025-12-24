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

const selectedSwitchMode = ref('none');


async function onChangeSwitchMode() {
  const _switch = {
    mode: selectedSwitchMode.value,
  };
  let newOptions = { switch: _switch };
  await updateOptions(newOptions);
}

function updateSwitchMode(options){
  selectedSwitchMode.value = options.switch.mode;
}

const init = async () => {
  let options = await getOptions();

  updateSwitchMode(options);
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
          <label>{{ t('options_general_switch_mode_label') }}<ExternalLink type="guide" keyword="默认开关模式"/></label>
          <el-select data-testid="switch-mode" class="switch-mode" v-model="selectedSwitchMode" @change="onChangeSwitchMode" >
            
            <el-option :value="SWITCH_MODE_OPTION_ON" :label="t('options_general_switch_mode_on')" />
            <el-option :value="SWITCH_MODE_OPTION_OFF" :label="t('options_general_switch_mode_off')" />
            <el-option :value="SWITCH_MODE_OPTION_AUTO" :label="t('options_general_switch_mode_auto')" />
            
          </el-select> 
        </div>
      </div>
      <div class="action">

      </div>
    </div>
    

    
  </div>

</template>
<script>

</script>