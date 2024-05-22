'use strict';
import { getBook } from './service/bookService.js';

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

async function sendMessageToBackground(siteProfile, type, getPageInfo) {
    //console.log('send message to background, type:' + type);

    let pageInfo = await getPageInfo();
    let site = document.location.hostname;
    if (!site) {
        site = 'NULL';
    }
    let url = siteProfile.getUrl(document);
    
    let title = document.title;
    let isbn = pageInfo.isbn;

    if(isbn){
        let book = await getBook(isbn);
        if(book){
            title = book.title;
        }        
    }

    chrome.runtime.sendMessage(
        {
            type: type,
            payload: {
                title: title,
                url: url,
                isbn: isbn,
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