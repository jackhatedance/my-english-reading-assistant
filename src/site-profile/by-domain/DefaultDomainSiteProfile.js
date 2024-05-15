import { DefaultSiteProfile } from '../DefaultSiteProfile.js';

class DefaultDomainSiteProfile extends DefaultSiteProfile {
    
    constructor(domain) {
        let name = 'domain:'+ domain;
        super(name);

        this.domain = domain;
    } 
    
    match(document) {
        let domain = document?.location?.host;
        return domain && domain.endsWith(this.domain);
    }
    
};

export { DefaultDomainSiteProfile };