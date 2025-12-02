
import { mergeEntries, generateDefinitionText } from './entry-utils.js'

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

    region = getLocalizedRegion(region);

    if(region && region.length > 0){
        return `${region} /${texts.join(',')}/`;
    } else{
        return `/${texts.join(',')}/`;
    }
    
}

function getLocalizedRegion(regionCode){
    let key = `annotation_pronunciation_region_${regionCode}`;
    let region = chrome.i18n.getMessage(key);
    return region;
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

function generatePartsHtml(wordPartObjs) {
  //let wordPartObjs = getWordPartObjects(word);
  let parts = '';
  if (wordPartObjs) {
      let partArray = [];
      for (let partObj of wordPartObjs) {
          partArray.push(partObj.word);
      }
      parts = partArray.join(' ');
  }
  let partsHtml = parts ? ` [${parts}]` : '';  
  return partsHtml;
}

function entriesToHtml(word, entries, pronunciationRegion=null, wordPartObjs=null, options={ supportLink: true}){
    let wordHtml = `<span style="font-size: x-large;">${word}</span> `;

    if(!entries || entries.length == 0){
        return '';
    }

    let entry = mergeEntries(entries);

    let definitionObj = entry;

    let partsHtml = generatePartsHtml(wordPartObjs);

    //compact, normal
    let mode = 'compact';
    
    const SHORT_DEFINITION_LENGTH_LIMIT = 20;
    for(const definitionGroup of definitionObj.definitionGroups){
        for(const definition of definitionGroup.definitions){
        const hasLongSubdefintion = definition.subdefinitions.some(item => item.length > SHORT_DEFINITION_LENGTH_LIMIT);
        if(hasLongSubdefintion){
            mode = 'normal';
            break;
        }
        }
    }
    const definitionTextSeparator = mode=='compact'? '; ' : '<br>';
    const wordClassTail = mode == 'compact' ? ' ' : '<br>';

    let groupTexts = [];
    for(let definitionGroup of definitionObj.definitionGroups){
        let wordClass = definitionGroup.name;

        let definitions = definitionGroup.definitions;

        /*
        let shortDefinitions = definitions.filter(item => item.text && item.text.length < 10);
        if(shortDefinitions.length >= 3){
            definitions = shortDefinitions;
        }*/
        let definitionTexts = definitions.map(item => definitionToHtml(item, options.supportLink));
        
        let definitionsText = definitionTexts.join(definitionTextSeparator);
        
        let wordClassHtml;
        if(wordClass) {
            wordClassHtml = `<b>${wordClass}</b>${wordClassTail}`;
        } else {
            wordClassHtml = '';
        }
        let groupText = `${wordClassHtml}${definitionsText}`;
        groupTexts.push(groupText);
    }
    let groupsText = groupTexts.join('<br> ');

    let pronunciation = pronunciationsToText(definitionObj.headword.pronunciations, pronunciationRegion);    
    let pronunciationHtml = pronunciation ? `${pronunciation} ` : '';
    let text = groupsText;
    
    text = `<p>${wordHtml}${pronunciationHtml}${partsHtml}</p>
        <p>${groupsText}</p>`;
    
    //console.log(text);
    return text;
}

function definitionToHtml(definition, supportLink){
    if(supportLink){
        if(definition.type == 'form'){
            return makeWordLink(generateDefinitionText(definition), definition.base);
        } else if(definition.type == 'link'){
            return makeWordLink(generateDefinitionText(definition), definition.link);
        }
    }

    return definition.subdefinitions.join('; ');
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