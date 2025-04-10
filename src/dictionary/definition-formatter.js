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
    if(region == 'none'){
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

export { pronunciationsToText }