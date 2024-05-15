import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultDocumentConfig } from '../config/DefaultDocumentProfile.js';

class RedditSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('reddit.com');
        let config = new DefaultDocumentConfig();
        super(matcher.name, matcher, config);
    } 
    
    generateCssRuleOfHighlight(options) {

        let lineHeight = `${options.lineHeight}em`;
    
        let rule = `.mea-highlight {  
          position: relative;
          margin-top: 0px;
          text-indent1: 0px;
          display1: inline-block;
          line-height: ${lineHeight} !important;
          visibility: visible !important;
        }`;
        return rule;
    }
};

export { RedditSiteProfile };