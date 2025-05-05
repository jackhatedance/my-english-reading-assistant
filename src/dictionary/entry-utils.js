'use strict'

import { DICTIONARY_DEFINITION_TYPE_LINK, DICTIONARY_DEFINITION_TYPE_FORM } from './dictConstants.js'

/**
 * remove duplicates
 * @param {*} pronunciations 
 */
function deduplicatePronunciations(pronunciations){
    let keySet = new Set();

    let array = [];
    for(let pronunication of pronunciations){
        let key = `${pronunication.region}${pronunication.form}`;
        if(!keySet.has(key)){
            keySet.add(key);

            array.push(pronunication);
        }        
    }
    return array;
}

function deduplicateSubdefinitions(definitionGroup){
    let subdefinitionSet = new Set();
    for(let definition of definitionGroup.definitions){
        let duplicatedSubdefinitions = definition.subdefinitions.filter( item => !subdefinitionSet.has(item));
        definition.subdefinitions = duplicatedSubdefinitions;
        definition.text = duplicatedSubdefinitions.join(',');

        for(let duplicatedSubdefinition of duplicatedSubdefinitions){
            subdefinitionSet.add(duplicatedSubdefinition);
        }        
    }
}

function mergeEntries(entries){
    let mergedPronunciationArray = [];
    let mergedDefinitionGroupMap = {};
    
    for(let entry of entries){
        if(entry.headword?.pronunciations) {
            mergedPronunciationArray.push(...entry.headword.pronunciations);
        }        
        
        for(let definitionGroup of entry.definitionGroups){
            const { name, definitions} = definitionGroup;
            
            let mergedGroupDefinitions;
            if(mergedDefinitionGroupMap.hasOwnProperty(name)){
                mergedGroupDefinitions = mergedDefinitionGroupMap[name];
            } else {
                mergedGroupDefinitions = [];                    
            }

            mergedDefinitionGroupMap[name] = mergedGroupDefinitions.concat(definitions);
        }
    }
    mergedPronunciationArray= deduplicatePronunciations(mergedPronunciationArray);
    
    let mergedDefinitionGroups = [];
    for(let name in mergedDefinitionGroupMap){
        let definitions = mergedDefinitionGroupMap[name];
        mergedDefinitionGroups.push({name, definitions});
    }

    let mergedHeadword = { pronunciations: mergedPronunciationArray };
    let mergedEntry = {
        headword: mergedHeadword,
        definitionGroups : mergedDefinitionGroups,
    };
    return mergedEntry;
}

function hasLinkEntryOnly(entries){
    try{
        if(entries.length ==1){
            let entry = entries[0];
            if(entry.type == DICTIONARY_DEFINITION_TYPE_LINK){
                return true;                
            }
        }        
    }catch(error){
        //do nothing
    }

    return false;
}

function hasLinkDefinitionOnly(entries){
    try{
        let definitions = entries[0].definitionGroups[0].definitions;
        if(definitions.length ==1){
            let definition = definitions[0];
            if(definition.type == DICTIONARY_DEFINITION_TYPE_LINK){
                return true;                
            }
        }        
    }catch(error){
        //do nothing
    }

    return false;
}

function getTheOnlyLinkDefintion(entries){
    let definitions = entries[0].definitionGroups[0].definitions;
    if(definitions.length ==1){
        let definition = definitions[0];
        if(definition.type == DICTIONARY_DEFINITION_TYPE_LINK){
            //console.log(`get the only link of ${lookupResult.query}: ${definition.link}`);
            return definition;                
        }
    }  
}

function isOnlyTransform(entries, form){
    try{
        let definitions = entries[0].definitionGroups[0].definitions;
        if(definitions.length ==1){
            let definition = definitions[0];
            if(definition.type == DICTIONARY_DEFINITION_TYPE_FORM){
                if(!form){
                    return true;
                } else if(definition.form == form) {
                    return true;
                }
            }
        }        
    }catch(error){
        //do nothing
    }

    return false;
}


function getTheOnlyBaseForm(entries){    
    try{
        let definitions = entries[0].definitionGroups[0].definitions;
        if(definitions.length ==1){
            let definition = definitions[0];
            if(definition.type == DICTIONARY_DEFINITION_TYPE_FORM){
                //console.log(`get the only base form of ${lookupResult.query}: ${definition.base}`);
                return definition.base;
            }
        }        
    }catch(error){
        //do nothing
    }
}

export { mergeEntries, deduplicateSubdefinitions, hasLinkEntryOnly, hasLinkDefinitionOnly, getTheOnlyLinkDefintion, isOnlyTransform, getTheOnlyBaseForm }