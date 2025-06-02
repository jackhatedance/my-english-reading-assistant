
import { createApp, ref } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router'

import {LoadingPlugin} from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

import Options from './components/options/Options.vue'
import GeneralTab from './components/options/tabs/GeneralTab.vue'
import VocabularyTab from './components/options/tabs/VocabularyTab.vue'
import NotesTab from './components/options/tabs/NotesTab.vue'
import RootAndAffixTab from './components/options/tabs/RootAndAffixTab.vue'
import ReportTab from './components/options/tabs/ReportTab.vue'
import DictionaryTab from './components/options/tabs/DictionaryTab.vue'
import UnrecognizedWordsTab from './components/options/tabs/UnrecognizedWordsTab.vue'

import { localizeHtmlPage} from './locale.js'

localizeHtmlPage();

const indexBuildingProgress = ref();

const routes = [
    { path: '/', redirect: '/general' },
    { path: '/general', component: GeneralTab },
    { path: '/vocabulary', component: VocabularyTab },
    { path: '/notes', component: NotesTab },
    { path: '/root-and-affix', component: RootAndAffixTab },
    { path: '/report', component: ReportTab },
    { path: '/dictionary', component: DictionaryTab },
    { path: '/unrecognized-words', component: UnrecognizedWordsTab },
]

const router = createRouter({
    linkActiveClass: 'active',
    history: createWebHashHistory(),
    routes,
})

createApp(Options, { indexBuildingProgress })
    .use(router)
    .use(LoadingPlugin)
    .mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');


});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    //console.log(`rcv msg: ${request.type}`);
    if(request.type == 'DICTIONARY_JOB_PROGRESS'){
        const { name, progress } = request.payload;
        const { job, rate } = progress;
        //console.log(`dictinary ${name} ${job} progress: ${rate}`);
        indexBuildingProgress.value = { name, progress };
    }

    sendResponse({});
});