import { getWordClassAbbreviation } from './wordClass.js'
import { removeParentheses, standardizeParenthesesPunctuations } from '../text/textUtils.js' 
import { mergeEntries } from './entry-utils.js'
import { hasOnlyLinkOrFormDefinition } from './entry-utils.js'
import { isRegularTransform } from '../lemma.js'

function simplifyDefinition(word, searchType, originalLookupResult, baseWord, baseSearchType, deepLookupResult, options){
    let { maxMeaningNumber, hideWordClass } = options;
    //hardcode temporarily
    const hidePhoneticSymbol = true;
    const hideParentheses = true;
    //console.log('originalLookupResult:'+ JSON.stringify(originalLookupResult));

    if(!originalLookupResult){
        return '';
    }

    let lookupResult = originalLookupResult;
    let prefix = '';
    
    if(deepLookupResult && hasOnlyLinkOrFormDefinition(originalLookupResult.json)){
        lookupResult = deepLookupResult.lookupResult;

        if(!isRegularTransform(baseWord, word)){
            prefix = `${baseWord}:`;
        }
        
        //console.log('deepLookupResult:'+ JSON.stringify(deepLookupResult));
    }

    let entries = lookupResult.json;
    if(entries.length == 0){
        return '';
    }

    let entry = mergeEntries(entries);
        
    const { definitionGroups } = entry;
    //let pronunciation = pronunciationsToText(entry.headword.pronunciations, pronunciationRegion);    

    let totalMeaningNumber = 0;
    let definitions = [];
    for(let definitionGroup of definitionGroups){
        //console.log('parse word class:'+ JSON.stringify(wordClassResult));
        let wordClass = getWordClassAbbreviation(definitionGroup.name);

        let meaningsArray = definitionGroup.definitions.map(item => item.subdefinitions);
        
        let mergedMeanings = mergeMeanings(meaningsArray);
        if(hideParentheses){
            mergedMeanings = mergedMeanings.map(item => removeParentheses(item));            
        }
        mergedMeanings = mergedMeanings.filter(item => item.trim().length>0);

        let definition = {
            wordClass: wordClass,
            meanings: mergedMeanings,
            size: mergedMeanings.length,
            currentIndex: 0,//for later use
        }

        totalMeaningNumber += mergedMeanings.length;

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

        if(!hideWordClass && def.wordClass != ''){
            definitionStr = def.wordClass + ' ';
        }

        let visitedMeaningArray = getVisitedMeanings(def);
        
        visitedMeaningArray = visitedMeaningArray.map(item => item.split('/')[0].trim());
        let visitedMeanings = visitedMeaningArray.join('; ');                

        definitionStr = definitionStr + visitedMeanings;

        definitionStrList.push(definitionStr);
    }

    if(meaningCounter < totalMeaningNumber){
        definitionStrList.push('...');
    }

    let definitionStr = definitionStrList.join('; ');   
    return prefix + definitionStr;
}

function mergeMeanings(meaningsArray){

    let maxMeaningsLength = 0;
    for(let meanings of meaningsArray){
        if(meanings.length > maxMeaningsLength){
            maxMeaningsLength = meanings.length;
        }
    }

    let mergedMeanigns = [];
    for(let i =0;i<maxMeaningsLength;i++){
        for(let j =0; j< meaningsArray.length;j++){
            let meanings = meaningsArray[j];
            if(i<meanings.length){
                let meaning = meanings[i];
                mergedMeanigns.push(meaning);
            }
        }        
    }
    return mergedMeanigns;
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
    return visitedMeanings;    
}

export { simplifyDefinition }