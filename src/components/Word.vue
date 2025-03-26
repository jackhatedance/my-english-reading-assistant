<script setup>
import { ref, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { lookup } from '../dictionary.js';
import { getWordClassAbbreviation } from '../dictionary/wordClass.js';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../vocabularyStore.js';
import { sendMessageMarkWordToBackground } from '../message.js'; 
import { isKnown } from '../language.js'
import { getEnabledDictionaryNamesFromCache } from '../dictionary/customDictionary.js'
import { getSystemDictionaryAlias, isSystemDictionary } from '../dictionary/systemDictionary.js'
import { mergeEntries } from '../dictionary/entry-utils.js'

const props = defineProps({
    word: String,
    siteOptions: Object,
});

const sendMessageToContentPage = inject('sendMessageToContentPage');

const markToggleTips = chrome.i18n.getMessage('sidepanelWordActionMarkToggle');
const clearMarkTips = chrome.i18n.getMessage('sidepanelWordActionClearMark');

let tickImgUrl = chrome.runtime.getURL("icons/tick.png");
let clearImgUrl = chrome.runtime.getURL("icons/clear.png");

const lookupResult = computed(() => {
    
    let dicts = getEnabledDictionaryNamesFromCache();
    //use default dicts

    //console.log(props.siteOptions);
    let additionalDictionaries = props.siteOptions.other.additionalDictionaries;
    for(let additionalDictionary of additionalDictionaries){
        if(additionalDictionary && !dicts.includes(additionalDictionary)){
            dicts.unshift(additionalDictionary);
        }
    }
    
    //console.log(dicts);
    let lookupResult = lookup(props.word, dicts);
    if(lookupResult) {
        lookupResult.formattedText = jsonToText(lookupResult.json);


        if(isSystemDictionary(lookupResult.dictionary)){
            lookupResult.alias = getSystemDictionaryAlias(lookupResult.dictionary);
        }else{
            lookupResult.alias = lookupResult.dictionary;
        }
    }    

    return lookupResult;
});

function jsonToText(entries){
    if(!entries || entries.length == 0){
        return '';
    }

    let entry = mergeEntries(entries);

    let definitionObj = entry;

    let groupTexts = [];
    for(let definitionGroup of definitionObj.definitionGroups){
        const { name, definitions} = definitionGroup;
        let wordClass = getWordClassAbbreviation(name);

        let definitionTexts = definitions.filter(item => item.text != '').map(item => item.text );
        let definitionsText = definitionTexts.join(',');
        let groupText = `${wordClass} ${definitionsText}`;
        groupTexts.push(groupText);
    }
    let groupsText = groupTexts.join('\n');
    
    let pronunciation = definitionObj.pronunciation;    
    if(!definitionObj.pronunciation || definitionObj.pronunciation == ''){
        pronunciation = '';
    }else {
        pronunciation = `/${definitionObj.pronunciation}/`;
    }
    let text = `${pronunciation}\n${groupsText}`;

    //console.log(text);
    return text;
}

const knownRef = new ref(false);
watch(() => props.word, (newValue) => {
    updateKnown();
});

async function updateKnown() {
    let knownWords = await loadKnownWords();
    let known = isKnown(props.word, knownWords);
    knownRef.value = known;
}

onMounted(() => {
    updateKnown();

});

onBeforeUpdate(() => {
    //console.log('Note before update, props.note:'+JSON.stringify(props.note));

});

onUpdated(() => {
    //console.log('Note updated');

});

async function onMarkToggle() {
    let knownWords = await loadKnownWords();
    let known = isKnown(props.word, knownWords);
    if(known){
        await onMarkAsUnknown();
    } else {
        await onMarkAsKnown();
    }
    updateKnown();
    //console.log('mark toggle');
}

async function onMarkAsUnknown() {
    let targetWord = props.word;
    let wordChanges = await markWordAsUnknown(targetWord);

    //console.log('send known words updated to content page');
    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
        },
    },
        null, (response) => { });

    sendMessageMarkWordToBackground(wordChanges);
}

async function onMarkAsKnown() {
    let targetWord = props.word;
    let wordChanges = await markWordAsKnown(targetWord);

    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
        },
    },
        null, (response) => { });
    sendMessageMarkWordToBackground(wordChanges);
}

async function onClearMark() {
    let targetWord = props.word;
    let wordChanges = await removeWordMark(targetWord);
    updateKnown();
    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
        },
    },
        null, (response) => { });
    sendMessageMarkWordToBackground(wordChanges);
}

</script>

<template>
    <div class="word-container">
        <div class="word-definition">
            <p><span class="word">{{ props.word }}</span> <span class="dictionary">[{{ lookupResult?.alias }}]</span></p>
            <p class="word-definition-content">{{ lookupResult?.formattedText }}</p>
        </div>
        <div class="word-mark-actions">
            <div :class="{ 'word-mark-action': true, unknown: !knownRef }"><button @click="onMarkToggle" :title='markToggleTips'>
                <img :src='tickImgUrl' />
            </button></div>
            <div class="word-mark-action"><button @click="onClearMark" :title='clearMarkTips'>
                <img :src='clearImgUrl' />
            </button></div>
        </div>
    </div>
</template>

<style>
.word-definition {
    border: solid black 1px;

    .word {
        font-size: large;
    }
    .dictionary {
        font-size: smaller;
    }
    .word-definition-content {
        white-space: pre-line;
    }
}

.word-mark-actions {
    display: flex;
    img {
        width: 20px;
    }

}

.word-mark-actions .unknown {
    img {
        filter: grayscale(100%);
    }
}

.word-mark-action {
    margin: 4px;
}
</style>
