import { GenericSelectorParser } from './GenericSelectorParser.js'


class Oalecd9eParser extends GenericSelectorParser {
    constructor(data, name){
        super(data, name);

        let selectors = { };
        selectors[this.ENTRY] = ['.cixing_part', 'h-g'];
        selectors[this.HEADWORD] = ['> top-g'];
        selectors[this.PRONUNCIATION] = ['pron-gs pron-g-blk', 'pron pron-g-blk'];
        selectors[this.DEFINITION_GROUP] = ['subentry-g', 'root:h-g'];
        selectors[this.GROUP_NAME] = 'top-g pos';
        selectors[this.DEFINITION] = ['sn-gs shcut-blk chn', 'sn-gs sn-blk-nolist sn-g def chn', 'sn-gs sn-blk sn-g def chn', 
            'sn-gs sn-blk-nolist sn-g def',

            'sn-gs sn-blk-nolist sn-g',//for rode
        ];
        
        this.selectors = selectors;
    }

    beforeParsePronunciationText(text){
        return text.replaceAll(/[🔊]/g, '')
    }

    getPronunciationRegion(name){
        if(name && name.includes('BrE')){
            return 'uk';
        }else if(name && name.includes('NAmE')){
            return 'us';
        }
        return super.getPronunciationRegion(name);
    }

    getPronunciationForm(name){
        if(name && name.includes('strong')){
            return 'strong';
        }
        return super.getPronunciationForm(name);
    }

    trimPronounciation(text){
        return super.trimPronounciation(text);
    }

    getLinkFromDefinition($, element, context){
        const arrowSelector = 'xr-gs xrlabel arrow';
        const linkSelector = 'xr-gs xr-g-blk xr-g xh-blk xh a';
        let hasArrow = $(element).find(arrowSelector).length > 0;
        let hasLink = $(element).find(linkSelector).length > 0;
        if(hasArrow && hasLink){
            let link = $(element).find(linkSelector).text();
            return link;
        }
    }

    parseDefinition($, element, context){
        let link = this.getLinkFromDefinition($, element, context);
        if(link){
            return this.createLinkDefinition(link);
        }


        return super.parseDefinition($, element, context);
    }
    
}

export { Oalecd9eParser }