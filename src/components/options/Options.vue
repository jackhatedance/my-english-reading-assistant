<script setup>
import { ref } from 'vue';
import SideBar from './SideBar.vue';
import SideBarItem from './SideBarItem.vue';
import TabContents from './TabContents.vue';
import TabContent from './TabContent.vue';
import VocabularyTab from './tabs/VocabularyTab.vue';
import NotesTab from './tabs/NotesTab.vue';
import RootAndAffixTab from './tabs/RootAndAffixTab.vue';
import ReportTab from './tabs/ReportTab.vue';
import DictionaryTab from './tabs/DictionaryTab.vue';
import UnrecognizedWordsTab from './tabs/UnrecognizedWordsTab.vue';

const t = chrome.i18n.getMessage;
const activeModule = ref();

function onClickModule(module){
    activeModule.value = module;
    
}

const init = async () => {
    activeModule.value = 'vocabulary';
};


init();
</script>

<template>
    <div class="options-container">
        
        <SideBar>
            <SideBarItem id="vocabulary" :isActive="activeModule === 'vocabulary'" :name="t('optionsSectionVocabularyTitle')" @click-module="onClickModule"></SideBarItem>
            <SideBarItem id="notes" :isActive="activeModule === 'notes'" :name="t('optionsEditNotesLabel')" @click-module="onClickModule"></SideBarItem>
            <SideBarItem id="root-and-affix" :isActive="activeModule === 'root-and-affix'" :name="t('optionsRootAndAffixLabel')" @click-module="onClickModule"></SideBarItem>
            <SideBarItem id="report" :isActive="activeModule === 'report'" :name="t('optionsReportLabel')" @click-module="onClickModule"></SideBarItem>
            <SideBarItem id="dictionary" :isActive="activeModule === 'dictionary'" :name="t('optionsSectionDictionaryTitle')" @click-module="onClickModule"></SideBarItem>
            <SideBarItem id="unrecognized-words" :isActive="activeModule === 'unrecognized-words'" :name="t('optionsUnrecognizedWordsLabel')" @click-module="onClickModule"></SideBarItem>

        </SideBar>
        <TabContents>
            <TabContent v-if="activeModule === 'vocabulary'">
                <VocabularyTab></VocabularyTab>
            </TabContent>
            <TabContent v-if="activeModule === 'notes'">
                <NotesTab></NotesTab>
            </TabContent>
            <TabContent v-if="activeModule === 'root-and-affix'">
                <RootAndAffixTab></RootAndAffixTab>
            </TabContent>
            <TabContent v-if="activeModule === 'report'">
                <ReportTab></ReportTab>
            </TabContent>
            <TabContent v-if="activeModule === 'dictionary'">
                <DictionaryTab></DictionaryTab>
            </TabContent>
            <TabContent v-if="activeModule === 'unrecognized-words'">
                <UnrecognizedWordsTab></UnrecognizedWordsTab>
            </TabContent>

        </TabContents>
    </div>
</template>
<style>
html, body, #app {
    height: 100%;     
    margin: 0;
}

.options-container {
   display: flex;
   height: 100%;
}


.action {
    button {
        border: 0;
        display: inline-block;
        padding: 10px 20px;
        margin: 4px;
        color: white;
        background-color: #26a890;
        font-size: 16px;
        cursor: pointer;
        border-radius: 4px;
        text-decoration: none;
        transition: transform 0.2s ease;
        user-select: none;
    }
}
</style>