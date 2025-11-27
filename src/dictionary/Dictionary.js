import { getWordClassAbbreviation } from './wordClass.js'
import { mergeEntries } from './entry-utils.js'
import { pronunciationsToText, entriesToHtml } from './definition-formatter.js'
import log from 'loglevel'

const gLogger = log.getLogger("dictionary");
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

            this.createOutputFormats(result, options);
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
        
        if (gLogger.getLevel() <= log.levels.DEBUG) {
            gLogger.debug('lookupIndex '+ query + ':' + JSON.stringify(result));
        }
        return result;
    }

    lookupFromIndex(query, options) {
        return this.lookupIndex(query);
    }

    jsonToText(entries, options){
        if(!entries || entries.length == 0){
            return '';
        }

        let entry = mergeEntries(entries);
        
        let definitionObj = entry;

        let groupTexts = [];
        for(let definitionGroup of definitionObj.definitionGroups){
            let wordClass = definitionGroup.name;

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

        let region = options.pronunciationRegion;
        let pronunciation = pronunciationsToText(definitionObj.headword.pronunciations, region);    
        
        let text = groupsText;
        if(pronunciation){
            text = `${pronunciation}\n${groupsText}`;
        }
    
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
    
        let html = entriesToHtml(query, entries);
        
        
        //console.log(html);
        return html;
    }

    createOutput(result, options, format){
        if(format == 'json'){
            this.createJson(result, options);
        } else if(format == 'text'){
            this.createText(result, options);
        } else if(format == 'html'){
            this.createHtml(result, options);
        }
    }

    createJson(result, options){        
        if(result.raw){
            result.json = this.rawToJson(result.raw);                    
        } else {
            throw new Error(`need raw but no raw`); 
        }
    }

    createText(result, options){
        //either from raw or json
        this.createJsonIfNotExist(result);
        result.text = this.jsonToText(result.json, options);   
    }

    createHtml(result, options){
        //either from raw or json
        this.createJsonIfNotExist(result);
        result.html = this.jsonToHtml(result);   
    }

    createJsonIfNotExist(result){
        if(!result.json){
            this.createJson(result);
        }
    }

    createOutputFormats(result, options){
        this.createOutputFormat(result, options, 'json');
        this.createOutputFormat(result, options, 'text');
        this.createOutputFormat(result, options, 'html');
    }

    createOutputFormat(result, options, format){
        let option = this.findOutputFormatOption(options, format);
        if(option && !result[format]){
            if(this.supportOutputFormat(format) || option.optional == false){
                this.createOutput(result, options, format);
            }            
        }        
    }

    findOutputFormatOption(options, format){
        let findResult = options.outputFormats.find(item => {
            if(typeof item == 'string'){
                return item == format;
            }else{
                return item.name == format;
            }
        });
        
        if(typeof findResult == 'string'){
            findResult = { name: findResult, optional: false};
        }
        return findResult;        
    }

    includesOuputFormatOption(options, format){
        let option = this.findOutputFormatOption(options, format);
        return option != null;
    }

    supportOutputFormat(format){
        return false;
    }

    cleanOutputFormat(result, options){
        if(!this.includesOuputFormatOption(options, 'raw')){            
            delete result.raw;
        }

        if(!this.includesOuputFormatOption(options, 'json')){            
            delete result.json;
        }

        if(!this.includesOuputFormatOption(options, 'text')){
            delete result.text;
        }

        if(!this.includesOuputFormatOption(options, 'html')){
            delete result.html;
        }
    }
}

export { Dictionary }