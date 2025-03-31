import { Dictionary } from '../Dictionary.js'
import { MDX, MDD, BufferedFile } from '@jackhatedance/js-mdict'
import { Buffer } from 'safe-buffer'
import { dataURItoArrayBuffer } from '../../utils/fileUtils.js'
import { findMdictProfile } from './mdictProfileRegister.js'
import { findMdictParser } from './mdictParserRegister.js'


class MdictDictionary extends Dictionary {
    
    constructor(data, name) {
        super(data, name);

        const { raw, index, extracted } = data;

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
            let resource = this.mdd.locate(key);

            mddFileMap[key]= resource;
        }

        return {
            raw: rawFileMap,
            resource: mddFileMap
        };
    }

    getMddResource(key){
        if(!key){
            return null;
        }

        key = key.replaceAll(/\//g, '\\');
        if(!key.startsWith('\\')){
            key = '\\' + key;
        }

        let result = this.mdd.locate(key);
        return result?.definition;
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

    rawToHtml(rawDefinition){
        if(!this.mdictParser){
            throw new Error(`no parser found`);
        }

        return this.mdictParser.toHtml(rawDefinition, (key) => this.getMddResource(key));
    }

    createHtml(result){
        if(!result.raw){
            result.raw = this.lookupRaw(result.query);
        }
       
        result.html = this.rawToHtml(result.raw);   
    }
   
}

export { MdictDictionary }