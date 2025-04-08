<script setup>
import { ref, inject, computed, watch } from 'vue'
import { humanRemain } from '../../../utils/dateUtils.js'
import { DICTIONARY_INDEX_STATUS_OK } from '../../../dictionary/dictConstants.js'

const emits = defineEmits(['value-changed']);

const props = defineProps({
    dict: Object,
});

const enabled = defineModel('enabled');
const indexBuildingProgress = inject('indexBuildingProgress');

const t = chrome.i18n.getMessage;


const jobStatus = computed(() => {    
    if(indexBuildingProgress.value && indexBuildingProgress.value.name == props.dict.name){
        if(props.dict.data.index.status == DICTIONARY_INDEX_STATUS_OK){
            return '';
        }

        if(indexBuildingProgress.value.progress.rate < 1){
            let job = indexBuildingProgress.value.progress.job;
            let pct = (indexBuildingProgress.value.progress.rate * 100).toFixed(0);

            let eta = humanRemain(indexBuildingProgress.value.progress.remain);

            return `${job} (${pct}% ETA: ${eta}) `;
        }else{
            return '';
        }        
    }   
});


const init = async () => {
    enabled.value = props.dict.enabled;
};

init();
</script>

<template>
    <div class="detail">
        <h3>Detail</h3>
        <div class="fields">
            <label>{{ t('options_dictionary_detail_name') }}</label>
            <span>{{ props.dict.displayName }}</span>

            <label>{{ t('options_dictionary_detail_type') }}</label>
            <span>{{ props.dict.type }}</span>
                
            <label>{{ t('options_dictionary_detail_format') }}</label>
            <span>{{ props.dict.format }}</span>

            <label>{{ t('options_dictionary_detail_definition_format') }}</label>
            <span>{{ props.dict.definitionFormat }}</span>            
                
            <label>{{ t('options_dictionary_detail_entryNumber') }}</label>
            <span>{{ props.dict.size }}</span>

            <label>{{ t('options_dictionary_detail_enabled') }}</label>
            <input type="checkbox" v-model="enabled" @change="$emit('value-changed')" :disabled="!props.dict.data.index?.support">
            
            <label>{{ t('options_dictionary_detail_index') }}</label>
            <span>{{ props.dict.data?.index?.status }}</span>

            <label>{{ t('options_dictionary_detail_job') }}</label>
            <span>{{ jobStatus }}</span>
        </div>
    </div>
</template>
<style>

.fields {
    display: grid;
    grid-template-columns: auto auto;
    height: fit-content;
    label {
        font-weight: bold;
    }
  }
</style>
