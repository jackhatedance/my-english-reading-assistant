import { profile as newOxfordEcDual } from './profiles/newOxfordEcDualProfile.js'
import { profile as yhd } from './profiles/yhdProfile.js'


const profiles = [newOxfordEcDual, yhd];

function compareMap(expectedMap, actualMap) {
    expectedMap = toLowerCaseKeyMap(expectedMap);
    actualMap = toLowerCaseKeyMap(actualMap);

    let result = true;
    for(let key in expectedMap){
        let expectedValue = expectedMap[key];
        
        let actualValue = null;
        if(actualMap.hasOwnProperty(key)) {
            actualValue = actualMap[key];
        }
        
        if(expectedValue != actualValue){
            //console.log(`header ${key} not match: expected: ${expectedValue}, actual: ${actualValue}`);
            result = false;
            break;
        }
    }
    return result;
}

function toLowerCaseKeyMap(map){
    let newMap = {};
    for(let key in map){
        let value = map[key];
        let lowerCaseKey = key.toLowerCase();
        newMap[lowerCaseKey] = value;
    }
    return newMap;
}

function findMdictProfile(mdxDictMeta) {
    let headers = mdxDictMeta.headers;
    if(!headers){
        return null;
    }
    for (let profile of profiles) {
        if(compareMap(profile.headers, headers)){
            //console.log(`find mdict profile`);
            return profile;
        }
    }
    return null;
}

export { compareMap, findMdictProfile }