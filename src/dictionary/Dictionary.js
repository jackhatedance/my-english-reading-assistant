import { getWordClassAbbreviation } from './wordClass.js'
class Dictionary {
    size = 0;
    name = null;
    data = null;

    constructor(data, name){
        this.data = data;
        this.name = name;
    }
    
    getDataUriFile(dataUriMap, ext) {
        let obj = dataUriMap;

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (key.endsWith(ext)) {
                    return { name: key, dataUri: obj[key]};
                }
            }
        }
    }
    
    generateDefaultOptions(){
        return {
            fromRaw: false,
            autoJumpLink: true,
            maxJumpingTimes: 3,
            jumpingTimes: 0,
            outputFormats:['text', 'json']
        };
    }

    patchDefaultValues(options){
        let defaultOptions = this.generateDefaultOptions();
        return Object.assign(defaultOptions, options);
    }

    lookup(query, options){
        options = this.patchDefaultValues(options);

        let result = null;
        
        if(options.fromRaw){
            result = this.lookupFromRaw(query, options);
        } else {
            result = this.lookupFromIndex(query, options);
        }
        return result;
    }
    
    lookupFromRaw(query, options){
        throw new Error('not impelmented');
    }

    lookupFromIndex(query, options) {
        let result = null;
        if(this.data.index && this.data.index.data.hasOwnProperty(query)){
            result = this.data.index.data[query];                
        }
        if(result){
            //clean ouput
            if(!options.outputFormats.includes('raw')){            
                delete result.raw;
            }

            if(!options.outputFormats.includes('json')){            
                delete result.json;
            }

            if(!options.outputFormats.includes('text')){
                delete result.text;
            }
        }
        //console.log(`lookup ${this.name} ${query}: ${JSON.stringify(result)}`);
        
        return result;
    }

    mergeEntries(entries){
        let mergedPronunciations = [];
        let mergedDefinitionGroupMap = {};
        
        for(let entry of entries){
            mergedPronunciations.push(entry.pronunciation);
            
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

        let mergedPronunciation = mergedPronunciations.join(',');
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

    toTextDefinition(entries){
        if(!entries || entries.length == 0){
            return '';
        }

        let entry = this.mergeEntries(entries);
        
        let definitionObj = entry;

        let groupTexts = [];
        for(let definitionGroup of definitionObj.definitionGroups){
            const { name, definitions} = definitionGroup;
            let wordClass = getWordClassAbbreviation(name);

            let definitionsText = definitions.join(',');
            let groupText = `${wordClass} ${definitionsText}`;
            groupTexts.push(groupText);
        }
        let groupsText = groupTexts.join('; ');
        let text = `${definitionObj.pronunciation} ${groupsText}`;
    
        console.log(text);
        return text;
    }
}

export { Dictionary }