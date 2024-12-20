'use strict';
import './faq.css';
import faq from './faq.md';
import {localizeHtmlPage} from './locale.js';

localizeHtmlPage();

function setup(){
  document.getElementById('article').innerHTML=faq;
}
document.addEventListener('DOMContentLoaded', setup);
