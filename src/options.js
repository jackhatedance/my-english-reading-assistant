
import { createApp, ref } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router'

import {LoadingPlugin} from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/css/index.css';

import Options from './components/options/Options.vue'
import GeneralTab from './components/options/tabs/GeneralTab.vue'
import VocabularyTab from './components/options/tabs/VocabularyTab.vue'
import AnnotationTab from './components/options/tabs/AnnotationTab.vue'
import NotesTab from './components/options/tabs/NotesTab.vue'
import SiteTab from './components/options/tabs/SiteTab.vue'
import BookTab from './components/options/tabs/BookTab.vue'
import ReportTab from './components/options/tabs/ReportTab.vue'
import DictionaryTab from './components/options/tabs/DictionaryTab.vue'
import InteractionTab from './components/options/tabs/InteractionTab.vue'
import AdvancedTab from './components/options/tabs/AdvancedTab.vue'
import UnrecognizedWordsTab from './components/options/tabs/UnrecognizedWordsTab.vue'

import { localizeHtmlPage} from './locale.js'

localizeHtmlPage();

const indexBuildingProgress = ref();

const routes = [
    { path: '/', redirect: '/general' },
    { path: '/general', component: GeneralTab },
    { path: '/vocabulary', component: VocabularyTab },
    { path: '/annotation', component: AnnotationTab },
    { path: '/notes', component: NotesTab },
    { path: '/site', component: SiteTab },
    { path: '/book', component: BookTab },
    { path: '/report', component: ReportTab },
    { path: '/dictionary', component: DictionaryTab },
    { path: '/interaction', component: InteractionTab },
    { path: '/advanced', component: AdvancedTab },
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