import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { EpubjsSiteConfig } from '../config/EpubjsSiteConfig.js';
import { isSelfOrDecendantOfClass } from '../../html.js';

class FlowossSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('app.flowoss.com');
        let config = new EpubjsSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    ignoreDomChange(mutation){
        const ignoredClassesOfItselfOrDescendant = [ 'SideBar'];
        let ignored = isSelfOrDecendantOfClass(mutation.target, ignoredClassesOfItselfOrDescendant, 6);
        if(ignored){
            return true;
        }

        return super.ignoreDomChange(mutation);
    }

    /**
     * e.g. https://app.flowoss.com/#A%20Clash%20of%20Kings%20(George%20R.%20R.%20Martin)%20(Z-Library).epub/OEBPS/Text/C63.xhtml
     * @param {*} pageUrl 
     * @returns 
     */
    autofillUrlPattern(pageUrl){
        let index = pageUrl.lastIndexOf("\.epub/");
        let urlPattern = pageUrl.substring(0, index+"\.epub/".length) + "**";

        return urlPattern;
    }
};

export { FlowossSiteProfile };