import { Dictionary } from '../Dictionary.js'
import { MDX, MDD, BufferedFile } from '@jackhatedance/js-mdict'
import { Buffer } from 'safe-buffer'
import { dataURItoArrayBuffer } from '../../utils/fileUtils.js'
import { findMdictProfile } from './mdictProfileRegister.js'
import { findMdictParser } from './mdictParserRegister.js'
import { findDictionaryExtractedRawFile } from '../../store/dictionaryStore.js'
import { loadDictionaryResourceFile, countDictionaryResourceFile } from '../../store/db.js'
import * as cheerio from 'cheerio';
import { eliminateFontFaces } from './css/css.js'
import { dataURItoText, base64ToDataUrl } from '../../utils/fileUtils.js'
import { Progress } from '../Progress.js'

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
                    //console.error(`parser not found`);    
                }
            }else{
                //console.error(`profile not found`);
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

    async needExtractResourceData(rawFileMap){
        let mddDataUriFile = this.getDataUriFile(rawFileMap, '.mdd');
        let resourceFileCount = await countDictionaryResourceFile(this.name);
        if(mddDataUriFile && resourceFileCount==0){
            return true;
        }else{
            return false;
        }
    }

    async extractResourceData(updateProgress){
                
        let mddFileMap = {};
        let total = this.mdd.keywordList.length;
        let progress = new Progress('extract resource data', total, updateProgress);
        progress.start();

        for(let keyword of this.mdd.keywordList){
            let key = keyword.keyText;
            let base64 = this.mdd.locate(key).definition;

            let dataUrl = await base64ToDataUrl(key, base64);
            mddFileMap[key]= dataUrl;

            await progress.count();
        }

        return mddFileMap;        
    }

    async getResource(key){
        if(!key){
            return null;
        }

        let result;
        if(key && key.endsWith('.css')){
            result = await findDictionaryExtractedRawFile(this.name, key);
        }

        let resourceKey = key.replaceAll(/\//g, '\\');
        if(!resourceKey.startsWith('\\')){
            resourceKey = '\\' + resourceKey;
        }
        if(!result){
            let resource = await loadDictionaryResourceFile(this.name, resourceKey);
            result = resource?.data;
        }
                
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
            let key = `${href}`;
            let resource = await this.getResource(key);
            //console.log(resource);
            if(resource){
                const css = dataURItoText(resource);
                //let css2 = replaceFontFaceSrcUrlWithDataUrl(css, getResource);
                let css2 = eliminateFontFaces(css)
                //console.log(css2);
                let style = `<style>${css2}</style>`;
                var styleElement = $(style);
                $(element).replaceWith(styleElement);
            }else{
                console.warn(`resource not found: ${key}`);
            }
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
            
            let dataUrl = await this.getResource(src);
            if(dataUrl){
                $(element).prop('src', dataUrl);            
            } else {
                console.warn(`resource not found: ${src}`);
            }            

            
        }

        let aElements = $('a');
        for(let element of aElements){
            let href = $(element).attr('href');
            if(href.startsWith('sound://')){
                href = href.replace('sound://', '');

                let dataUrl = await this.getResource(href);            

                $(element).attr('href', dataUrl);  
            }
                      
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

    supportOutputFormat(format){
        if(format == 'json' || format == 'text'){
            if(this.data.raw && !this.mdictParser){
                return false;
            }
        }

        return true;
    }
}

export { MdictDictionary }