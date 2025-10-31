<script setup>
import { ref, watch, onMounted, onBeforeUpdate, onUpdated, computed, inject, toRaw } from 'vue';


const emit = defineEmits(['change-setting']);

const props = defineProps({
    

});

const options = inject('options');

const additionalDictionaryMetas = inject('additionalDictionaryMetas');
const additionalDictionaries = inject('additionalDictionaries');

const t = chrome.i18n.getMessage;


function onChangeSetting(){
    emit('change-setting');
}

const init = async () => {

};

init();
</script>

<template>
    <div class="dictionary-settings">
        
          <div class="field" id="dictionaryField" >
            <label>{{ t('popupAdditionalDictionaryLabel') }}<span class="red">*</span></label>
            <div class="inputs">
              <select id="additionalDictionaries" v-model="additionalDictionaries" @change="onChangeSetting" multiple size="5">
                  <option v-for="(meta, index) in additionalDictionaryMetas" :key="meta.name" :value="meta.name">{{ meta.displayName }}</option>
              </select>           
            </div> 
          </div>

    </div>
</template>

<style>
#additionalDictionaries {
  width: 10em;
}

</style>