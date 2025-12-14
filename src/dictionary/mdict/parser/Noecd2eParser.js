import { JsonSelectorParser } from './JsonSelectorParser.js'
import { trimByCharacters } from '../../../utils/stringUtils.js'
import { findBaseForm } from '../../base-forms.js'
import { PARSER_OPTION_ALL_UPPER_CASE_ENTRY_POLICY, ALL_UPPER_CASE_ENTRY_POLICY_LOWER_CASE } from '../../dictConstants.js'
import { removeParentheses } from '../../../text/textUtils.js'
import { SUBDEFINITION_SEPARATORS_TYPE_STATIC } from '../../DefinitionParser.js'

class Noecd2eParser extends JsonSelectorParser {
    constructor(options) {
        super('Noecd2eParser', "1.1.4", "1.0.0", options);

        this.options[PARSER_OPTION_ALL_UPPER_CASE_ENTRY_POLICY] = ALL_UPPER_CASE_ENTRY_POLICY_LOWER_CASE;

        this.subdefinitionSeparator = {
            type: SUBDEFINITION_SEPARATORS_TYPE_STATIC,
            value: ';'
        };

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
            const { base, form, matchedText } = baseForm;
            let lowerCaseBase = base.toLowerCase();

            text = matchedText.replace(base, lowerCaseBase);
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

    beforeParsePhraseText(text){
        let result = super.beforeParseDefinitionText(text);
        
        result = removeParentheses(result);
        
        return result;
    }
}

export { Noecd2eParser }