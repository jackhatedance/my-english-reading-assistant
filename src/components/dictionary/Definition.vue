<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    query: String,
    text: String,
    html: String,
});

const dictionaryIframe = ref(null);
const definitionFormat = ref('html');

watch(() => props.html, async (newValue) => {
      
    sendHtmlMessage();
});

function sendHtmlMessage(){
    const iframe = dictionaryIframe.value;
    let request = { html: props.html };
    if(iframe){
        iframe.contentWindow.postMessage(request, '*');    
        //console.log('message posted');
    } 
}

function onIframeLoad(){
    //console.log('onIframeLoad');
    sendHtmlMessage();
}

async function init() {
    sendHtmlMessage();
}

init();
</script>

<template>
    <div class="definition-container">
        <iframe v-if="definitionFormat == 'html'" @load="onIframeLoad" sandbox="allow-scripts allow-same-origin" ref="dictionaryIframe" id="dictionary-iframe" class="content-iframe" src="definition.html" ></iframe>
        <p v-if="definitionFormat == 'text'" v-html="props.text"></p>
    </div>
</template>

<style>
.definition-container{
    height: 100%;
}

.content-iframe{
    width: 100%;
    height: 100%;
}

iframe {
    border-width: 0;
}

</style>
