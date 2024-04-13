import './sidePanel.css';
import { createApp } from 'vue';
import SidePanel from './components/SidePanel.vue'

import {localizeHtmlPage} from './locale.js';
localizeHtmlPage();

createApp(SidePanel).mount('#app')
