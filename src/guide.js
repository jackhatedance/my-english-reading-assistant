'use strict';
import './guide.css';
import guide from './guide.md';
import {localizeHtmlPage} from './locale.js';

localizeHtmlPage();
function setup(){
  document.getElementById('article').innerHTML=guide;
}
document.addEventListener('DOMContentLoaded', setup);
