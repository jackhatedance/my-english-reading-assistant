<script setup>
import { ref, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { lookup } from '../dictionaries.js';
import { getWordClassAbbreviation } from '../dictionary/wordClass.js';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../vocabularyStore.js';
import { sendMessageMarkWordToBackground } from '../message.js'; 
import { isKnown } from '../language.js'
import { getEnabledDictionaryNamesFromCache } from '../dictionary/customDictionary.js'
import { getSystemDictionaryAlias, isSystemDictionary } from '../dictionary/systemDictionary.js'
import { textToBase64 } from '../utils/fileUtils.js'

const props = defineProps({
    word: String,
    siteOptions: Object,
});

const sendMessageToContentPage = inject('sendMessageToContentPage');

const markToggleTips = chrome.i18n.getMessage('sidepanelWordActionMarkToggle');
const clearMarkTips = chrome.i18n.getMessage('sidepanelWordActionClearMark');

let tickImgUrl = chrome.runtime.getURL("icons/tick.png");
let clearImgUrl = chrome.runtime.getURL("icons/clear.png");

const dictionaryIframe = ref(null);
const definitionFormat = ref('text');
const lookupResultRef = ref(null);
watch(() => props.word, async (newValue) => {
      
    await _lookup(newValue);
});

async function _lookup(query){
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
    let lookupResult = lookup(query, dicts, { fromRaw: true, outputFormats: ['json', 'html'] });
    if(lookupResult) {
        
        if(isSystemDictionary(lookupResult.dictionaryName)){
            lookupResult.alias = getSystemDictionaryAlias(lookupResult.dictionaryName);
        }else{
            lookupResult.alias = lookupResult.dictionaryName;
        }

        let json = lookupResult.json;
        lookupResult.formattedText = jsonToText(json);

        let html = lookupResult.html;
        if(lookupResult.dictionary?.toEmbeddedHtml){
            html = await lookupResult.dictionary.toEmbeddedHtml(html);
        }
        
        //console.log(html);
        //let html = '<body>Foo</body>';
        const iframe = dictionaryIframe.value;
        let request = { html };
        if(iframe){
            iframe.contentWindow.postMessage(request, '*');    
            //console.log('message posted');
        }        
    } 
    lookupResultRef.value = lookupResult; 
}

function jsonToText(entries){
    if(!entries || entries.length == 0){
        return '';
    }

    let texts = [];
    for(let entry of entries){
        let definitionObj = entry;

        let groupTexts = [];
        for(let definitionGroup of definitionObj.definitionGroups){
            const { name } = definitionGroup;
            let wordClass = getWordClassAbbreviation(name);

            let definitions = definitionGroup.definitions.filter(item => item.text && item.text.length > 0);

            let shortDefinitions = definitions.filter(item => item.text && item.text.length < 10);
            if(shortDefinitions.length >= 3){
                definitions = shortDefinitions;
            }
            let definitionTexts = definitions.map(item => item.text );
            
            let definitionsText = definitionTexts.join(',');
            let groupText = `${wordClass} ${definitionsText}`;
            groupTexts.push(groupText);
        }
        let groupsText = groupTexts.join('<br> ');

        let pronunciation = definitionObj.pronunciation;    
        if(!definitionObj.pronunciation || definitionObj.pronunciation == ''){
            pronunciation = '';
        }else {
            pronunciation = `/${definitionObj.pronunciation}/`;
        }

        let text = `${pronunciation}<br>${groupsText}`;

        texts.push(text);
    }
    
    
    //console.log(text);
    return texts.join('<br><br>');
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

function switchToText(){
    if(definitionFormat.value != 'text'){
        definitionFormat.value = 'text';
    }
}

function switchToHtml(){
    if(definitionFormat.value != 'html'){
        definitionFormat.value = 'html';
    }
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

function onIframeLoad(){
    //console.log('onIframeLoad');
    _lookup(props.word);
}


function init() {
    console.log(`watch word, new value: ${props.word}`); 
    _lookup(props.word);
}


init();
</script>

<template>
    <div class="word-container">
        <div class="word-definition">
            <p><span class="word">{{ props.word }}</span><span class="dictionary">[{{ lookupResultRef?.alias }}]</span> <button @click="switchToText">text</button> <button @click="switchToHtml">html</button></p>
            
            <iframe v-if="definitionFormat == 'html'" @load="onIframeLoad" sandbox="allow-scripts allow-same-origin" ref="dictionaryIframe" id="dictionary-iframe" class="content-iframe" src="definition.html" ></iframe>
            <p v-if="definitionFormat == 'text'" v-html="lookupResultRef?.formattedText"></p>
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
.word-container {
    height: 400px;
}

.word-definition {
    border: solid black 1px;
    height: 85%;
    .word {
        font-size: large;
    }
    .dictionary {
        font-size: smaller;
    }
    .word-definition-content {
        white-space: pre-line;
    }

    .content-iframe {
        width: 100%;
        height: 80%;
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
