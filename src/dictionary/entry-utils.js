
function mergeEntries(entries){
    let mergedPronunciationSet = new Set();
    let mergedDefinitionGroupMap = {};
    
    for(let entry of entries){
        mergedPronunciationSet.add(entry.pronunciation);
        
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
    let mergedPronunciationArray= Array.from(mergedPronunciationSet);
    let mergedPronunciation = mergedPronunciationArray.join(',');
    let mergedDefinitionGroups = [];
    for(let name in mergedDefinitionGroupMap){
        let definitions = mergedDefinitionGroupMap[name];
        mergedDefinitionGroups.push({name, definitions});
    }
    let mergedEntry = {
        pronunciation: mergedPronunciation,
        definitionGroups : mergedDefinitionGroups,
    };
    return mergedEntry;
}

export { mergeEntries }