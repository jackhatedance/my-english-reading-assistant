'use strict';

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

function saveTextAsFile(text, name, ext = 'txt') {
    var textToWrite = text;
    var textFileAsBlob = new Blob([ textToWrite ], { type: 'text/plain' });

    let yyyymmdd = formatDate(new Date());
    var fileNameToSaveAs = `my-${name}-${yyyymmdd}.${ext}`; //filename.extension
  
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
      // Chrome allows the link to be clicked without actually adding it to the DOM.
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
      // Firefox requires the link to be added to the DOM before it can be clicked.
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
    }
  
    downloadLink.click();
  }

  function cursorNearCaret(caretPosition, cursorPosition){
    let targetRect = caretPosition.getClientRect();

    // fix issue: cursor is at the end of the last line and caret at the head of current line
    // cursor and caret cannot be too far
      
    let distanceX = Math.abs(targetRect.x - cursorPosition.x);
    
    const MAX_DISTANCE = 20;
    if(distanceX > MAX_DISTANCE){
      return false;
    }

    return true;
  }

  export { saveTextAsFile, cursorNearCaret };