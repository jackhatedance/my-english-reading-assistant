<script setup>
import { ref, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { lookup } from '../dictionary.js';
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

const lookupResultRef = ref(null);
watch(() => props.word, (newValue) => {
      
    _lookup(newValue);
});

function _lookup(query){
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
    let lookupResult = lookup(query, dicts, { fromRaw: true, outputFormats: ['html'] });
    if(lookupResult) {
        
        if(isSystemDictionary(lookupResult.dictionary)){
            lookupResult.alias = getSystemDictionaryAlias(lookupResult.dictionary);
        }else{
            lookupResult.alias = lookupResult.dictionary;
        }

        let html = lookupResult.html;
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

function onIframeLoad(){
    //console.log('onIframeLoad');
    _lookup(props.word);
}
</script>

<template>
    <div class="word-container">
        <div class="word-definition">
            <p><span class="dictionary">[{{ lookupResultRef?.alias }}]</span></p>
            
            <iframe @load="onIframeLoad" sandbox="allow-scripts allow-same-origin" ref="dictionaryIframe" id="dictionary-iframe" class="content-iframe" src="dictionary.html" ></iframe>
            
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
