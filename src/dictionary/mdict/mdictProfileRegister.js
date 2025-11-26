import { profile as newOxfordEcDual } from './profiles/newOxfordEcDualProfile.js'
import { profile as oalecd8e } from './profiles/oalecd8e.js'
import { profile as oalecd9e } from './profiles/oalecd9e.js'
import { profile as oald9e } from './profiles/oald9e.js'
import { profile as yhd } from './profiles/yhdProfile.js'
import { profile as mwalecd } from './profiles/mwalecd.js'
import log from 'loglevel'

const gLogger = log.getLogger("mdict-profile-register");

const profiles = [newOxfordEcDual, oalecd8e, oalecd9e, oald9e, yhd, mwalecd];

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
        
        if(!compare(expectedValue, actualValue)){
            gLogger.debug(`header ${key} not match: expected: ${expectedValue}, actual: ${actualValue}`);
            result = false;
            break;
        }
    }
    return result;
}

function compare(value1, value2){
    if(typeof value1 == 'string' && typeof value2 == 'string'){
        return compareStringIngoreSpace(value1, value2);
    }else{
        return value1 == value2;
    }
}

function compareStringIngoreSpace(string1, string2){
    string1 = string1.replace(/\s/g, "");
    string2 = string2.replace(/\s/g, "");
    return string1 == string2;
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
        gLogger.debug(`start compare profile to ${profile.headers.Title}`);
        if(compareMap(profile.headers, headers)){
            //console.log(`find mdict profile`);
            return profile;
        }
    }
    return null;
}

export { compareMap, findMdictProfile }