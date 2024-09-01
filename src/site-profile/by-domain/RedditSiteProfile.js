import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultDocumentConfig } from '../config/DefaultDocumentProfile.js';
import { generateCssRuleOfHighlight as commonGenerateCssRuleOfHighlight } from '../../style.js';

class RedditSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('reddit.com');
        let config = new DefaultDocumentConfig();
        super(matcher.name, matcher, config);
    } 
    
    generateCssRuleOfHighlight(options) {


        let extraStyle = 'visibility: visible !important;';
        let rule = commonGenerateCssRuleOfHighlight(options, extraStyle);
        return rule;
    }
};

export { RedditSiteProfile };