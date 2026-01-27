import { JsonSelectorParser } from './JsonSelectorParser.js'
import { trimByCharacters } from '../../../utils/stringUtils.js'
import { findBaseForm } from '../../base-forms.js'
import { PARSER_OPTION_ALL_UPPER_CASE_ENTRY_POLICY, ALL_UPPER_CASE_ENTRY_POLICY_LOWER_CASE } from '../../dictConstants.js'
import { removeParentheses } from '../../../text/textUtils.js'
import { SUBDEFINITION_SEPARATORS_TYPE_STATIC } from '../../DefinitionParser.js'

class Noecd2eParser extends JsonSelectorParser {
    constructor(options) {
        super('Noecd2eParser', "1.1.5", "1.0.0", options);

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

        this.patches = {
            "blah": `<link href="ODECN.css" rel="stylesheet" type="text/css" /><div class="entry"><div class="ODECN"><ranks><ri onclick='this.nextSibling.style.display="block"'><sp>U</sp><ra>11436</ra><frq>1445</frq></ri><dp onclick='this.style.display="none"'><cpt>blah</cpt><t><h>Spoken</h><itb><it><in style="height:53.15%;">.</in></it></itb><ib>640</ib></t><t><h>Fiction</h><itb><it><in style="height:35.96%;">.</in></it></itb><ib>433</ib></t><t><h>Magazine</h><itb><it><in style="height:15.78%;">.</in></it></itb><ib>190</ib></t><t><h>Newspaper</h><itb><it><in style="height:13.95%;">.</in></it></itb><ib>168</ib></t><t><h>Academic</h><itb><it><in style="height:1.16%;">.</in></it></itb><ib>14</ib></t></dp></ranks><div class="headword"><h2>blah</h2><span class="pron">/blɑː/</span><strong onclick="if (this.className=='active') {this.className=' ';this.parentNode.parentNode.parentNode.className='entry';} else{this.parentNode.parentNode.parentNode.className='entry trans';this.className='active'}"><em></em></strong></div><div class="main"><div class="content"> <div class="odef ext"><i>informal</i>  <非正式>如此等等; 如何如何(用来代替不想说下去的话)</div><div class="cont-list"><div class="pos">noun</div><div class="item"><strong class="snum">1</strong><div class="defs"><dl><dt><div class="odef">（亦作<em>blah-blah</em>/ˌblɑːˈblɑː/）[mass noun] used to refer to something which is boring or without meaningful content</div><div class="def">废话, 空话：</div></dt><dd><div class="example"><p class="en">talking all kinds of blah to him.</p><p class="cn">和他说了一大堆废话。</p> </div></dd> </dl></div></div><div class="item"><strong class="snum">2</strong><div class="defs"><dl><dt><div class="odef"><h3 class="comp"><em>the blahs</em></h3> <i>N. Amer.</i> depression</div><div class="def">〈北美〉沮丧, 抑郁：</div></dt><dd><div class="example"><p class="en">a case of the blahs.</p><p class="cn">抑郁症的一个实例。</p> </div></dd> </dl></div></div></div></div><div class="label">词源</div><div class="ori"><div class="body-ciyuan">early 20th cent. (originally US)： imitative.</div></div></div></div></div>`,
        };
    }

    

    beforeParse(query, rawDefinition){
        if(this.patches.hasOwnProperty(query)){
            return this.patches[query];
        }
        return rawDefinition;
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