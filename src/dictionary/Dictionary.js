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
            autoJumpLink: false,
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
        

        if(result){

            let entries = result.json;
            if(entries){
                //only auto jump when there is only one entry and it is a link
                if(entries.length == 1 && entries[0].type == 'link' 
                    && options.autoJumpLink && options.jumpingTimes < options.maxJumpingTimes){
                    options.jumpingTimes ++;
    
                    let entry = entries[0];
                    let link = entry.link;
                    console.log(`autojump to: ${link}`);
                    result = this.lookup(link, options);
                }
            }

            this.convertOutputFormat(result, options);
            this.cleanOutputFormat(result, options);
        }

        return result;
    }
    
    //raw result is string
    lookupRaw() {
        throw new Error('not impelmented');
    }

    lookupFromRaw(query, options) {
        let result = null;
        

        let rawLookupResult = this.lookupRaw(query);
        if(rawLookupResult) {
            result = {};

            result.raw = rawLookupResult;                        
        }            
    
        return result;
    }

    lookupIndex(query){
        let result = null;
        if(this.data.index && this.data.index.data.hasOwnProperty(query)){
            result = this.data.index.data[query];                
        }
        return result;
    }

    lookupFromIndex(query, options) {
        return this.lookupIndex(query);
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

    jsonToText(entries){
        if(!entries || entries.length == 0){
            return '';
        }

        let entry = this.mergeEntries(entries);
        
        let definitionObj = entry;

        let groupTexts = [];
        for(let definitionGroup of definitionObj.definitionGroups){
            const { name, definitions} = definitionGroup;
            let wordClass = getWordClassAbbreviation(name);

            let definitionTexts = definitions.map(item => item.text );
            let definitionsText = definitionTexts.join(',');
            let groupText = `${wordClass} ${definitionsText}`;
            groupTexts.push(groupText);
        }
        let groupsText = groupTexts.join('; ');

        let pronunciation = definitionObj.pronunciation;    
        if(!definitionObj.pronunciation || definitionObj.pronunciation == ''){
            pronunciation = '';
        }else {
            pronunciation = `/${definitionObj.pronunciation}/`;
        }
        let text = `${pronunciation}\n${groupsText}`;
    
        //console.log(text);
        return text;
    }

    createJsonIfNotExist(result){
        if(!result.json){
            if(result.raw){
                result.json = this.rawToJson(result.raw);                    
            }
        }
        if(!result.json){
            throw new Error(`need JSON but no JSON`); 
        }
    }

    convertOutputFormat(result, options){

        if(options.outputFormats.includes('json') && !result.json){
            this.createJsonIfNotExist(result);                      
        }        

        if(options.outputFormats.includes('text') && !result.text){
            this.createJsonIfNotExist(result);
            result.text = this.jsonToText(result.json);            
        }    
    }

    cleanOutputFormat(result, options){
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
}

export { Dictionary }