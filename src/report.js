
import { createApp, ref } from 'vue';
import { createWebHashHistory, createRouter } from 'vue-router'
import Report from './components/report/Report.vue'
import Time from './components/report/Time.vue'
import Site from './components/report/Site.vue'
import Page from './components/report/Page.vue'
import Book from './components/report/Book.vue'
import Activity from './components/report/Activity.vue'

import { sendTrackEventToBackground } from './message.js'
import { generatePageViewEvent } from './track/google-analytics.js'


import { localizeHtmlPage} from './locale.js'

localizeHtmlPage();


const routes = [    
    { path: '/', redirect: '/time' },
    { path: '/time', component: Time },
    { path: '/site', component: Site },
    { path: '/page', component: Page },
    { path: '/activity', component: Activity },
    { path: '/book', component: Book },
    
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


sendTrackEventToBackground(generatePageViewEvent());