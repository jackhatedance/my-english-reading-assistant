<script setup>
import { ref } from 'vue';
import {getOptions, updateOptions} from '../../../service/optionService.js';

const t = chrome.i18n.getMessage;
const enableRootAndAffix = ref(false);

async function onChange(){
    const rootAndAffix = {
        enabled: enableRootAndAffix.value,
    };
    let newOptions = {rootAndAffix};
    await updateOptions(newOptions);
}

const init = async () => {
    let options = await getOptions();

    enableRootAndAffix.value = options.rootAndAffix?.enabled
};

init();
</script>

<template>

<div class="sections">
          <div class="section">
            <div class="label">
              <p>{{ t('optionsRootAndAffixLabelDesc') }}</p>
            </div>
        
            <div class="input">
              <div>
                <label>{{ t('optionsRootAndAffixModeLabel') }}</label>
                <input type="checkbox" v-model="enableRootAndAffix" @change="onChange">
              </div>
              
            </div>
            <div class="action">
              
            </div>
          </div>
        </div>

</template>
