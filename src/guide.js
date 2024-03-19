'use strict';
import './guide.css';
import guide from './guide.md';

function setup(){
  document.getElementById('app').innerHTML=guide;
}
document.addEventListener('DOMContentLoaded', setup);
