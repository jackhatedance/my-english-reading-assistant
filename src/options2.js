
import { createApp } from 'vue';
import Options from './components/options/Options.vue'


import {localizeHtmlPage} from './locale.js';
localizeHtmlPage();

createApp(Options).mount('#app');


document.addEventListener('DOMContentLoaded', async () => {
    //console.log('DOMContentLoaded');
  

});
