<script setup>
import { ref, computed, watch, onMounted, onUpdated } from 'vue';
import UnknownWordList from './vocabulary/UnknownWordList.vue';

const props = defineProps({
    page: Object,

});

//const unknownWordArray = ref([]);
const showDefinition = ref(false);
const reset = ref(false);

const sidepanelTitle = chrome.i18n.getMessage('sidepanelTitle');
const sidepanelWordStatisticsLabel = chrome.i18n.getMessage('sidepanelWordStatisticsLabel');
const sidepanelTitleDesc = chrome.i18n.getMessage('sidepanelTitleDesc');
const sidepanelShowDefinitions = chrome.i18n.getMessage('sidepanelShowDefinitions');
const sidepanelHideDefinitions = chrome.i18n.getMessage('sidepanelHideDefinitions');


const percentage = computed(() => Math.floor(props.page.unknownWordsRatio * 100));

//console.log('vocabularyTabContent, props.page:' + JSON.stringify(props.page));


const page = ref(props.page);
watch(() => props.page, (newValue, oldValue) => {
    // React to prop changes
    //console.log('page changed:', JSON.stringify(newValue));
    page.value = newValue; // Update the value in the ref if needed
});


onMounted(() => {
    //console.log('mounted');

   
});

onUpdated(() => {
    //console.log('updated');
    
});

function clickShowDefinition(event){
    showDefinition.value = true;
    reset.value = ! reset.value;
}
function clickHideDefinition(event){
    showDefinition.value = false;
    reset.value = ! reset.value;
}
</script>

<template>
    <div v-if="page" class="vocabulary-list">
        <h3 id="title" class="vocabulary-title">{{ sidepanelTitle }}</h3>
        <h4>{{ sidepanelWordStatisticsLabel }}<span id="wordStatistics">{{ props.page.unknownWordsCount }}/{{
            props.page.totalWordCount }} ({{ percentage }}%)</span></h4>
        <p>{{ sidepanelTitleDesc }}</p>

        <div class="toolbar">
            <button id="showAllDefinitions" @click="clickShowDefinition">{{ sidepanelShowDefinitions }}</button>
            <button id="hideAllDefinitions" @click="clickHideDefinition">{{ sidepanelHideDefinitions }}</button>
        </div>
        <UnknownWordList :items="page.unknownWords" :showDefinition="showDefinition" :reset="reset"></UnknownWordList>
    </div>
</template>

<style>
.vocabulary-list {
    
}


</style>