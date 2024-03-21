'use strict';
import './guide.css';
import guide from './guide.md';

function setup(){
  document.getElementById('article').innerHTML=guide;
}
document.addEventListener('DOMContentLoaded', setup);
