import { Dictionary } from '../Dictionary.js'
import { MDX, MDD, BufferedFile } from '@jackhatedance/js-mdict'
import { Buffer } from 'safe-buffer'
import { dataURItoArrayBuffer } from '../../utils/fileUtils.js'
import { findMdictProfile } from './mdictProfileRegister.js'
import { findMdictParser } from './mdictParserRegister.js'
import { loadDictionaryExtractedResourceData } from '../../store/dictionaryStore.js'
import * as cheerio from 'cheerio';
import { eliminateFontFaces, createDataUrl } from './css/css.js'
import { base64toText } from '../../utils/fileUtils.js'

class MdictDictionary extends Dictionary {
    
    constructor(data, name, options) {
        super(data, name, options);
        this.patchOptions();
        const { raw, index } = data;

        if(raw){            
            const fileMap = raw;
            let mdxDataUriFile = this.getDataUriFile(fileMap, '.mdx');
            let mdxBufferedFile = this.getBufferedFile(mdxDataUriFile);
            this.mdx = new MDX(mdxBufferedFile);   
            
            this.size = this.mdx.keyHeader?.keywordNum ?? 0;
            this.title = this.mdx.header?.Title ?? name;
            
            let headers = Object.assign({}, this.mdx.header);
            this.rawMeta = { headers };
            
            let profile = findMdictProfile(this.rawMeta);
            if(profile){
                this.mdictParser = findMdictParser(profile.parser);
                if(!this.mdictParser){
                    console.error(`parser not found`);    
                }
            }else{
                console.error(`profile not found`);
            }            

            //mdd is optional
            let mddDataUriFile = this.getDataUriFile(fileMap, '.mdd');
            if(mddDataUriFile){
                let mddBufferedFile = this.getBufferedFile(mddDataUriFile);
                this.mdd = new MDD(mddBufferedFile);  
            }        
        
        }
        
    }

    patchOptions(){
        if(!this.options.rawType){
            this.options.rawType = 'package';
        }
    }

    extractData(){
        let rawFileMap = {};
        
        for(let fileName in this.data.raw){
            let fileData = this.data.raw[fileName];

            if(!fileName.endsWith('.mdd')){                
                rawFileMap[fileName] = fileData;
            }            
        }
        
        let mddFileMap = {};
        for(let keyword of this.mdd.keywordList){
            let key = keyword.keyText;
            let resource = this.mdd.locate(key).definition;

            mddFileMap[key]= resource;
        }

        return {
            raw: rawFileMap,
            resource: mddFileMap
        };
    }

    async getResource(key){
        if(!key){
            return null;
        }

        key = key.replaceAll(/\//g, '\\');
        if(!key.startsWith('\\')){
            key = '\\' + key;
        }

        let result = await loadDictionaryExtractedResourceData(this.name, key)
                
        return result;
    }

    getBufferedFile(file){
        let arrayBuffer = dataURItoArrayBuffer(file.dataUri);
        const buffer = Buffer.from(arrayBuffer);
        const bufferedFile = new BufferedFile(file.name, buffer);
        return bufferedFile;
    }
  
    getRawMeta(){
        return this.rawMeta;
    }

    getKeys(){
        return this.mdx.keywordList.map( (item => item.keyText))
    }
    
    lookupRaw(query) {
        return this.mdx.lookup(query)?.definition;
    }    

    rawToJson(definition){
        if(!this.mdictParser){
            throw new Error(`no parser found`);
        }

        //console.log(definition);

        return this.mdictParser.toJson(definition);
    }

    async toEmbeddedHtml(html){        
        const $ = cheerio.load(html, null, false);
                
        let stylesheetElements = $('link[rel="stylesheet"]');
        for(let element of stylesheetElements){
            let href = $(element).attr('href');
            let key = `\\${href}`;
            let resource = await this.getResource(key);
            //console.log(resource);
            const css = base64toText(resource);
            //let css2 = replaceFontFaceSrcUrlWithDataUrl(css, getResource);
            let css2 = eliminateFontFaces(css)
            //console.log(css2);
            let style = `<style>${css2}</style>`;
            var styleElement = $(style);
            $(element).replaceWith(styleElement);
        }

        let scriptElements = $('script[type="text/javascript"]');
        for(let element of scriptElements){
            let src = $(element).prop('src');
            let key = `\\${src}`;
            let resource = await this.getResource(key);

            $(element).prop('src', resource);            
        }

        let imgElements = $('img');
        for(let element of imgElements){
            let src = $(element).prop('src');
            
            let resource = await this.getResource(src);
            let dataUrl = await createDataUrl(src, resource);
            

            $(element).prop('src', dataUrl);            
        }

        return $.html();    
    }

    createHtml(result){
        if(!result.raw){
            result.raw = this.lookupRaw(result.query);
        }
       
        result.html = result.raw;
        result.dictionary = this;
    }
   
}

export { MdictDictionary }