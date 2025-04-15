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
        mergedPronunciationArray.push(...entry.headword.pronunciations);
        
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

export { mergeEntries, deduplicateSubdefinitions }