'use strict';


function sendMessageMarkWord(wordChanges) {
    //send to background
    chrome.runtime.sendMessage(
        {
            type: 'MARK_WORD',
            payload: {
                wordChanges: wordChanges,
            },
        },
        (response) => {
            //console.log(response.message);
        }
    );
}


export { sendMessageMarkWord };