'use strict';




function addToolbar(document) {
    //check if existed
    if (document.querySelector('.mea-toolbar')) {
        return;
    }

    let questionMarkImgUrl = chrome.runtime.getURL("icons/question-mark.png");
    let tickImgUrl = chrome.runtime.getURL("icons/tick.png");
    let clearImgUrl = chrome.runtime.getURL("icons/clear.png");
    let notesImgUrl = chrome.runtime.getURL("icons/notes.png");

    var elemDiv = document.createElement('div');
    elemDiv.innerHTML = `
      <button class='mea-mark-unknown mea-toolbar-button'>
        <img class='mea-icon' src='${questionMarkImgUrl}'></img>
      </button>
      <button class='mea-mark-known mea-toolbar-button'>
        <img class='mea-icon' src='${tickImgUrl}'></img>
      </button>  
      <button class='mea-mark-clear mea-toolbar-button'>
        <img class='mea-icon' src='${clearImgUrl}'></img>
      </button>
      <button class='mea-notes mea-toolbar-button'>
        <img class='mea-icon' src='${notesImgUrl}'></img>
      </button>  
      `;

    elemDiv.classList.add('mea-element');
    elemDiv.classList.add('mea-toolbar');
    elemDiv.style.visibility = 'hidden';
    document.body.appendChild(elemDiv);
}

function showToolbar(show) {
  let value = show? 'visible':'hidden';
  document.querySelector('.mea-toolbar').style.visibility = value;
}

export { addToolbar, showToolbar };