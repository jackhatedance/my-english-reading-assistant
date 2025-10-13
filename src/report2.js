
import { createApp, ref } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router'
import Report from './components/report/Report.vue'
import Vocabulary from './components/report/Vocabulary.vue'
import Site from './components/report/Site.vue'
import Page from './components/report/Page.vue'
import Activity from './components/report/Activity.vue'

import { localizeHtmlPage} from './locale.js'

localizeHtmlPage();


const routes = [    
    { path: '/', redirect: '/vocabulary' },
    { path: '/vocabulary', component: Vocabulary },
    { path: '/site', component: Site },
    { path: '/page', component: Page },
    { path: '/activity', component: Activity },
    
]

const router = createRouter({
    linkActiveClass: 'active',
    history: createWebHashHistory(),
    routes,
});

const query = ref('');

createApp(Report)
    .use(router)
    .mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');


});
