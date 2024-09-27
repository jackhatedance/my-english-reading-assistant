
import { RedditSiteProfile } from './by-domain/RedditSiteProfile.js';
import { GroupdocsAppViewerEpub } from './by-url/GroupdocsAppViewerEpubProfile.js';
import { EpubjsSiteProfile } from './by-category/EpubjsSiteProfile.js';

import { Matcher } from './matcher/Matcher.js';
import { DefaultSiteProfile } from './DefaultSiteProfile.js';
import { DefaultSiteConfig } from './config/DefaultSiteConfig.js';
import { searchSubIframesRecursively } from './utils.js';

let name = 'default';
let matcher = new Matcher('default');
let config = new DefaultSiteConfig();
const defaultSiteProfile = new DefaultSiteProfile(name, matcher, config); 

const siteProfiles = [
    new RedditSiteProfile(),

    new GroupdocsAppViewerEpub(),
    
    new EpubjsSiteProfile(),
];

function findSiteProfile(document) {
    let searchResult = null;
    
    for (let i = 0; i < siteProfiles.length; i++) {
        let siteProfile = siteProfiles[i];
        if (siteProfile.match(document)) {
            searchResult = siteProfile;
            break;
        }
    }
    
    if(!searchResult){
        searchResult = defaultSiteProfile;
    }
    console.log('find site profile:'+searchResult.name);
    return searchResult;
}

function getSiteInfo(){
    let url = document.location.href;
    let iframes = getIframes();
    return {
        url,
        iframes,
    };
}

function compareSiteInfo(info1, info2){
    
    if((!info1 && info2) || (info1 && !info2)){
        return false;
    }

    if(info1.url !== info2.url){
        return false;
    }
    let sameIframes = compareIframes(info1.iframes, info2.iframes);
    return sameIframes;
}

function getIframes() {
    let iframes = [];
    searchSubIframesRecursively(document, (iframe)=>{
        iframes.push(iframe);
    });
    return iframes;
}
  
function compareIframes(oldIframes, newIframes){
    
    let changed = false;
    
    if(oldIframes.length !== newIframes.length){
        changed = true;
    } else {
        for(let i= 0; i< newIframes.length;i++){
            let oldIframe = oldIframes[i];
            let newIframe = newIframes[i];
            if(oldIframe !== newIframe){
                changed = true;
                break;
            }
        }
    }

    return !changed;
}

export { findSiteProfile, getSiteInfo, compareSiteInfo };