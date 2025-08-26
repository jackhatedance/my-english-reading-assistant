
import { createApp, ref } from 'vue';

import Popup from './components/popup/Popup.vue'
import { initializeOptionService } from './service/optionService.js';
import { initVocabularyIfEmpty } from './service/optionService.js';

var gQueryParams = parseQuery(window.location.search);

await initializeOptionService();
await initVocabularyIfEmpty();

createApp(Popup, { gQueryParams })
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