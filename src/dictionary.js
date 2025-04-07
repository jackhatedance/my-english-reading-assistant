
import { createApp, ref } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router'
import Dictionary from './components/dictionary/Dictionary.vue'
import Lookup from './components/dictionary/Lookup.vue'

import { localizeHtmlPage} from './locale.js'

localizeHtmlPage();


const routes = [    
    { path: '/', component: Lookup},    
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

createApp(Dictionary)
    .use(router)
    .mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');


});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //console.log(`rcv msg: ${request.type}`);
    if(request.type == 'DICTIONARY_JOB_PROGRESS'){
        
    }

    sendResponse({});
});