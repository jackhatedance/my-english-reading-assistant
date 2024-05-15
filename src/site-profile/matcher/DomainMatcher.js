import {Matcher} from './Matcher.js';

class DomainMatcher extends Matcher {
    constructor(domain) {
        let name = 'domain:'+ domain;
        super(name);

        this.domain = domain;
    } 
    
    match(document) {
        let domain = document?.location?.host;
        return domain && domain.endsWith(this.domain);
    }
  
}

export { DomainMatcher };