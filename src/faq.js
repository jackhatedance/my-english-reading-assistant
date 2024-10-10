'use strict';
import './faq.css';
import faq from './faq.md';

function setup(){
  document.getElementById('article').innerHTML=faq;
}
document.addEventListener('DOMContentLoaded', setup);
