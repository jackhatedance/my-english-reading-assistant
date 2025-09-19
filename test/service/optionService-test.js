import { strict as assert } from 'assert';
import { getEffectiveSiteOptions } from '../../src/service/optionService.js'

describe('optionService', function () {
  describe('#getEffectiveSiteOptions()', function () {
    it('v0.13.4 switch options - site options is old, enabled is false', async function () {
        let siteOptions = {
            enabled: false,
            dualAnnotationEnabled: false,
            annotation: {
                content: 'AC_DEFINITION',
                position: 0.1,
                fontSize: 0.3,
                opacity: 0.5,
                color: '#0000ff',
                interlaced: false,
                
                lineHeight: 1.2,
                maxMeaningNumber: 3,
                hideWordClass: false,
            },
            secondaryAnnotation: {
                content: 'AC_PRONUNCIATION',
                position: -1,   
                fontSize: 0.3,
                opacity: 0.5,
                color: '#e56910',
                interlaced: false,
            },
            content: {
                enabled: false,
                unknownWordColor: '#0000ff',
                unknownWordWidth: 1,
            },
            other:{
                additionalDictionaries: [],
            },
        };

        let defaultSiteOptions = {
            dualAnnotationEnabled: false,
            annotation: {
                content: 'AC_DEFINITION',
                position: 0.1,
                fontSize: 0.3,
                opacity: 0.5,
                color: '#0000ff',
                interlaced: false,
                
                lineHeight: 1.2,
                maxMeaningNumber: 3,
                hideWordClass: false,
            },
            secondaryAnnotation: {
                content: 'AC_PRONUNCIATION',
                position: -1,   
                fontSize: 0.3,
                opacity: 0.5,
                color: '#e56910',
                interlaced: false,
            },
            content: {
                enabled: false,
                unknownWordColor: '#0000ff',
                unknownWordWidth: 1,
            },
            other:{
                additionalDictionaries: [],
            },
            switch:{
                mode:''
            }
        };
        
        let effectiveSiteOptions = getEffectiveSiteOptions(siteOptions, defaultSiteOptions);

        assert.equal(effectiveSiteOptions.switch.mode, "off");
    });

    it('v0.13.4 switch options - site options is old, enabled is true', async function () {
        let siteOptions = {
            enabled: true,
            dualAnnotationEnabled: false,
            annotation: {
                content: 'AC_DEFINITION',
                position: 0.1,
                fontSize: 0.3,
                opacity: 0.5,
                color: '#0000ff',
                interlaced: false,
                
                lineHeight: 1.2,
                maxMeaningNumber: 3,
                hideWordClass: false,
            },
            secondaryAnnotation: {
                content: 'AC_PRONUNCIATION',
                position: -1,   
                fontSize: 0.3,
                opacity: 0.5,
                color: '#e56910',
                interlaced: false,
            },
            content: {
                enabled: false,
                unknownWordColor: '#0000ff',
                unknownWordWidth: 1,
            },
            other:{
                additionalDictionaries: [],
            },
        };

        let defaultSiteOptions = {
            dualAnnotationEnabled: false,
            annotation: {
                content: 'AC_DEFINITION',
                position: 0.1,
                fontSize: 0.3,
                opacity: 0.5,
                color: '#0000ff',
                interlaced: false,
                
                lineHeight: 1.2,
                maxMeaningNumber: 3,
                hideWordClass: false,
            },
            secondaryAnnotation: {
                content: 'AC_PRONUNCIATION',
                position: -1,   
                fontSize: 0.3,
                opacity: 0.5,
                color: '#e56910',
                interlaced: false,
            },
            content: {
                enabled: false,
                unknownWordColor: '#0000ff',
                unknownWordWidth: 1,
            },
            other:{
                additionalDictionaries: [],
            },
            switch:{
                mode:''
            }
        };
        
        let effectiveSiteOptions = getEffectiveSiteOptions(siteOptions, defaultSiteOptions);

        assert.equal(effectiveSiteOptions.switch.mode, "on");
    });

    it('v0.13.4 switch options - site options is empty', async function () {
        let siteOptions = {
            
        };

        let defaultSiteOptions = {
            dualAnnotationEnabled: false,
            annotation: {
                content: 'AC_DEFINITION',
                position: 0.1,
                fontSize: 0.3,
                opacity: 0.5,
                color: '#0000ff',
                interlaced: false,
                
                lineHeight: 1.2,
                maxMeaningNumber: 3,
                hideWordClass: false,
            },
            secondaryAnnotation: {
                content: 'AC_PRONUNCIATION',
                position: -1,   
                fontSize: 0.3,
                opacity: 0.5,
                color: '#e56910',
                interlaced: false,
            },
            content: {
                enabled: false,
                unknownWordColor: '#0000ff',
                unknownWordWidth: 1,
            },
            other:{
                additionalDictionaries: [],
            },
            switch:{
                mode:''
            }
        };
        
        let effectiveSiteOptions = getEffectiveSiteOptions(siteOptions, defaultSiteOptions);

        assert.equal(effectiveSiteOptions.switch.mode, "");
    });

    it('v0.13.4 switch options - site options is new, enabled is false', async function () {
        let siteOptions = {
            dualAnnotationEnabled: false,
            annotation: {
                content: 'AC_DEFINITION',
                position: 0.1,
                fontSize: 0.3,
                opacity: 0.5,
                color: '#0000ff',
                interlaced: false,
                
                lineHeight: 1.2,
                maxMeaningNumber: 3,
                hideWordClass: false,
            },
            secondaryAnnotation: {
                content: 'AC_PRONUNCIATION',
                position: -1,   
                fontSize: 0.3,
                opacity: 0.5,
                color: '#e56910',
                interlaced: false,
            },
            content: {
                enabled: false,
                unknownWordColor: '#0000ff',
                unknownWordWidth: 1,
            },
            other:{
                additionalDictionaries: [],
            },
            switch:{
                mode:''
            }
        };

        let defaultSiteOptions = {
            dualAnnotationEnabled: false,
            annotation: {
                content: 'AC_DEFINITION',
                position: 0.1,
                fontSize: 0.3,
                opacity: 0.5,
                color: '#0000ff',
                interlaced: false,
                
                lineHeight: 1.2,
                maxMeaningNumber: 3,
                hideWordClass: false,
            },
            secondaryAnnotation: {
                content: 'AC_PRONUNCIATION',
                position: -1,   
                fontSize: 0.3,
                opacity: 0.5,
                color: '#e56910',
                interlaced: false,
            },
            content: {
                enabled: false,
                unknownWordColor: '#0000ff',
                unknownWordWidth: 1,
            },
            other:{
                additionalDictionaries: [],
            },
            switch:{
                mode:'off'
            }
        };
        
        let effectiveSiteOptions = getEffectiveSiteOptions(siteOptions, defaultSiteOptions);

        assert.equal(effectiveSiteOptions.switch.mode, "");
    });

  });
  
  
});
