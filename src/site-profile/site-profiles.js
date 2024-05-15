
import { RedditSiteProfile } from './by-domain/RedditSiteProfile.js';
import { GroupdocsAppViewerEpub } from './by-url/GroupdocsAppViewerEpubProfile.js';
import { EpubjsSiteProfile } from './by-category/EpubjsSiteProfile.js';

import { Matcher } from './matcher/Matcher.js';
import { DefaultSiteProfile } from './DefaultSiteProfile.js';
import { DefaultDocumentConfig } from './config/DefaultDocumentProfile.js';

let name = 'default';
let matcher = new Matcher('default');
let config = new DefaultDocumentConfig();
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


export { findSiteProfile };