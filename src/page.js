'use strict';

import { getSiteOptions,  } from './optionService.js';
import { getAllDocuments } from './document.js';

/**
 * 
 * @returns unknownWords, unknownWordsRatio, annotationOptions
 */
async function getPageInfo() {


    let documents = getAllDocuments();
    let unknownWordMap = new Map();
  
    let unknownWordsCount = 0;
    let knownWordsCount = 0;
    for (let document of documents) {
      let elements = document.querySelectorAll('.mea-word:not(.mea-hide)');
  
      for (var e of elements) {
        //let targetWord = getTargetWordFromElement(e);
        let base = e.getAttribute('data-base-word');
  
        unknownWordMap.set(base, { base, });
        unknownWordsCount++;
      }
  
      elements = document.querySelectorAll('.mea-word.mea-hide');
      for (var e of elements) {
        knownWordsCount++;
      }
    }
  
    let unknownWords = Array.from(unknownWordMap, ([name, value]) => ({ base: name, root: value.root }));
  
    let totalWordCount = unknownWordsCount + knownWordsCount;
    let unknownWordsRatio = unknownWordsCount / totalWordCount;
    let visible = isPageAnnotationVisible();
    let siteOptions = await getCurrentSiteOptions();
    let domain = document.location.hostname;
    if (!domain) {
      domain = 'NULL';
    }
    let pageInfo = {
      domain: domain,
      visible: visible,
      totalWordCount: totalWordCount,
      unknownWordsCount: unknownWordsCount,
      unknownWords: unknownWords,
      unknownWordsRatio: unknownWordsRatio,
      siteOptions: siteOptions,
    };
    //console.log('page info:'+JSON.stringify(pageInfo));
    return pageInfo;
  }

  function isPageAnnotationVisible() {
    let result = document.body.getAttribute('mea-visible');
    if (result === 'true') {
      return true;
    } else {
      return false;
    }
  }


async function getCurrentSiteOptions() {
    let siteDomain = document.location.hostname;
    let options = await getSiteOptions(siteDomain);
  
    return options;
  }

  export { getPageInfo, isPageAnnotationVisible, getCurrentSiteOptions };