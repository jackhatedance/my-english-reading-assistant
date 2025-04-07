
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

const query = ref('');

createApp(Dictionary, { query: query })
    .use(router)
    .mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');


});

window.addEventListener('message', event => {
    console.log('dictionary page window recieve message:'+ JSON.stringify(event.data));
    // IMPORTANT: check the origin of the data!
    /* TODO
    if (event.origin === 'https://your-first-site.example') {
        //console.log(event.data);
    } 
    */
   
    let request = event.data;
    if (request.type === 'DICTIONARY_LINK') {
        const href = request.data;
        let matchResult = href.match(/.*:\/\/(.*)/);
        if(matchResult && matchResult.length>1){
            let entry = matchResult[1];
            query.value = entry.toLowerCase();
        }    
    }
}, false);