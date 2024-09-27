import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { Matcher } from '../matcher/Matcher.js';
import { IframeSiteConfig } from '../config/IframeSiteConfig.js';
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

class EpubjsDocumentConfig extends IframeSiteConfig {
    matchIframe(iframe){
        let id = iframe.id;
        return id && id.startsWith('epubjs');
    }

    getUrl(topDocument){
        let url = topDocument.location.href;
        let title = topDocument.title;
        let iframeDocuments = this.getIframeDocumentConfigs(topDocument);
        if(iframeDocuments.length > 0){
            url = iframeDocuments[0].document.baseURI;
        }

        const urlObj1 = new URL(url);
        let urlObj2 = new URL(`/#${title}${urlObj1.pathname}${urlObj1.search}`, url);


        return urlObj2.toString();
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