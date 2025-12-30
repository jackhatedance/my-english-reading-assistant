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

const readingDifficultyLabel = chrome.i18n.getMessage('sidepanelReadingDifficultyLabel');

const readingDifficultyMsg = computed(() => {
        let readingDifficultyEnum = props.page.readingDifficulty;
        let readingDifficultyMsgKey = 'sidepanelReadingDifficulty' + readingDifficultyEnum[0].toUpperCase() + readingDifficultyEnum.toLowerCase().substring(1);    
        //console.log('readingDifficultyMsgKey:'+readingDifficultyMsgKey);
        return chrome.i18n.getMessage(readingDifficultyMsgKey);
    });


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
        <div class="header">
            <h4>{{ sidepanelWordStatisticsLabel }}<span id="wordStatistics">{{ props.page.unknownWordsCount }}/{{
            props.page.totalWordCount }} ({{ percentage }}%) {{ readingDifficultyLabel }}:{{ readingDifficultyMsg }}</span></h4>
        </div>
        <div class="vocabular-toolbar">
            <div class="tips">{{ sidepanelTitleDesc }}</div>

            <div class="actions">
                <button data-testid="showAllDefinitions" id="showAllDefinitions" @click="clickShowDefinition" :title="sidepanelShowDefinitions">+</button>
                <button id="hideAllDefinitions" @click="clickHideDefinition" :title="sidepanelHideDefinitions">-</button>
            </div>    
        </div>
        <UnknownWordList :items="page.unknownWords" :showDefinition="showDefinition" :reset="reset" :siteOptions="page.siteOptions"></UnknownWordList>
    </div>
</template>

<style>
.vocabulary-list {
    .header{
        text-align: center;
    }
  

    .vocabular-toolbar {
        clear: both;
        display: inline-block;
        width: 100%;
        
        .tips {
            float: left;
            margin-left: 30px;;
        }
        .actions {
            float: right;
            button {
                margin: 2px;
            }

        }
    }
}
</style>