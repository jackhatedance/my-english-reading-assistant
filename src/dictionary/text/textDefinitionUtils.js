import { trimByCharacters } from '../../utils/stringUtils.js'


function getDefinitionGroupSeparatorRegexp(formatVersion){
    if(formatVersion=='1'){
        return /((\w{1,6}\.((& ?)?\w{1,6}\.)*)|;)(?![^()]*\))/g;
    } else{
        return /((\w{1,6}\.((& ?)?\w{1,6}\.)*)|;;)(?![^()]*\))/g;
    }
}

function splitIntoDefinitionGroups(definition, formatVersion = '1'){
    let regexp = getDefinitionGroupSeparatorRegexp(formatVersion);
    
    let matches = definition.matchAll(regexp);
    let matchArray = [...matches];

    let groups = [];
    
    for (let i =0; i< matchArray.length; i++) {
        let match = matchArray[i];
        let start = match.index;
        let group;

        //text before first word class
        if(i==0 && start != 0){
            group = definition.slice(0, start);
            group = trimByCharacters(group, ';');
            groups.push(group);
        }

        if(i == matchArray.length-1){
            group = definition.slice(start);
        } else{
            let end = matchArray[i+1].index;
            group = definition.slice(start, end);
        }

        group = trimByCharacters(group, ';');
        groups.push(group);

    }

    if(groups.length==0){
        groups.push(definition);
    }

    groups = groups.map(item => item.trim());
    groups = groups.filter(item => item.length > 0);
    
    return groups;
}

function getDefintionSeparatorRegexp(formatVersion){
    let regexp;
    if(formatVersion=='1'){
        regexp = /[,;](?![^()]*\))/;
    }else{
        regexp = /[;](?![^()]*\))/;
    }
    return regexp;
}

function splitWordMeanings(meaningsStr, formatVersion=1){
    let meanings;
    if(meaningsStr === ''){
        meanings = [];
    }else {
        let regexp = getDefintionSeparatorRegexp(formatVersion);
        meanings = meaningsStr.split(regexp);
    }

    meanings = meanings.map(item => item.trim());
    meanings = meanings.filter(item => item.length>0);

    return meanings;
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

        var rx = /^(\w{1,6}\.((& ?)?\w{1,6}\.)*)?(.+)$/;
        var arr = rx.exec(def);
        //console.log(arr);

        if(arr && arr.length >=4 ){
            result = {
                wordClass: arr[1] ? arr[1] : '',
                meanings: arr[4].trim(),
            };
        }
    }
    

    return result;
}

function parseLine(line){
    let word, definition;

    line = line.trim();
    if(line.length>2 && line[0]=='"'){
        //quoted
        const endQuotationIndex = line.indexOf('"',1);
        word = line.substring(1, endQuotationIndex);
        definition = line.substring(endQuotationIndex+1);
        
    } else {
        const firstSpaceIndex = line.indexOf(" ");
        word = line.substring(0, firstSpaceIndex);
        definition = line.substring(firstSpaceIndex+1);
    }

    return { word, definition };
}

export { splitIntoDefinitionGroups, splitWordMeanings, parseWordClass, parseLine }