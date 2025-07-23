<script setup>
import { ref, computed } from 'vue';
import { getWebSiteDocumentUrl } from '../site.js';

const t = chrome.i18n.getMessage;

const props = defineProps({
    message: {
        default: '',
        type: String
    },
    type: String,
    keyword: String,
    parentheses: {
        default: true,
        type: Boolean
    }
});


const url = computed(() => {
    let document = getWebSiteDocumentUrl('guide');
    if(props.type =='faq'){
        document = getWebSiteDocumentUrl('faq');
    }
    //return chrome.runtime.getURL(`${document}#${props.keyword}`);    
    return `${document}#${props.keyword}`;    
});

const leftParenthesis = computed(() => {
    return props.parentheses ? '(' : '';    
});

const rightParenthesis = computed(() => {
    return props.parentheses ? ')' : '';    
});

const init = async () => {

};


init();
</script>

<template>
    <a class="help" target=_blank :href="url">{{ leftParenthesis }}{{ props.message }}❓{{ rightParenthesis }}</a>
</template>
<style>
   a.help {
    text-decoration: none;
   }

</style>