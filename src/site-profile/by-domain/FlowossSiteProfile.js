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

};

export { FlowossSiteProfile };