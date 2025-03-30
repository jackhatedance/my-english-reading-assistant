import { DICTIONARY_DEFINITION_TYPE_FORM, DICTIONARY_DEFINITION_TYPE_FORM_PLURAL, DICTIONARY_DEFINITION_TYPE_FORM_THIRD_PERSON_SINGULAR_PRESENT, DICTIONARY_DEFINITION_TYPE_FORM_PAST_OR_PAST_PARTICIPLE } from './dictConstants.js'


const FORM_MATCHERS = [
    {
        form: DICTIONARY_DEFINITION_TYPE_FORM_PLURAL,
        suffix: '复数'
    },
    {   
        form: DICTIONARY_DEFINITION_TYPE_FORM_THIRD_PERSON_SINGULAR_PRESENT,
        suffix: '第三人称单数现在时',
    },
    {   
        form: DICTIONARY_DEFINITION_TYPE_FORM_PAST_OR_PAST_PARTICIPLE,
        suffix: '.*((过去式)|(过去分词))',
    },
    {   
        form: DICTIONARY_DEFINITION_TYPE_FORM_PAST_OR_PAST_PARTICIPLE,
        prefix: 'past tense of',
    }              
];

function findBaseForm(text){
    for(let formMatcher of FORM_MATCHERS){
        let { form, prefix, suffix } = formMatcher;

        let pattern;
        if(prefix){
            pattern = `${prefix} ?(?<base>[a-zA-Z]+)`;
        }

        if(suffix){
            pattern = `(?<base>[a-zA-Z]+) ?的${suffix}`;
        }
        
        let matchResult = text.match(pattern);
        if(matchResult != null){
            let base = matchResult.groups.base;
            return { form, base };            
        }
    } 
}
export { findBaseForm }