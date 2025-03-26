import { trimByCharacters } from '../../utils/stringUtils.js'

function splitWordClasses(definition){
    return definition.split(';');
}

function splitWordMeanings(meaningsStr){
    let meanings;
    if(meaningsStr === ''){
        meanings = [];
    }else {
        meanings = meaningsStr.split(',');
    }
    return meanings;
}

function parseTextDefinition(definition) {
    const phoneticSymbolsArray = definition.match(/(\[.*\]|\/.*\/)\s/);
    let phoneticSymbols = '';
    if(phoneticSymbolsArray && phoneticSymbolsArray.length==2){
        phoneticSymbols = phoneticSymbolsArray[1];
    }
    if(phoneticSymbols){
        definition = definition.replace(/(\[.*\]|\/.*\/)\s/, '');
    }
    let classes = splitWordClasses(definition);
    
    let result = { phoneticSymbols, classes};    
    return result;
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
        //console.log(arr);

        if(arr && arr.length >=4 ){
            result = {
                wordClass: arr[2] ? arr[2] : '',
                meanings: arr[3].trim(),
            };
        }
    }
    

    return result;
}

function parseTextDefinitionV2(definition) {
    if(!definition){
        return [];
    }

    const phoneticSymbolsArray = definition.match(/(\[.*\]|\/.*\/)\s/);
    let pronunciation = '';
    if(phoneticSymbolsArray && phoneticSymbolsArray.length==2){
        pronunciation = phoneticSymbolsArray[1];
        pronunciation = trimByCharacters(pronunciation, '/');
    }
    if(pronunciation){
        definition = definition.replace(/(\[.*\]|\/.*\/)\s/, '');
    }
    let classes = splitWordClasses(definition);

    let definitionGroups = [];
    for(let cls of classes){
        let wordClassResult = parseWordClass(cls);
        let group = wordClassResult.wordClass;    
        let definitionTexts = splitWordMeanings(wordClassResult.meanings);    
        let definitions = definitionTexts.map(item => { return { text: item } });
        let definitionGroup = { "name":group, "definitions": definitions };
        definitionGroups.push(definitionGroup);
    }
    
    let entry = { pronunciation, definitionGroups};    
    let entries = [entry];
    return entries;
}


export { splitWordClasses, splitWordMeanings, parseWordClass, parseTextDefinition, parseTextDefinitionV2 }