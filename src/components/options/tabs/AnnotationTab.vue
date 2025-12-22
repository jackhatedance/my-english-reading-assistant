<script setup>
import { ref } from 'vue';
import { getOptions, updateOptions } from '../../../service/optionService.js';
import ExternalLink from '../../common/ExternalLink.vue'
import { ElSelect, ElOption } from 'element-plus'
import 'element-plus/es/components/select/style/css'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'

const t = chrome.i18n.getMessage;

const dualAnnotationEnabled = ref(true);
const interlacedEnabled = ref(true);
const hideWordClassEnabled = ref(true);

async function onChangeSetting() {
  const annotation = {
    dualAnnotation: {
      enabled: dualAnnotationEnabled.value,
    },
    interlaced: {
      enabled: interlacedEnabled.value,
    },
    hideWordClass: {
      enabled: hideWordClassEnabled.value,
    },
  };
  let newOptions = { annotation };
  await updateOptions(newOptions);
}

function updateSettings(options){
  let annotationOptions = options.annotation;

  dualAnnotationEnabled.value = annotationOptions.dualAnnotation.enabled;
  interlacedEnabled.value = annotationOptions.interlaced.enabled;
  hideWordClassEnabled.value = annotationOptions.hideWordClass.enabled;
}

const init = async () => {
  let options = await getOptions();
  updateSettings(options);  
};

init();
</script>

<template>

  <div class="sections">

    <div class="section">
      <div class="label">
        <h3>{{ t('options_annotation_features') }}</h3>
        <p>{{ t('options_annotation_features_description') }}</p>
      </div>
      <div class="input">
        <div>
          <div class="option">
            <label>{{ t('options_annotation_feature_dual_enanbled') }}</label>
            <el-switch class="right" @change="onChangeSetting" v-model="dualAnnotationEnabled" data-testid="dual-annotation"/>
          </div>

          <div class="option">
            <label>{{ t('options_annotation_feature_interlaced_enanbled') }}</label>
            <el-switch class="right" @change="onChangeSetting" v-model="interlacedEnabled" data-testid="interlaced"/>
          </div>

          <div class="option">
            <label>{{ t('options_annotation_feature_hide_word_class_enanbled') }}</label>
            <el-switch class="right" @change="onChangeSetting" v-model="hideWordClassEnabled" data-testid="hide-word-class"/>
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