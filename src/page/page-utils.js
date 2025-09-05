import { sendMessageToEmbeddedApp } from '../embed/iframe-embed.js';
import { getPageInfo, resetPageAnnotationVisibility } from '../page.js'

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

export { resetPageAnnotationVisibilityAndNotify }