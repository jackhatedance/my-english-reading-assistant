import { JsonSelectorParser } from './JsonSelectorParser.js'
import { trimByCharacters } from '../../../utils/stringUtils.js'
import { findBaseForm } from '../../base-forms.js'

class Noecd2eParser extends JsonSelectorParser {
    constructor(options) {
        super('Noecd2eParser', "1.1.1", "1.0.0", options);

        this.entriesSelector =
        {
            entry: [
                {
                    selector: '.ODECN',
                    testSelector: '.ODECN>.main',
                    headword: {
                        selector: '.headword',
                        pronunciation: {
                            selector: '.pron'
                        },
                    },
                    definitionGroup: [
                        {
                            group: '1',
                            selector: '.main>.content>.odef.ext',
                            definition:
                                [
                                    {
                                        selector: 'definitionGroup/',
                                        removeSelector: 'sup'
                                    },
                                ]
                        },
                        {
                            selector: '.main>.content .cont-list',

                            groupName: {
                                selector: '.pos',
                            },
                            inflection: {
                                selector: '.inflection',
                            },
                            definition:
                                [
                                    {
                                        selector: '.item .defs>dl .def',
                                        removeSelector: 'strong'
                                    },
                                    {
                                        selector: '.defs>dl .def',
                                        removeSelector: 'sup'
                                    },
                                    {
                                        selector: '.def',
                                        removeSelector: 'sup'
                                    },
                                ]
                        },

                    ],
                    phrase: [
                        {
                            selector: '.main>.phrase_exam .word-explain .phrase>h3',

                        },
                    ]
                },
                {
                    selector: '.ODECN',
                    testSelector: '.ODECN>.extras',
                    definitionGroup: [
                        {
                            selector: '.phrase',
                            definition:
                                [
                                    {
                                        selector: '.cont-list .item .defs dl dt .def',
                                    },
                                    {
                                        selector: '.cont-list .defs dl dt .def',
                                    },
                                    {
                                        selector: '.cont-list dl dt .def',
                                    },
                                ]
                        },

                    ],
                },
            ]
        };
    }

    beforeParseDefinitionText(text) {

        let baseForm = findBaseForm(text);
        if (baseForm) {
            const { base, form } = baseForm;
            let lowerCaseBase = base.toLowerCase();

            text = text.replace(base, lowerCaseBase);
        }

        return super.beforeParseDefinitionText(text);
    }

    afterParseDefinitionGroup(definitionGroup) {
        const { name, inflection } = definitionGroup;
        if (name.includes(inflection)) {
            definitionGroup.name = name.replace(inflection, '');
        }
        super.afterParseDefinitionGroup(definitionGroup);
    }

    trimDefinition(text) {
        text = trimByCharacters(text, '：。');
        return super.trimDefinition(text);
    }
}

export { Noecd2eParser }