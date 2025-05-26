
import { mergeEntries } from './entry-utils.js'

const REGION_EMPTY = 'empty';

export const REGION_NONE = 'none';
export const REGION_UK = 'uk';
export const REGION_US = 'us';
export const REGION_ALL = 'all';

function getPronunciationMapByRegion(pronunciations){

    let regionMap = {};
    for(let pronunciation of pronunciations){
        let region = pronunciation.region;
        if(region == ''){
            region = REGION_EMPTY;
        }
        
        let regionPronunciations;
        if(regionMap.hasOwnProperty(region)){
            regionPronunciations = regionMap[region];
        }else{
            regionPronunciations = [];
            regionMap[region] = regionPronunciations;
        }

        regionPronunciations.push(pronunciation);
    }

    return regionMap;
}

function getRegionPronunciations(regionMap, preferRegion){
    let key;
    if(regionMap.hasOwnProperty(preferRegion)){
        key = preferRegion;
    }else if(regionMap.hasOwnProperty(REGION_EMPTY)){
        key = REGION_EMPTY;
    }

    let result;
    if(key){
        result = regionMap[key];
    }

    if(!result){
        let values = Object.values(regionMap);
        if(values.length>0){
            result = values[0];
        }
    }

    if(!result){
        result = [];
    }

    return result;
}

function pronunciationToText(pronunciation){
    let form = pronunciation.form;
    if(!form | form == ''){
        return pronunciation.phonetics;
    } else {
        return `${form} ${pronunciation.phonetics}`;
    }
}

function regionPronunciationsToText(region, pronunciations){
    let texts = pronunciations.map(item => pronunciationToText(item));
    if(region && region.length > 0){
        return `${region} /${texts.join(',')}/`;
    } else{
        return `/${texts.join(',')}/`;
    }
    
}

/**
 * 
 * @param {*} pronunciations 
 * @param {*} preferRegion none, us, uk, all
 */
function pronunciationsToText(pronunciations, region = 'all'){
    if(pronunciations == null || pronunciations.length==0 || region == 'none'){
        return '';
    }

    let regionMap = getPronunciationMapByRegion(pronunciations);

    if(region != 'all'){
        //single region
        let regionPronunciations = getRegionPronunciations(regionMap, region);
        return regionPronunciationsToText('', regionPronunciations);        
    }else{
        let regionTexts = [];
        for(let key of Object.keys(regionMap)){
            let regionPronunciations = regionMap[key];

            let displayRegion = key;
            if(key == REGION_EMPTY){
                displayRegion = '';
            }
            let regionText =regionPronunciationsToText(displayRegion, regionPronunciations);        
            regionTexts.push(regionText);
        }
        return regionTexts.join(' ');
    }
}


function entriesToHtml(word, entries, pronunciationRegion){
    if(!entries || entries.length == 0){
        return '';
    }

    let entry = mergeEntries(entries);

    let definitionObj = entry;

    let groupTexts = [];
    for(let definitionGroup of definitionObj.definitionGroups){
        let wordClass = definitionGroup.name;

        let definitions = definitionGroup.definitions.filter(item => item.text && item.text.length > 0);

        /*
        let shortDefinitions = definitions.filter(item => item.text && item.text.length < 10);
        if(shortDefinitions.length >= 3){
            definitions = shortDefinitions;
        }*/
        let definitionTexts = definitions.map(item => definitionToHtml(item));
        
        let definitionsText = definitionTexts.join(',');
        let groupText = `${wordClass} ${definitionsText}`;
        groupTexts.push(groupText);
    }
    let groupsText = groupTexts.join('<br> ');

    let pronunciation = pronunciationsToText(definitionObj.headword.pronunciations, pronunciationRegion);    

    let text = groupsText;
    if(pronunciation){
        text = `${word} ${pronunciation}<br>${groupsText}`;
    } else {
        text = `${word}<br>${groupsText}`;
    }       
    
    //console.log(text);
    return text;
}

function definitionToHtml(definition){
    
    if(definition.type == 'form'){
        return makeWordLink(definition.text, definition.base);
    } else if(definition.type == 'link'){
        return makeWordLink(definition.text, definition.link);
    } else {
        return definition.text;
    }
}

function makeWordLink(text, word){
    if(text.includes(word)){
        let aTag = `<a href="entry://${word}">${word}</a>`;
        return text.replace(word, aTag)
    } else {
        return `${text}(<a href="entry://${word}">${word}</a>)`;
    }
}


export { pronunciationsToText, entriesToHtml }