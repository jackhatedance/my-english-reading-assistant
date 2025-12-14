import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { Matcher } from '../matcher/Matcher.js';
import { EpubjsSiteConfig } from '../config/EpubjsSiteConfig.js';
import { searchSubIframesRecursively } from '../utils.js';

class EpubjsMatcher extends Matcher {
    constructor() {
        let name = 'category:epubjs';
        super(name);

    } 
    
    match(document) {
        let found =false;
        
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

class EpubjsSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new EpubjsMatcher();
        let config = new EpubjsSiteConfig();
        super(matcher.name, matcher, config);
    }
};

export { EpubjsSiteProfile };