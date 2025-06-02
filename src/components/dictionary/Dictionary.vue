<script setup>
import { ref, provide } from 'vue';
import { loadSystemDictionariesToCache } from '../../dictionary/systemDictionary.js'

const t = chrome.i18n.getMessage;

const props = defineProps({
   query: Object
});

provide('query', props.query);

const init = async () => {

    await loadSystemDictionariesToCache();
    
};

init();
</script>

<template>
    <div class="dictionary-container">
        <RouterView />
    </div>
</template>
<style>
html, body, #app {
    height: 100%;     
    margin: 0;
    min-width: 900px;
    overflow: hidden;
}


.dictionary-container {
    height: 100%;
}
</style>