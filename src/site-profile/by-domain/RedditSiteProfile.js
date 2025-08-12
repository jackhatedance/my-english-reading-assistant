import { DefaultSiteProfile } from '../DefaultSiteProfile.js';
import { DomainMatcher } from '../matcher/DomainMatcher.js';
import { DefaultSiteConfig } from '../config/DefaultSiteConfig.js';
import { generateCssRuleOfHighlight as commonGenerateCssRuleOfHighlight } from '../../style.js';
import { isTextTag } from '../../html.js';

class RedditSiteProfile extends DefaultSiteProfile {
    constructor() {
        let matcher = new DomainMatcher('reddit.com');
        let config = new DefaultSiteConfig();
        super(matcher.name, matcher, config);
    } 
    
    generateCssRuleOfHighlight(options) {


        let extraStyle = 'visibility: visible !important;';
        let rule = commonGenerateCssRuleOfHighlight(options, extraStyle);
        return rule;
    }

    isTextElement(element){
        return isTextTag(element.nodeName, ['FACEPLATE-SCREEN-READER-CONTENT', 'FACEPLATE-NUMBER', 'GAMES-SECTION-BADGE-WRAPPER', 'SHREDDIT-DYNAMIC-AD-LINK']);
    }
};

export { RedditSiteProfile };