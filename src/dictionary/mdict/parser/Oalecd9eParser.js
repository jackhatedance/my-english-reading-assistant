import { JsonSelectorParser } from './JsonSelectorParser.js'


class Oalecd9eParser extends JsonSelectorParser {
    constructor(options) {
        super(options);

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
                            selector: 'root/h-g',

                            groupName: {
                                selector: 'top-g pos',
                            },
                            definition:
                                [
                                    {
                                        selector: 'sn-gs sn-blk sn-g def chn'
                                    },
                                    {
                                        selector: 'sn-gs sn-blk-nolist sn-g def'
                                    },
                                    {
                                        selector: 'sn-gs sn-blk-nolist sn-g'
                                    },
                                ]
                        },

                    ]
                },

            ]
        };
    }

    beforeParsePronunciationText(text) {
        return text.replaceAll(/[🔊]/g, '')
    }

    getPronunciationRegion(name) {
        if (name && name.includes('BrE')) {
            return 'uk';
        } else if (name && name.includes('NAmE')) {
            return 'us';
        }
        return super.getPronunciationRegion(name);
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

    getLinkFromDefinition($, element, context) {
        const arrowSelector = 'xr-gs xrlabel arrow';
        const linkSelector = 'xr-gs xr-g-blk xr-g xh-blk xh a';
        let hasArrow = $(element).find(arrowSelector).length > 0;
        let hasLink = $(element).find(linkSelector).length > 0;
        if (hasArrow && hasLink) {
            let link = $(element).find(linkSelector).text();
            return link;
        }
    }

    parseDefinition($, element, context, entitySelector) {
        let link = this.getLinkFromDefinition($, element, context);
        if (link) {
            return this.createLinkDefinition(link);
        }


        return super.parseDefinition($, element, context, entitySelector);
    }

}

export { Oalecd9eParser }