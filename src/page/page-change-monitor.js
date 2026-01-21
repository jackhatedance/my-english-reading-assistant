import { findSiteProfile, getSiteInfo, compareSiteInfo } from '../site-profile/site-profiles.js';
import { sendMessageToBackground } from '../message.js';
import { getPageInfo, initPageAnnotations, clearPagePreprocessMark } from '../page.js'
import { resetPageAnnotationVisibilityAndNotify } from './page-utils.js'
import log from 'loglevel'

const DOM_MONITOR_INTERVAL_MIN = 2000;
const DOM_MONITOR_INTERVAL_MAX = 5000;

const gLogger = log.getLogger("page-change-monitor");

function checkSiteInfoChanges(page){
  let siteInfo = getSiteInfo();
  let same = compareSiteInfo(page.siteInfo, siteInfo);
  if(!same){
    page.siteInfo = siteInfo;
  }
    
  return same;
}

function adjustDomMonitorInterval(page, workTime){
  let interval = workTime * 0.5

  if(interval < DOM_MONITOR_INTERVAL_MIN){
    interval = DOM_MONITOR_INTERVAL_MIN;
  } else if(interval > DOM_MONITOR_INTERVAL_MAX){
    interval = DOM_MONITOR_INTERVAL_MAX;
  }
  
  page.domMonitorInterval = interval;
}


async function domMonitor(page) {
  //console.log('domMonitor begin');
  let siteInfoSame = checkSiteInfoChanges(page);
  if(!page.siteProfile || !siteInfoSame){
    page.siteProfile = findSiteProfile(document);
  }
 
  //check body attribute flag.  
  let needRefresh = page.siteProfile.needRefreshPageAnnotation(document);
  gLogger.debug(`needRefresh:${needRefresh}`);
  
  if(page.domChanges > 0){
    gLogger.debug(`domMonitor DOM changes:${page.domChanges}`);
  }
  
  if (page.domChanges > 0) {
    if(page.domChanges === page.domChangesMonitored){
      //no more changes in this interval. now we can reset annotations
      
      gLogger.debug(`DOM stop changing, ${page.domChanges} changes accumulated`);
      
      //reset
      page.domChanges =0;
      
      clearPagePreprocessMark(page.siteProfile);

      needRefresh = true;
    } else {
      page.domChangesMonitored = page.domChanges;
      needRefresh = false;
    } 
  }
  
  if(needRefresh) {
    gLogger.debug('start refresh page annotation');
    
    let startTime = new Date().getTime();

    let documentArticleMap = await initPageAnnotations(page, false, null);
    page.initDocumentMap(documentArticleMap, 4);
    let endTime1 = new Date().getTime();
    let elapseTime1 = endTime1 - startTime;
    let elapseTime1Str = (elapseTime1/1000).toFixed(1);
    //gLogger.info(`initPageAnnotations ${elapseTime1} ms`);

    await resetPageAnnotationVisibilityAndNotify(page, true);
    let endTime2 = new Date().getTime();
    let elapseTime2 = endTime2 - endTime1;
    let elapseTime2Str = (elapseTime2/1000).toFixed(1);

    let elapseTimeTotal = endTime2 - startTime;
    adjustDomMonitorInterval(page, elapseTimeTotal);
    gLogger.info(`page annotation ${elapseTime1Str}+${elapseTime2Str} s`);

  }

  let url = page.siteProfile.getUrl(document);

  //update gloabl variable
  page.url = url;

  //console.log('domMonitor end');
}

export { domMonitor }