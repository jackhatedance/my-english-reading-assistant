import { GenericSelectorParser } from './GenericSelectorParser.js'


class Oalecd9eParser extends GenericSelectorParser {
    constructor(data, name){
        super(data, name);

        let selectors = { };
        selectors[this.ENTRY] = ['.cixing_part', 'h-g'];
        selectors[this.PRONUNCIATION] = ['> top-g pron-gs', '> top-g pron pron-g-blk'];
        selectors[this.DEFINITION_GROUP] = ['subentry-g', 'root:h-g'];
        selectors[this.GROUP_NAME] = 'top-g pos';
        selectors[this.DEFINITION] = ['sn-gs shcut-blk chn', 'sn-gs sn-blk-nolist sn-g def chn', 'sn-gs sn-blk sn-g def chn', 
            'sn-gs sn-blk-nolist sn-g def',

            'sn-gs sn-blk-nolist sn-g',//for rode
        ];
        
        this.selectors = selectors;
    }


    trimPronounciation(text){
        text = text.replaceAll(/[🔊]/g, '')
        return super.trimPronounciation(text);
    }

}

export { Oalecd9eParser }