import { refreshOptionsCache, } from '../service/optionService.js';
import { sendMessageToEmbeddedApp, resizeEmbeddedApp } from '../embed/iframe-embed.js';
import { isAllDocumentsAnnotationInitialized, isAnyDocumentsAnnotationInitialized, changeStyleForAllDocuments } from '../document.js';
import { getPageInfo, isPageAnnotationVisible, initPageAnnotations, cleanPageAnnotations, isPageAnnotationInitialized, clearPagePreprocessMark } from '../page.js'
import { getCurrentSiteOptions, refreshCurrentSiteOptionsCache } from '../current-site-options.js'
import { updateAdditionalDictionariesInCache } from '../dictionary/customDictionary.js'
import { closeDialog } from '../dialog.js' 
import { resetPageAnnotationVisibilityAndNotify, refreshPageAnnotation } from './page-utils.js'

function pageMessageListenerWithParams(page, request, sender, sendResponse) {
  //console.log(`receive request type: ${request.type}`);
  let response = {};
  if (request.type === 'IS_PAGE_ANNOTATION_INITIALIZED') {
    let initialized = isPageAnnotationInitialized()
    //console.log(`Current page annotation is initialized: ${initialized}`);
    response = { initialized: initialized };
  } else if (request.type === 'IS_PAGE_ANNOTATION_VISIBLE') {
    let visible = isPageAnnotationVisible();
    //console.log(`Current page annotation is visible: ${visible}`);
    response = { visible: visible };
  } else if (request.type === 'ENABLED') {
    //console.log(`Current enabled is ${request.payload.enabled}`);
    if (request.payload.enabled) {
      if (!isAllDocumentsAnnotationInitialized(page.siteProfile)) {
        initPageAnnotations(page).then((documentArticleMap) => {
          page.initDocumentMap(documentArticleMap, 2);
          resetPageAnnotationVisibilityAndNotify(page, request.payload.enabled);
        });
      } else {
        resetPageAnnotationVisibilityAndNotify(page, request.payload.enabled);
      }

    } else {
      //hide annotation
      //resetPageAnnotationVisibilityAndNotify(page, false);

      //remove annotation
      if (isAnyDocumentsAnnotationInitialized(page.siteProfile)) {
        cleanPageAnnotations(page).then((documentArticleMap) => {
          //page.initDocumentMap(documentArticleMap, 2);
          //resetPageAnnotationVisibilityAndNotify(page, false);
        });
      } else {
        //resetPageAnnotationVisibilityAndNotify(page, false);
      }
    }

  } else if (request.type === 'REFRESH_PAGE') {
    //console.log(`refresh page`);
    let visible = isPageAnnotationVisible();

    if (visible) {//master document
      if (request.payload.force) {
        clearPagePreprocessMark(page.siteProfile);
      }

      //init all documents
      initPageAnnotations(page).then((documentArticleMap) => {
        page.initDocumentMap(documentArticleMap, 3);
        resetPageAnnotationVisibilityAndNotify(page, visible);
      });
    }

  } else if (request.type === 'ADD_KNOWN_WORD' || request.type === 'REMOVE_KNOWN_WORD') {
    //console.log(`${request.type} known word: ${request.payload.word}`);
    if (request.payload.word) {
      //hideAnnotation(request.payload.word);
      let visible = isPageAnnotationVisible();
      resetPageAnnotationVisibilityAndNotify(page, visible);
    }

  } else if (request.type === 'KNOWN_WORDS_UPDATED') {
    //console.log(`${request.type}`);
    
    //hideAnnotation(request.payload.word);
    let source = request.payload.source;
    
    //won't refresh UI until dialog closed
    //let visible = isPageAnnotationVisible();
    //resetPageAnnotationVisibilityAndNotify(page, visible, source);
    
    //resetPageAnnotationVisibility(page.documentArticleMap, visible, null);

  } else if (request.type === 'NOTES_UPDATED') {
    //console.log(`${request.type}`);
    let source = request.payload.source;
    //hideAnnotation(request.payload.word);
    let visible = isPageAnnotationVisible();
    resetPageAnnotationVisibilityAndNotify(page, visible, source, 'note');
  } else if (request.type === 'GET_PAGE_INFO') {
    //it is from popup page

    //console.log(`${request.type}`);
    let options;
    if(request.payload.sections){
      options = { sections: request.payload.sections };
    }
    
    
      getPageInfo(page.siteProfile, page.documentArticleMap, options).then((pageInfo) => {
        response.pageInfo = pageInfo;

        //console.log('pageInfo response:' + JSON.stringify(response));
        
        sendResponse(response);
         
      });
      return true;
    
  } else if (request.type === 'OPTIONS_CHANGED') {
    refreshOptionsCache();
  } else if (request.type === 'CLOSE_DIALOG') {
    closeDialog();

    let needRefreshPageAnnotation = false;
    let actions = request.payload.actions;
    if(actions.includes('markAsUnknown')){
      needRefreshPageAnnotation = true;
    }

    let visible = isPageAnnotationVisible();
      
    if(needRefreshPageAnnotation){
      refreshPageAnnotation(page, visible);
    } else{
      //in case some word marked, refresh UI anyway
      resetPageAnnotationVisibilityAndNotify(page, visible);
    }
    
  } else if (request.type === 'RESIZE_IFRAME') {
    let {width, height} = request.payload;
    resizeEmbeddedApp(width, height);
  } else if (request.type === 'CHANGE_SITE_OPTIONS') {
    //console.log(`change site options`);
    if (request.payload) {      
      //annotationOptions = request.payload;
      getCurrentSiteOptions(page.siteProfile).then(async (siteOptions) => {
        await refreshCurrentSiteOptionsCache(siteOptions);
        await updateAdditionalDictionariesInCache(siteOptions.other.additionalDictionaries, ['index']);
        changeStyleForAllDocuments(page.siteProfile, siteOptions);
      });
    }

  }

  //default sync return, for async result either return true or Promise
  sendResponse(response);
}

export { pageMessageListenerWithParams }