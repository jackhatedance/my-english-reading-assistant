import { removeParentheses } from '../text/textUtils.js'

const LINK_MATCHERS = [
    {   
        prefix: '=',
    },           
];

function findLink(text){
    for(let formMatcher of LINK_MATCHERS){
        let { form, prefix, suffix } = formMatcher;

        let pattern;
        if(prefix){
            pattern = `${prefix} ?(?<link>[a-zA-Z]+)`;
        }

        if(suffix){
            pattern = String.raw`(?<link>[a-zA-Z]+(\(.*\))?)( ?)的${suffix}`;
        }
        
        let matchResult = text.match(pattern);
        if(matchResult != null){
            let link = matchResult.groups.link;

            return link;
        }
    } 
}
export { findLink }