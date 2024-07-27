import {dict as dictLarge} from './dicts/dict-large.js'
import {dict as dictSmall} from './dicts/dict-small.js'
import {dict as dictAffix} from './dicts/dict-affix.js'

function lookup(word, dicts) {
    //console.log(dict);
    if(!dicts){
        dicts = ['affix', 'small','large'];
    }

    //replace single quotation
    if(word){
        word = word.replaceAll(/[’]/g, "'");
    }    

    //try small dict first, hits 90%
    let def;

    for(let name of dicts){
        let dict = getDict(name);
        def = dict[word];
        if(def){
           break; 
        }
    }    

    return def;
}

function getDict(name){
    if(name==='small'){
        return dictSmall;
    }else if(name==='large'){
        return dictLarge;
    }else if(name==='affix'){
        return dictAffix;
    }else{
        return null;
    }
}

function parseWordClass(def){
    if(def){
        def = def.trim();
    }

    let result = {
        wordClass: '',
        meanings: def,
    };    

    if(def){

        var rx = /^((\w{1,6}\.)+ )?(.+)$/;
        var arr = rx.exec(def);
        //console.log(arr)

        result = {
            wordClass: arr[2] ? arr[2] : '',
            meanings: arr[3].trim(),
        };
    }
    

    return result;
}

function firstMeaning(meanings){
    if(meanings){
        let arr = meanings.split(',');
        return arr[0];
    }

    return meanings;
}

function simplifyDefinition(definition, options){
    let { maxMeaningNumber, hideWordClass } = options;

    //console.log('simplify definition:'+ JSON.stringify(definition));

    if(!definition){
        return definition;
    }

    let classes = definition.split(';');
    
    let totalMeaningNumber = 0;
    let definitions = [];
    for(let cls of classes){
        
        let wordClassResult = parseWordClass(cls);
        
        //console.log('parse word class:'+ JSON.stringify(wordClassResult));
        let wordClass = wordClassResult.wordClass;

        let meanings;
        if(wordClassResult.meanings === ''){
            meanings = [];
        }else {
            meanings = wordClassResult.meanings.split(',');
        }

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

export { lookup, parseWordClass, simplifyDefinition };