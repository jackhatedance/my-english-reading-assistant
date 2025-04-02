import { getWordClassAbbreviation } from './wordClass.js'
import { mergeEntries } from './entry-utils.js'

class Dictionary {
    size = 0;
    name = null;
    data = null;

    constructor(data, name, options){

        if(!options){
            options = {};
        }

        this.data = data;
        this.name = name;
        this.options = options;
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
        //console.log(`lookup ${query}`);
        options = this.patchDefaultValues(options);

        let result = null;
        
        if(options.fromRaw){
            let rawResult = this.lookupFromRaw(query, options);
            if(rawResult){
                result = Object.assign({}, rawResult);
            }            
        } else {
            let indexResult = this.lookupFromIndex(query, options);
            if(indexResult){
                result = Object.assign({}, indexResult);
            }            
        }
        

        if(result){
            result.query = query;

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

    jsonToText(entries){
        if(!entries || entries.length == 0){
            return '';
        }

        let entry = mergeEntries(entries);
        
        let definitionObj = entry;

        let groupTexts = [];
        for(let definitionGroup of definitionObj.definitionGroups){
            const { name } = definitionGroup;
            let wordClass = getWordClassAbbreviation(name);

            let definitions = definitionGroup.definitions.filter(item => item.text && item.text.length > 0);

            let shortDefinitions = definitions.filter(item => item.text && item.text.length < 10);
            if(shortDefinitions.length >= 3){
                definitions = shortDefinitions;
            }
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

    jsonToHtml(result){
        const query = result.query;
        const entries = result.json;

        if(!entries || entries.length == 0){
            return '';
        }
    
        let entry = mergeEntries(entries);
    
        let definitionObj = entry;
    
        let groupTexts = [];
        for(let definitionGroup of definitionObj.definitionGroups){
            const { name, definitions} = definitionGroup;
            let wordClass = getWordClassAbbreviation(name);
    
            let definitionTexts = definitions.filter(item => item.text != '').map(item => item.text );
            let definitionsText = definitionTexts.join(',');
            let groupText = `${wordClass} ${definitionsText}`;
            groupTexts.push(groupText);
        }
        let groupsText = groupTexts.join('<br>');
        
        let pronunciation = definitionObj.pronunciation;    
        if(!definitionObj.pronunciation || definitionObj.pronunciation == ''){
            pronunciation = '';
        }else {
            pronunciation = `/${definitionObj.pronunciation}/`;
        }
        let text = `${query} ${pronunciation}<br>${groupsText}`;
    
        //console.log(text);
        return `${text}`;
    }

    createJson(result){        
        if(result.raw){
            result.json = this.rawToJson(result.raw);                    
        } else {
            throw new Error(`need raw but no raw`); 
        }
    }

    createText(result){
        //either from raw or json
        this.createJsonIfNotExist(result);
        result.text = this.jsonToText(result.json);   
    }

    createHtml(result){
        //either from raw or json
        this.createJsonIfNotExist(result);
        result.html = this.jsonToHtml(result);   
    }

    createJsonIfNotExist(result){
        if(!result.json){
            this.createJson(result);
        }
    }

    convertOutputFormat(result, options){

        if(options.outputFormats.includes('json') && !result.json){
            this.createJson(result);                      
        }        

        if(options.outputFormats.includes('text') && !result.text){
            this.createText(result);           
        }

        if(options.outputFormats.includes('html') && !result.html){
            this.createHtml(result);
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

        if(!options.outputFormats.includes('html')){
            delete result.html;
        }
    }
}

export { Dictionary }