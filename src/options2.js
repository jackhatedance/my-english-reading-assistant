
import { createApp } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router'
import Options from './components/options/Options.vue'
import VocabularyTab from './components/options/tabs/VocabularyTab.vue'
import NotesTab from './components/options/tabs/NotesTab.vue'
import RootAndAffixTab from './components/options/tabs/RootAndAffixTab.vue'
import ReportTab from './components/options/tabs/ReportTab.vue'
import DictionaryTab from './components/options/tabs/DictionaryTab.vue'
import UnrecognizedWordsTab from './components/options/tabs/UnrecognizedWordsTab.vue'

import { localizeHtmlPage} from './locale.js'

localizeHtmlPage();

const routes = [
    { path: '/', redirect: '/vocabulary' },
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

createApp(Options)
    .use(router)
    .mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');


});
