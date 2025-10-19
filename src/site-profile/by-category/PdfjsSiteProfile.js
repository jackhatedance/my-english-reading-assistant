import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { Matcher } from '../matcher/Matcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';

class PdfjsMatcher extends Matcher {
    constructor() {
        let name = 'category:pdfjs';
        super(name);

    } 
    
    match(document) {
        let found =false;

        const sites = ['mozilla.github.io'];
        for(let site of sites){
            let hostname = document.location.hostname;
            if(site===hostname){
                return true;
            }
        }

        return found;
    }  
}

class PdfjsDocumentConfig extends DefaultSiteConfig {
    
    getUrl(topDocument){
        let url = topDocument.location.href;
        let title = topDocument.title;
        

        const urlObj1 = new URL(url);
        let urlObj2 = new URL(`#${title}`, url);


        return urlObj2.toString();
    }
}

class PdfjsSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new PdfjsMatcher();
        let config = new PdfjsDocumentConfig();
        super(matcher.name, matcher, config);
    }
};

export { PdfjsSiteProfile };