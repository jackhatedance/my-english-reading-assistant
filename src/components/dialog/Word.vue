<script setup>
import { ref, onMounted, onBeforeUpdate, onUpdated, computed, inject, watch } from 'vue';
import { lookup } from '../../dictionaries.js';
import { loadKnownWords, markWordAsKnown, markWordAsUnknown, removeWordMark } from '../../vocabularyStore.js';
import { sendMessageMarkWordToBackground } from '../../message.js'; 
import { isKnown, getWordPartObjects } from '../../language.js'
import { getEnabledDictionaryNamesFromCache } from '../../dictionary/customDictionary.js'
import { getSystemDictionaryAlias, isSystemDictionary } from '../../dictionary/systemDictionary.js'
import { getOptions } from '../../service/optionService.js'
import { entriesToHtml } from '../../dictionary/definition-formatter.js'
import { ElSwitch } from 'element-plus'
import 'element-plus/es/components/switch/style/css'
import { truncateString } from '../../utils/stringUtils.js'

const props = defineProps({
    dictionary: String,
    word: String,
    siteOptions: Object,
});

const actionRecorder = inject('action-recorder');

const sendMessageToContentPage = inject('sendMessageToContentPage');
const t = chrome.i18n.getMessage;
const markToggleTips = chrome.i18n.getMessage('sidepanelWordActionMarkToggle');
const clearMarkTips = chrome.i18n.getMessage('sidepanelWordActionClearMark');

let tickImgUrl = chrome.runtime.getURL("icons/tick.png");
let clearImgUrl = chrome.runtime.getURL("icons/clear.png");

const dictionaryIframeHtml = ref(null);
const dictionaryIframeText = ref(null);

const definitionFormatFull = ref(false);
const definitionFormat = ref('text');

const lookupResultRef = ref(null);
watch(() => props.word, async (newValue) => {
    lookupResultRef.value = null;    
    _lookup(newValue, [props.dictionary]);
});

watch(() => lookupResultRef.value, async (newValue) => {
    
    refreshHtml();
});
function refreshHtml(){
    refreshDefinitionHtml(dictionaryIframeHtml.value, lookupResultRef.value?.embeddedHtml);
    refreshDefinitionHtml(dictionaryIframeText.value, lookupResultRef.value?.formattedText);
}
function refreshDefinitionHtml(iframe, html){
    let htmlContent = '';
    if(html){
        htmlContent = html;
    }

    let request = { html: htmlContent };
    if(iframe){
        iframe.contentWindow.postMessage(request, '*');    
        //console.log('message posted');
    }  
}

async function _lookup(query, dicts){
    
    let options = await getOptions(); 
    //use default dicts

    //console.log(props.siteOptions);
    if(!dicts || dicts.length == 0){
        dicts = getEnabledDictionaryNamesFromCache();
        let additionalDictionaries = props.siteOptions.other.additionalDictionaries;
        for(let additionalDictionary of additionalDictionaries){
            if(additionalDictionary && !dicts.includes(additionalDictionary)){
                dicts.unshift(additionalDictionary);
            }
        }
    }

    //console.log(dicts);
    let lookupResult = lookup(query, { fromRaw: true, outputFormats: ['json', { name: 'html', optional: true }], pronunciationRegion: options.pronunciation.region }, dicts);
    if(lookupResult) {
        
        if(isSystemDictionary(lookupResult.dictionaryName)){
            lookupResult.alias = getSystemDictionaryAlias(lookupResult.dictionaryName);
        }else{
            lookupResult.alias = lookupResult.dictionaryName;
        }

        let entries = lookupResult.json;
        let wordPartObjects = getWordPartObjects(lookupResult.query);
        lookupResult.formattedText = entriesToHtml(lookupResult.query, entries, options.pronunciation.region, wordPartObjects);
        
        if(lookupResult.html){
            let html = lookupResult.html;
            if(lookupResult.toEmbeddedHtml){
                lookupResult.embeddedHtml = await lookupResult.toEmbeddedHtml(html);
            }else {
                lookupResult.embeddedHtml = html;
            }

        } 

        //fallback to text mode
        if(!lookupResult.html && definitionFormat.value == 'html'){
            definitionFormat.value = 'text';
        }
    } 
    lookupResultRef.value = lookupResult; 
}

const dictionaryName = computed(() => {
    let name = lookupResultRef.value?.alias;
    if(name == null){
        name = '';
    }
    return name;    
});


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

    actionRecorder({name: 'markAsUnknown', word: taregtWord} );

    //console.log('send known words updated to content page');
    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
            action: 'markAsUnknown'
        },
    },
        null, (response) => { });

    sendMessageMarkWordToBackground(wordChanges);
}

function onChangeDefinitionFormatFull(){
    definitionFormat.value = definitionFormatFull.value ? 'html' : 'text';
}

function openToDictionaryPage(){
    let dictionaryValue = encodeURIComponent(lookupResultRef.value?.dictionaryName);
    let queryValue = encodeURIComponent(props.word);

    let url = chrome.runtime.getURL(`dictionary.html#/?dictionary=${dictionaryValue}&query=${queryValue}`);
    //chrome.tabs.create({url});
    let wnd = window.open(url, 'dictionary');
    //window.open(location.protocol + "/help.aspx" + (hash ? "#" + hash : ""), "helpWindow", "width=750, height=600, resizable=1, scrollbars=1, location=0, directories=0, status=no, menubar=no, toolbar=no");
    wnd.addEventListener("hashchange", function () { this.location.reload() }, false);
    //window.open(url);
}

async function onMarkAsKnown() {
    let targetWord = props.word;
    let wordChanges = await markWordAsKnown(targetWord);

    actionRecorder({name: 'markAsKnown', word: targetword});

    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
            action: 'markAsKnown'
        },
    },
        null, (response) => { });
    sendMessageMarkWordToBackground(wordChanges);
}

async function onClearMark() {
    let targetWord = props.word;
    let wordChanges = await removeWordMark(targetWord);
    updateKnown();

    actionRecorder({name: 'clearMark', word: targetword});

    sendMessageToContentPage({
        type: 'KNOWN_WORDS_UPDATED',
        payload: {
            action: 'clearMark'
        },
    },
        null, (response) => { });
    sendMessageMarkWordToBackground(wordChanges);
}

function onIframeLoad(){
    //console.log('onIframeLoad');
    refreshHtml();
}


function init() {
    //console.log(`watch word, new value: ${props.word}`); 
    _lookup(props.word, [props.dictionary]);
}


init();
</script>

<template>
    <div class="word-container">
        <h3 class="title">{{ t('sidepanelActionsTabWordLabelWord') }}</h3>
        <div class="word-definition">
            <div class="dictionary"><b>{{ truncateString(dictionaryName, 40) }}</b> 
                <el-switch v-if="lookupResultRef?.formattedText && lookupResultRef?.html" v-model="definitionFormatFull" @change="onChangeDefinitionFormatFull" size="small" :active-text="t('sidepanel_word_action_dictionary_full')" :inactive-text="t('sidepanel_word_action_dictionary_concise')"/>
                <button @click="openToDictionaryPage">{{ t('sidepanel_word_action_dictionary_open_in_dictionary') }}</button>
            </div>
            
            <iframe v-if="definitionFormat == 'html'" @load="onIframeLoad" sandbox="allow-scripts allow-same-origin" ref="dictionaryIframeHtml" id="dictionary-iframe-html" class="content-iframe" src="definition.html" ></iframe>
            <iframe v-if="definitionFormat == 'text'" @load="onIframeLoad" sandbox="allow-scripts allow-same-origin" ref="dictionaryIframeText" id="dictionary-iframe-text" class="content-iframe" src="definition.html" ></iframe>
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
    
    
    
    .dictionary {
        font-size: smaller;
        margin: 5px;

        .el-switch {
            margin: 5px;
        }
    }
    .word-definition-content {
        white-space: pre-line;
    }

    .content-iframe {
        width: 100%;
        
    }

    iframe {
        border: solid gray 1px;
    }

    #dictionary-iframe-html {
        height: 290px;
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
