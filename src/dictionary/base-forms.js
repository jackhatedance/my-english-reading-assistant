import { DICTIONARY_DEFINITION_TYPE_FORM_SINGULAR, DICTIONARY_DEFINITION_TYPE_FORM_PLURAL, DICTIONARY_DEFINITION_TYPE_FORM_THIRD_PERSON_SINGULAR_PRESENT, DICTIONARY_DEFINITION_TYPE_FORM_PAST_OR_PAST_PARTICIPLE, DICTIONARY_DEFINITION_TYPE_FORM_PRESENT_PARTICIPLE } from './dictConstants.js'
import { removeParentheses } from '../text/textUtils.js'

const FORM_MATCHERS = [
    {
        form: DICTIONARY_DEFINITION_TYPE_FORM_SINGULAR,
        suffix: '单数第一人称'
    },
    {
        form: DICTIONARY_DEFINITION_TYPE_FORM_PLURAL,
        suffix: '((复数)|(名词复数))'
    },
    {
        form: DICTIONARY_DEFINITION_TYPE_FORM_THIRD_PERSON_SINGULAR_PRESENT,
        suffix: '第三人称单数(现在式|现在时|形式)',
    },
    {   
        form: DICTIONARY_DEFINITION_TYPE_FORM_PAST_OR_PAST_PARTICIPLE,
        suffix: '过去式和过去分词',
    },
    {   
        form: DICTIONARY_DEFINITION_TYPE_FORM_PAST_OR_PAST_PARTICIPLE,
        suffix: '((过去式)|(过去分词))',
    },
    {   
        form: DICTIONARY_DEFINITION_TYPE_FORM_PRESENT_PARTICIPLE,
        suffix: '((现在分词)|(ing形式))',
    },
    {   
        form: DICTIONARY_DEFINITION_TYPE_FORM_PAST_OR_PAST_PARTICIPLE,
        prefix: 'past tense of',
    },
    {   
        form: DICTIONARY_DEFINITION_TYPE_FORM_PAST_OR_PAST_PARTICIPLE,
        suffix: '变形',
    },             
];

function findBaseForm(text){
    for(let formMatcher of FORM_MATCHERS){
        let { form, prefix, suffix } = formMatcher;

        let pattern;
        if(prefix){
            pattern = `${prefix} ?(?<base>[a-zA-Z-]+)`;
        }

        if(suffix){
            pattern = String.raw`(?<base>[a-zA-Z-]+(\(.*\))?)( ?)的${suffix}`;
        }
        
        let matchResult = text.match(pattern);
        if(matchResult != null){
            let base = matchResult.groups.base;
            let matchedText = matchResult[0];
            base = removeParentheses(base);
            
            return { form, base, matchedText };            
        }
    } 
}
export { findBaseForm }