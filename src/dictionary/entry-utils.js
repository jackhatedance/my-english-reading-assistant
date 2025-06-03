'use strict'

import { DICTIONARY_DEFINITION_TYPE_LINK, DICTIONARY_DEFINITION_TYPE_FORM } from './dictConstants.js'

function deduplicatePhrases(phrases){
    let set = new Set(phrases);
    let array = [...set];
    return array;
}

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
    let mergedPhraseArray = [];
    let mergedPronunciationArray = [];
    let mergedDefinitionGroupMap = {};
    
    for(let entry of entries){
        if(entry.phrases){
            mergedPhraseArray.push(...entry.phrases);
        }
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
    mergedPhraseArray = deduplicatePhrases(mergedPhraseArray);
    mergedPronunciationArray= deduplicatePronunciations(mergedPronunciationArray);
    
    let mergedDefinitionGroups = [];
    for(let name in mergedDefinitionGroupMap){
        let definitions = mergedDefinitionGroupMap[name];
        mergedDefinitionGroups.push({name, definitions});
    }

    let mergedHeadword = { pronunciations: mergedPronunciationArray };
    let mergedEntry = {
        phrases: mergedPhraseArray,
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

function getTheOnlyDefinition(entries){
    if(entries && entries.length == 1){
        let entry = entries[0];
        let definitionGroups = entry.definitionGroups;
        if(definitionGroups && definitionGroups.length == 1){
            let definitionGroup = definitionGroups[0];
            let definitions = definitionGroup.definitions;
            if(definitions && definitions.length == 1){
                let definition = definitions[0];
                return definition;
            }
        }
    }
    return null;
}

function findTransformDefinitions(entries){
    let result = [];

    for(let entry of entries){
        let definitionGroups = entry.definitionGroups;
        for(let definitionGroup of definitionGroups){
            let definitions = definitionGroup.definitions;
            for(let definition of definitions){
                if(definition.type == DICTIONARY_DEFINITION_TYPE_FORM)
                result.push(definition);
            }
        }
    }
    return result;
}

function hasLinkDefinitionOnly(entries){
    let definition = getTheOnlyDefinition(entries);
    if(definition && definition.type == DICTIONARY_DEFINITION_TYPE_LINK){
        return true;                
    }

    return false;
}

function getTheOnlyLinkDefintion(entries){
    let definition = getTheOnlyDefinition(entries);
    if(definition && definition.type == DICTIONARY_DEFINITION_TYPE_LINK){
        //console.log(`get the only link of ${lookupResult.query}: ${definition.link}`);
        return definition;                
    }
}

function isOnlyTransform(entries, form){
    let definition = getTheOnlyDefinition(entries);
    if(definition && definition.type == DICTIONARY_DEFINITION_TYPE_FORM){
        if(!form){
            return true;
        } else if(definition.form == form) {
            return true;
        }
    }

    return false;
}


function getTheOnlyBaseForm(entries){    
    let definition = getTheOnlyDefinition(entries);
    if(definition && definition.type == DICTIONARY_DEFINITION_TYPE_FORM){
        //console.log(`get the only base form of ${lookupResult.query}: ${definition.base}`);
        return definition.base;
    }
}

function hasOnlyLinkOrFormDefinition(entries){
    let definition = getTheOnlyDefinition(entries);
    if(definition && 
        (
            definition.type == DICTIONARY_DEFINITION_TYPE_LINK ||
            definition.type == DICTIONARY_DEFINITION_TYPE_FORM
        )
    ){
        return true;                
    }

    return false;
}

function createLinkDefinition(link){
    let text = `见${link}`;

    return {
        text: text,
        subdefinitions: [text],
        type: 'link',
        link: link,
    };
}

function createEntryForLink(link){
    let definition = createLinkDefinition(link);        
    let definitions = [definition];
    let definitionGroup = { name: 'link', "definitions": definitions };        
    
    let pronunciations = [];
    let headword = { pronunciations };
    let definitionGroups = [ definitionGroup ];
    
    let entry = { headword, definitionGroups, type: 'link' };
    return entry;
}

export { mergeEntries, deduplicateSubdefinitions, hasLinkEntryOnly, hasLinkDefinitionOnly, getTheOnlyLinkDefintion, isOnlyTransform, getTheOnlyBaseForm, hasOnlyLinkOrFormDefinition, findTransformDefinitions, createLinkDefinition, createEntryForLink }