'use strict';


function sendMessageMarkWordToBackground(wordChanges) {
    //send to background
    //console.log('send mark word message to runtime(background)');
    chrome.runtime.sendMessage(
        {
            type: 'MARK_WORD',
            payload: {
                wordChanges: wordChanges,
            },
        },
        (response) => {
            //console.log('recieve message:'+ response);
        }
    );
}

async function sendMessageToBackground(siteConfig, type, getPageInfo) {
    //console.log('send message to background, type:' + type);

    let pageInfo = await getPageInfo();
    let site = document.location.hostname;
    if (!site) {
        site = 'NULL';
    }
    let url = siteConfig.getUrl(document);
    chrome.runtime.sendMessage(
        {
            type: type,
            payload: {
                title: document.title,
                url: url,
                site: site,
                totalWordCount: pageInfo.totalWordCount,
            },
        },
        (response) => {
            //console.log(response.message);
        }
    );
}

export { sendMessageMarkWordToBackground, sendMessageToBackground };