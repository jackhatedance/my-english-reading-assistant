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

function sendMessageDictionaryChangeToBackground(name, type) {
    //send to background
    //console.log(`send message to runtime(background), name: ${name}`);
    chrome.runtime.sendMessage(
        {
            type: 'DICTIONARY_CHANGE',
            payload: {
                dictionaryName: name,
                changeType: type,
            },
        },
        (response) => {
            //console.log('recieve message:'+ response);
        }
    );
}

async function sendMessageToBackground(siteProfile, type, pageInfo) {
    //console.log('send message to background, type:' + type);

    
    let site = document.location.hostname;
    if (!site) {
        site = 'NULL';
    }
    let url = siteProfile.getUrl(document);
    
    let title = document.title;

    let enabled = (pageInfo != null);
    let isbn, totalWordCount;
    if(pageInfo){
        //let pageInfo = await getPageInfo(siteProfile, documentArticleMap);
        isbn = pageInfo.isbn;

        if(isbn){
            let book = await getBook(isbn);
            if(book){
                title = book.title;
            }        
        }
        totalWordCount = pageInfo.totalWordCount;
    }

    chrome.runtime.sendMessage(
        {
            type: type,
            payload: {
                title: title,
                url: url,
                enabled: enabled,
                isbn: isbn,
                site: site,
                totalWordCount: totalWordCount,
            },
        },
        (response) => {
            //console.log(response.message);
        }
    );
}

export { sendMessageMarkWordToBackground, sendMessageDictionaryChangeToBackground, sendMessageToBackground };