import { sendMessageToEmbeddedApp } from '../embed/iframe-embed.js';
import { getPageInfo, resetPageAnnotationVisibility, initPageAnnotations, clearPagePreprocessMark } from '../page.js'
import log from 'loglevel'

const gLogger = log.getLogger('page');

async function resetPageAnnotationVisibilityAndNotify(page, enabled, source, types){
  await resetPageAnnotationVisibility(page.siteProfile, page.documentArticleMap, enabled, types);

  let pageInfo = await getPageInfo(page.siteProfile, page.documentArticleMap);
    //send message to side panel
    let request = {
        type: 'RESET_PAGE_ANNOTATION_VISIBILITY_FINISHED',
        payload: {
          pageInfo: pageInfo,
          source: source,
        },
      };
    let sender = null;
    let sendResponse = (response) => {
      //console.log(response.message);
    };
    sendMessageToEmbeddedApp(request, sender, sendResponse);
}

async function refreshPageAnnotation(page, visible){

  gLogger.debug('start refresh page annotation');

  clearPagePreprocessMark(page.siteProfile);  

  let startTime = new Date().getTime();

  let documentArticleMap = await initPageAnnotations(page);
  page.initDocumentMap(documentArticleMap, 4);
  let endTime1 = new Date().getTime();
  let elapseTime1 = endTime1 - startTime;
  let elapseTime1Str = (elapseTime1/1000).toFixed(1);
  //gLogger.info(`initPageAnnotations ${elapseTime1} ms`);

  await resetPageAnnotationVisibilityAndNotify(page, visible);
  let endTime2 = new Date().getTime();
  let elapseTime2 = endTime2 - endTime1;
  let elapseTime2Str = (elapseTime2/1000).toFixed(1);
  
  gLogger.info(`page annotation ${elapseTime1Str}+${elapseTime2Str} s`);
}

export { resetPageAnnotationVisibilityAndNotify, refreshPageAnnotation }