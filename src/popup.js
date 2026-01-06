
import { createApp, ref } from 'vue';

import Popup from './components/popup/Popup.vue'
import { initializeOptionService } from './service/optionService.js';
import { initVocabularyIfEmpty } from './service/optionService.js';
import { collect } from './track/google-analytics.js'

import { localizeHtmlPage} from './locale.js'

localizeHtmlPage();

//import ElementPlus from 'element-plus'
//import 'element-plus/dist/index.css'
var gQueryParams = parseQuery(window.location.search);

await initializeOptionService();
await initVocabularyIfEmpty();

createApp(Popup, { gQueryParams })
//.use(ElementPlus)
    .mount('#app');



function parseQuery(queryString) {
    var query = {};
    var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}

document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');


});


collect([
    {
        name: "page_view",
        params: {
            page_title: document.title,
            page_location: document.location.href
        },
    }
]);
    
