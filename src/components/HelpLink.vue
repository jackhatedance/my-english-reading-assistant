<script setup>
import { ref, computed } from 'vue';

const t = chrome.i18n.getMessage;

const props = defineProps({
    type: String,
    keyword: String,
});


const url = computed(() => {
    let document = 'guide.html';
    if(props.type =='faq'){
        document = 'faq.html'
    }
    return chrome.runtime.getURL(`${document}#${props.keyword}`);    
});

const init = async () => {

};


init();
</script>

<template>
    <a class="help" target=_blank :href="url">❓</a>
</template>
<style>
   a.help {
    text-decoration: none;
   }

</style>