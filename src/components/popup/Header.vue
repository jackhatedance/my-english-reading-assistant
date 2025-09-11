<script setup>
import { ref, provide } from 'vue';
import { getWebSiteDocumentUrl } from '../../site.js';

const props = defineProps({
    options: Object
});

const t = chrome.i18n.getMessage;

function onClickEpub(){
    chrome.tabs.create({url: 'https://app.flowoss.com/'});
}

function onClickPdf(){
    chrome.tabs.create({url: 'https://mozilla.github.io/pdf.js/web/viewer.html'});
}

function onClickDictionary(){
    chrome.tabs.create({url: chrome.runtime.getURL('dictionary.html')});
}



function onClickReport(){
    chrome.tabs.create({url: chrome.runtime.getURL('report.html')});
}



function onClickHelp(){
    chrome.tabs.create({url: getWebSiteDocumentUrl('guide')});
}


function onClickOptions(){
    chrome.runtime.openOptionsPage();
}


const init = async () => {

};


init();
</script>

<template>
    <div id="options-container">
        
        <a href="#" :title="t('popupEpub')"><img src="icons/epub.png" alt="Epub Reader" @click="onClickEpub"></a>
        
        <a href="#" :title="t('popupPdf')"><img src="icons/pdf.png" alt="PDF Reader" @click="onClickPdf"></a>

        <a id="dictionary" href="#" :title="t('popupDictionary')"><img src="icons/dictionary.png" alt="dictionary" @click="onClickDictionary"></a>
        
        <a v-show="props.options.report.enabled" id="report" href="#" :title="t('popupReport')"><img src="icons/report.png" alt="report" @click="onClickReport"></a>
        
        <a id="help" href="#" :title="t('popupHelp')"><img src="icons/help.png" alt="help" @click="onClickHelp"></a>
        
        <a id="options" href="#" :title="t('popupOptions')"><img src="icons/options.png" alt="options" @click="onClickOptions"></a>
    </div>
</template>
<style>
.options-container a {
    margin-right: 10px;

    img:hover {
        transform: scale(1.2);
    }
}

</style>