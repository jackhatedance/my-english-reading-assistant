import { Dictionary } from '../Dictionary.js'
import { MDX, MDD, BufferedFile } from '@jackhatedance/js-mdict'
import { Buffer } from 'safe-buffer'
import { dataURItoArrayBuffer } from '../../utils/fileUtils.js'
import { findMdictProfile } from './mdictProfileRegister.js'
import { findMdictParser } from './mdictParserRegister.js'


class MdictDictionary extends Dictionary {
    
    constructor(data, name) {
        super(data, name);

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

    lookupFromRaw(query, options) {
        let result = null;
        
        let entries = [];

        let rawLookupResult = this.mdx.lookup(query);
        if(rawLookupResult) {
            result = {};

            let rawDefinition = rawLookupResult.definition;

            if(options.outputFormats.includes('raw')){            
                result['raw'] = rawDefinition;
            }                

            let needParsing = options.outputFormats.length > 0;
            if(needParsing && rawDefinition) {

                if(!this.mdictParser){
                    throw new Error(`no parser found`);
                }

                entries = this.mdictParser.parse(rawDefinition);
                
                //only auto jump when there is only one entry and it is a link
                if(entries.length == 1 && entries[0].type == 'link' 
                    && options.autoJumpLink && options.jumpingTimes < options.maxJumpingTimes){
                    options.jumpingTimes ++;
    
                    let entry = entries[0];
                    let link = entry.link;
                    console.log(`autojump to: ${link}`);
                    result = this.lookup(link, options);
                }

                if(options.outputFormats.includes('json')){            
                    result['json'] = entries;
                }
        
                if(options.outputFormats.includes('text')){
                    let textDefinition = this.toTextDefinition(entries);
                    result['text'] = textDefinition;
                }
            }
        }            
    
        return result;
    }
   
}

export { MdictDictionary }