
import { getSystemDictionary } from './dictionary/systemDictionary.js'
import { getCustomDictionary, getEnabledDictionaryNamesFromCache } from './dictionary/customDictionary.js'
import { parseTextDefinition, parseWordClass, splitWordMeanings } from './dictionary/text/textDefinitionUtils.js'
import { removeParentheses } from './text/textUtils.js' 
import { DICTIONARY_DEFINITION_TYPE_LINK, DICTIONARY_DEFINITION_TYPE_FORM } from './dictionary/dictConstants.js'                                           

function lookup(word, dicts) {
    //console.log(word);
    if(!dicts){
        dicts = getEnabledDictionaryNamesFromCache();
    }

    //replace single quotation
    if(word){
        word = word.replaceAll(/[’]/g, "'");
    }    

    //try small dict first, hits 90%
    let lookupResult;

    for(let name of dicts){
        let dict = getDict(name);
        
        if(dict){
            lookupResult = dict.lookup(word, { outputFormats:['text', 'json']});
            
            if(lookupResult){
                lookupResult.dictionary = name;
                //console.log(`found ${word} in ${name}: ${JSON.stringify(lookupResult)}`);
                break;                
            }
        }        
    }    

    return lookupResult;
}

function getDict(name){
    let dict = getSystemDictionary(name);
    if(!dict){
        dict = getCustomDictionary(name);
    } 

    return dict;
    
}
/**
 * TODO remove this function
 * @param {*} definition 
 * @param {*} options 
 * @returns 
 */
function simplifyDefinition(definition, options){
    let { maxMeaningNumber, hideWordClass } = options;
    //hardcode temporarily
    const hidePhoneticSymbol = true;
    const hideParentheses = true;
    //console.log('simplify definition:'+ JSON.stringify(definition));

    if(!definition){
        return definition;
    }

    const { phoneticSymbols, classes } = parseTextDefinition(definition);


    let totalMeaningNumber = 0;
    let definitions = [];
    for(let cls of classes){
        
        let wordClassResult = parseWordClass(cls);
        
        //console.log('parse word class:'+ JSON.stringify(wordClassResult));
        let wordClass = wordClassResult.wordClass;

        let meanings = splitWordMeanings(wordClassResult.meanings);

        let definition = {
            wordClass: wordClass,
            meanings: meanings,
            size: meanings.length,
            currentIndex: 0,//for later use
        }

        totalMeaningNumber += meanings.length;

        definitions.push(definition);        
    }

    //visit meanings one by one
    let definitionSize = definitions.length;
    let i =0;
    let definitionIndex;
    let meaningCounter=0;
    while(meaningCounter < maxMeaningNumber && meaningCounter < totalMeaningNumber && i < 100){
        definitionIndex = i % definitionSize; 
        let definition = definitions[definitionIndex];

        let available = nextMeaning(definition);
        if(available){
            meaningCounter++;
        }

        i++;
    }

    //concat definition
    let definitionStrList = [];
    for(let def of definitions){
        if(def.currentIndex == 0){
            continue;
        }

        let definitionStr = '';

        if(!hideWordClass){
            definitionStr = def.wordClass;
        }

        let visiteMeanings = getVisitedMeanings(def);
        
        if(hideParentheses){
            visiteMeanings = removeParentheses(visiteMeanings);
        }

        definitionStr = definitionStr + visiteMeanings;

        definitionStrList.push(definitionStr);
    }

    if(meaningCounter < totalMeaningNumber){
        definitionStrList.push('...');
    }

    return definitionStrList.join('; ');    
}

function simplifyDefinitionV2(originalLookupResult, deepLookupResult, options){
    let { maxMeaningNumber, hideWordClass } = options;
    //hardcode temporarily
    const hidePhoneticSymbol = true;
    const hideParentheses = true;
    //console.log('simplify definition:'+ JSON.stringify(definition));

    if(!originalLookupResult){
        return '';
    }

    let lookupResult = originalLookupResult;
    let prefix = '';
    if(deepLookupResult){
        lookupResult = deepLookupResult.lookupResult;
        //prefix = `${deepLookupResult.lookupResult.query}:`;
    }

    let entries = lookupResult.json;
    if(entries.length == 0){
        return '';
    }

    let entry = entries[0];
    const { pronunciation, definitionGroups } = entry;

    let totalMeaningNumber = 0;
    let definitions = [];
    for(let definitionGroup of definitionGroups){
        //console.log('parse word class:'+ JSON.stringify(wordClassResult));
        let wordClass = definitionGroup.name;

        let meanings = definitionGroup.definitions.map(item => item.text);

        let definition = {
            wordClass: wordClass,
            meanings: meanings,
            size: meanings.length,
            currentIndex: 0,//for later use
        }

        totalMeaningNumber += meanings.length;

        definitions.push(definition);        
    }

    //visit meanings one by one
    let definitionSize = definitions.length;
    let i =0;
    let definitionIndex;
    let meaningCounter=0;
    while(meaningCounter < maxMeaningNumber && meaningCounter < totalMeaningNumber && i < 100){
        definitionIndex = i % definitionSize; 
        let definition = definitions[definitionIndex];

        let available = nextMeaning(definition);
        if(available){
            meaningCounter++;
        }

        i++;
    }

    //concat definition
    let definitionStrList = [];
    for(let def of definitions){
        if(def.currentIndex == 0){
            continue;
        }

        let definitionStr = '';

        if(!hideWordClass){
            definitionStr = def.wordClass;
        }

        let visiteMeanings = getVisitedMeanings(def);
        
        if(hideParentheses){
            visiteMeanings = removeParentheses(visiteMeanings);
        }

        definitionStr = definitionStr + visiteMeanings;

        definitionStrList.push(definitionStr);
    }

    if(meaningCounter < totalMeaningNumber){
        definitionStrList.push('...');
    }

    let definitionStr = definitionStrList.join('; ');   
    return prefix + definitionStr;
}

function nextMeaning(definition){
    if(definition.currentIndex < definition.size){
        definition.currentIndex = definition.currentIndex + 1;

        return true;
    }else {
        return false;
    }
}

function getVisitedMeanings(definition){
    let visitedMeanings = definition.meanings.slice(0, definition.currentIndex);
    return visitedMeanings.join(',');    
}

function isOnlyLink(lookupResult){
    let entries = lookupResult.json;
    try{
        let definitions = entries[0].definitionGroups[0].definitions;
        if(definitions.length ==1){
            let definition = definitions[0];
            if(definition.type == DICTIONARY_DEFINITION_TYPE_LINK){
                return true;                
            }
        }        
    }catch(error){
        //do nothing
    }

    return false;
}

function getTheOnlyLink(lookupResult){
    let entries = lookupResult.json;
    let definitions = entries[0].definitionGroups[0].definitions;
    if(definitions.length ==1){
        let definition = definitions[0];
        if(definition.type == DICTIONARY_DEFINITION_TYPE_LINK){
            return definition.link;                
        }
    }  
}

function isOnlyTransform(lookupResult, form){
    let entries = lookupResult.json;
    try{
        let definitions = entries[0].definitionGroups[0].definitions;
        if(definitions.length ==1){
            let definition = definitions[0];
            if(definition.type == DICTIONARY_DEFINITION_TYPE_FORM){
                if(!form){
                    return true;
                } else if(definition.form == form) {
                    return true;
                }
            }
        }        
    }catch(error){
        //do nothing
    }

    return false;
}

function getTheOnlyBaseForm(lookupResult){
    let entries = lookupResult.json;
    try{
        let definitions = entries[0].definitionGroups[0].definitions;
        if(definitions.length ==1){
            let definition = definitions[0];
            if(definition.type == DICTIONARY_DEFINITION_TYPE_FORM){
                return definition.base;
            }
        }        
    }catch(error){
        //do nothing
    }
}

export { lookup, simplifyDefinition, simplifyDefinitionV2, isOnlyLink, getTheOnlyLink, isOnlyTransform, getTheOnlyBaseForm };