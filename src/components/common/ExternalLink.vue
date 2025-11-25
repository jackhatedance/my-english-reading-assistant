<script setup>
import { ref, computed } from 'vue';
import { getWebSiteDocumentUrl } from '../../site.js';

const t = chrome.i18n.getMessage;

const props = defineProps({
    message: {
        default: '',
        type: String
    },
    type: String,
    keyword: String,    
    effect: String,
});

const imageUrl = chrome.runtime.getURL("icons/external-link.svg");

const isDark = computed(()=>{
    return props.effect == 'dark';
});

const url = computed(() => {
    let document = getWebSiteDocumentUrl('guide');
    if(props.type =='faq'){
        document = getWebSiteDocumentUrl('faq');
    }
    //return chrome.runtime.getURL(`${document}#${props.keyword}`);    
    return `${document}#${props.keyword}`;    
});


const init = async () => {

};


init();
</script>

<template>
    <a :class="{ 'external-link': true, dark: isDark }" target=_blank :href="url">{{ props.message }}
        

            <svg viewBox="0 0 24 24" width="1em" height="1em" class="link-icon"><path fill="currentColor" d="M10 6v2H5v11h11v-5h2v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6zm11-3v8h-2V6.413l-7.793 7.794l-1.414-1.414L17.585 5H13V3h8z"></path></svg>
            
        </a>
</template>
<style>
   a.external-link {
    text-decoration: none;
    color: black;
    &.dark{
        color: white;
    }
    
   }

</style>