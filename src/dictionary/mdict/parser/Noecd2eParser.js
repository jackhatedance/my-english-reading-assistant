import { JsonSelectorParser } from './JsonSelectorParser.js'
import { trimByCharacters } from '../../../utils/stringUtils.js'
import { findBaseForm } from '../../base-forms.js'

class Noecd2eParser extends JsonSelectorParser {
    constructor(options) {
        super('Noecd2eParser', "1.0.1", "1.0.0", options);

        this.entriesSelector =
        {
            entry: [
                {
                    selector: '.ODECN',
                    headword: {
                        selector: '.headword',
                        pronunciation: {
                            selector: '.pron'
                        },
                    },
                    definitionGroup: [
                        {
                            selector: '.content .cont-list',

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
                                    },
                                    {
                                        selector: '.def',
                                    },
                                ]
                        },

                    ]
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