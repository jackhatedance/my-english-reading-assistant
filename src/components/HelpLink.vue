<script setup>
import { ref, computed } from 'vue';

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
    let document = 'guide.html';
    if(props.type =='faq'){
        document = 'faq.html'
    }
    return chrome.runtime.getURL(`${document}#${props.keyword}`);    
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