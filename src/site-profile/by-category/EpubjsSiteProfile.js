import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { Matcher } from '../matcher/Matcher.js';
import { IframeDocumentConfig } from '../config/IframeDocumentProfile.js';
import { searchSubIframesRecursively } from '../utils.js';

class EpubjsMatcher extends Matcher {
    constructor() {
        let name = 'category:epubjs';
        super(name);

    } 
    
    match(document) {
        let found =false;

        const sites = ['app.flowoss.com'];
        for(let site of sites){
            let hostname = document.location.hostname;
            if(site===hostname){
                return true;
            }
        }

        searchSubIframesRecursively(document, (iframe)=>{
            let id = iframe.id;
            if(id){
                if(id.startsWith('epubjs')){
                    found = true;
                }
            }
        });
        return found;
    }  
}

class EpubjsDocumentConfig extends IframeDocumentConfig {
    matchIframe(iframe){
        let id = iframe.id;
        return id && id.startsWith('epubjs');
    }
}

class EpubjsSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new EpubjsMatcher();
        let config = new EpubjsDocumentConfig();
        super(matcher.name, matcher, config);
    }
};

export { EpubjsSiteProfile };