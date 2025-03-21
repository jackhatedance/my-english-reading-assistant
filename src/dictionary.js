
import { getSystemDictionary } from './dictionary/systemDictionary.js'
import { getCustomDictionary, getEnabledDictionaryNamesFromCache } from './dictionary/customDictionary.js'
import { parseTextDefinition, parseWordClass, splitWordMeanings } from './dictionary/text/textDefinitionUtils.js'
                                             
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
    let def;

    for(let name of dicts){
        let dict = getDict(name);
        
        if(dict){
            let lookupResult = dict.lookup(word, { outputFormats:['text']});
            
            if(lookupResult){
                if(typeof lookupResult == 'string'){
                    def = lookupResult;
                } else {
                    def = lookupResult.text;
                }
                console.log(`found ${word} in ${name}: ${def}`);
            }
        }
        if(def){
           break; 
        }
    }    

    return def;
}

function getDict(name){
    let dict = getSystemDictionary(name);
    if(!dict){
        dict = getCustomDictionary(name);
    } 

    return dict;
    
}

function simplifyDefinition(definition, options){
    let { maxMeaningNumber, hideWordClass } = options;
    //hardcode temporarily
    const hidePhoneticSymbol = true;

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
        
        

        definitionStr = definitionStr + visiteMeanings;

        definitionStrList.push(definitionStr);
    }

    if(meaningCounter < totalMeaningNumber){
        definitionStrList.push('...');
    }

    return definitionStrList.join('; ');    
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

export { lookup, simplifyDefinition };