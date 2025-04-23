import { JsonSelectorParser } from './JsonSelectorParser.js'


class Oalecd9eParser extends JsonSelectorParser {
    constructor(options) {
        super('Oalecd9eParser', options);

        this.entriesSelector =
        {
            entry: [
                {
                    selector: '.cixing_part',
                    headword: {
                        selector: '> top-g',
                        pronunciation:
                            [
                                {
                                    selector: 'pron-gs pron-g-blk'
                                },
                                {
                                    selector: 'pron pron-g-blk'
                                },
                            ]
                    },
                    definitionGroup: [
                        {
                            selector: 'subentry-g',

                            groupName: {
                                selector: 'top-g pos',
                            },
                            definition:
                                [
                                    {
                                        selector: 'sn-gs shcut-blk chn'
                                    },
                                    {
                                        selector: 'sn-gs sn-blk-nolist sn-g def chn'
                                    },
                                    {
                                        selector: 'sn-gs sn-blk sn-g def chn'
                                    },
                                ]
                        },
                    ]
                },
                {
                    selector: 'h-g',
                    headword: {
                        selector: '> top-g',
                        pronunciation:
                            [
                                {
                                    selector: 'pron-gs pron-g-blk'
                                },
                                {
                                    selector: 'pron pron-g-blk'
                                },
                            ],
                    },
                    definitionGroup: [
                        {
                            selector: '> sn-gs',

                            groupName: {
                                selector: 'headword/pos',
                            },
                            definition:
                                [
                                    {
                                        selector: 'sn-blk sn-g def chn'
                                    },
                                    {
                                        selector: 'sn-blk-nolist sn-g def chn'
                                    },
                                    {
                                        selector: 'sn-blk sn-g def'
                                    },
                                    {
                                        selector: 'sn-blk-nolist sn-g def'
                                    },
                                    {
                                        selector: 'sn-blk-nolist sn-g'
                                    },
                                ]
                        },

                    ]
                },

            ]
        };


        this.pronunciationRegionMapping = {
            uk: 'BrE',
            us: 'NAmE',
        };
    }

    beforeParsePronunciationText(text) {
        return text.replaceAll(/[🔊]/g, '')
    }

    getPronunciationForm(name) {
        if (name && name.includes('strong')) {
            return 'strong';
        }
        return super.getPronunciationForm(name);
    }

    trimPronounciation(text) {
        return super.trimPronounciation(text);
    }
}

export { Oalecd9eParser }