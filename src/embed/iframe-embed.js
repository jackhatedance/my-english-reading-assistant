'use strict';

import { AppModes } from '../components/types.js';

function containsVueApp(){
  var dialog = document.getElementById('mea-vue-container');
  if(dialog){
    return true;
  } else {
    return false;
  }

}

function addVueApp() {

  var dialog = document.createElement('dialog');
  dialog.id = "mea-vue-container";
  dialog.classList.add('mea-element');
  dialog.classList.add('mea-dialog');

  document.body.appendChild(dialog);


  let sidePanelUrl = chrome.runtime.getURL("side-panel.html");
  let innerHTML =
    `<iframe id="mea-vueapp-iframe" src="${sidePanelUrl}" ></iframe>`;
  dialog.innerHTML = innerHTML;

}

function sendMessageToEmbeddedApp(request, sender, resolve) {
  //console.log('send message to iframe:'+JSON.stringify(request));
  let iframe = document.getElementById('mea-vueapp-iframe');

  let url = chrome.runtime.getURL('');
  iframe.contentWindow.postMessage(request, url);
}

function resizeVueApp(width, height) {
  let iframe = document.getElementById('mea-vueapp-iframe');
  iframe.style.width = width + 'px';
  iframe.style.height = height + 'px';
}

export { containsVueApp, addVueApp, sendMessageToEmbeddedApp, resizeVueApp };