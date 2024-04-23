<script setup>
import TabHeader from './TabHeader.vue';
import TabBody from './TabBody.vue';
import VocabularyTabContent from './VocabularyTabContent.vue';
import NotesTabContent from './NotesTabContent.vue';

import { ref, watch } from "vue";


const props = defineProps({
    notes: Array,
    page: Object,
});

const sidepanelTabVocabulary = chrome.i18n.getMessage('sidepanelTabVocabulary');
const sidepanelTabNotes = chrome.i18n.getMessage('sidepanelTabNotes');

var activeTabId = ref('vocabulary-tab');

console.log('Tabs notes:' + JSON.stringify(props.notes));

function onActiveTab(tabId) {
    console.log('on active tab:' + tabId);
    activeTabId.value = tabId;
}

const page = ref(props.page);
watch(() => props.page, (newValue, oldValue) => {
    // React to prop changes
    //console.log('page changed:', newValue);
    page.value = newValue; // Update the value in the ref if needed
});


</script>

<template>
    <div class=tab-container>

        

        <ul class="tabs clearfix">
            
            <TabHeader tabId="notes-tab" :name="sidepanelTabNotes" :isActive="activeTabId === 'notes-tab'" @activeTab="onActiveTab">
            </TabHeader>

            <TabHeader tabId="vocabulary-tab" :name="sidepanelTabVocabulary" :isActive="activeTabId === 'vocabulary-tab'" @activeTab="onActiveTab"></TabHeader>
        </ul>

        <TabBody id="vocabulary-tab" v-show="activeTabId === 'vocabulary-tab'" :isActive="activeTabId === 'vocabulary-tab'">
            
            <VocabularyTabContent :page="page"></VocabularyTabContent>
        </TabBody>
        <TabBody id="notes-tab" v-show="activeTabId === 'notes-tab'" :isActive="activeTabId === 'notes-tab'">
            
            <NotesTabContent :notes="props.notes"></NotesTabContent>
        </TabBody>

        
    </div>
</template>
