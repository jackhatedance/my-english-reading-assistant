import { strict as assert } from 'assert';
import { process } from '../../src/activity/activity-core.js'

describe('activity core', function () {
    describe('initialized', function () {
        it('first time initialized', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            assert.equal(newTabInfo.startTime, time1);
            assert.equal(saveCounter, 0);
        });

        it('second time initialized, continue reading', async function () {
            let time1 = new Date().getTime();
            let time2 = time1 + 5;
            let userTabs = {
                tabs:[
                    {
                        tabId: '123',
                        title: 'foo',
                        url: 'https://example.com/xyz.html',
                        isbn: '456',
                        site: 'example.com',
                        totalWordCount: 100,
                        wordChanges: 0,
                        startTime: time1,
                    }
                ]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time2,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            assert.equal(newTabInfo.startTime, time1);
            assert.equal(saveCounter, 0);
        });

        it('second time initialized, URL changed', async function () {
            let time1 = new Date().getTime();
            let time2 = time1 + 5;
            let userTabs = {
                tabs:[
                    {
                        tabId: '123',
                        title: 'foo',
                        url: 'https://example.com/xyz.html',
                        isbn: '456',
                        site: 'example.com',
                        totalWordCount: 100,
                        wordChanges: 0,
                        startTime: time1,
                    }
                ]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz2.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time2,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            assert.equal(newTabInfo.startTime, time2);
            assert.equal(saveCounter, 1);
        });

  
    });

    describe('clean', function () {
        it('initialized to clean', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            saveCounter = 0;
            await process(userTabs, 'cleaned', { tabId, saveReadingActivity});

            assert.equal(userTabs.tabs.length, 0);
            assert.equal(saveCounter, 1);
        });
    });

    describe('blur', function () {
        it('initialized to blur', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            saveCounter = 0;
            await process(userTabs, 'blur', { tabId, saveReadingActivity});

            assert.equal(userTabs.tabs.length, 1);
            assert.equal(newTabInfo.startTime, null);
            assert.equal(saveCounter, 1);
        });
    });

    describe('focus', function () {
        it('initialized -> blur -> focus', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            saveCounter = 0;
            await process(userTabs, 'blur', { tabId, saveReadingActivity});

            saveCounter = 0;
            await process(userTabs, 'focus', { tabId, saveReadingActivity});

            assert.equal(userTabs.tabs.length, 1);
            assert.notEqual(newTabInfo.startTime, null);
            assert.equal(saveCounter, 0);
        });
    });

    describe('idle', function () {
        it('initialized -> idle', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            saveCounter = 0;
            let idleState = 'idle';
            await process(userTabs, 'idleStateChanged', { tabId, idleState, saveReadingActivity});

            assert.equal(userTabs.tabs.length, 1);
            assert.equal(newTabInfo.startTime, null);
            assert.equal(saveCounter, 1);
        });

        it('initialized -> idle -> active', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            saveCounter = 0;
            let idleState = 'idle';
            await process(userTabs, 'idleStateChanged', { tabId, idleState, saveReadingActivity});

            saveCounter = 0;
            idleState = 'active';
            await process(userTabs, 'idleStateChanged', { tabId, idleState, saveReadingActivity});

            assert.equal(userTabs.tabs.length, 1);
            assert.notEqual(newTabInfo.startTime, null);
            assert.equal(saveCounter, 0);
        });

        it('initialized -> idle -> locked', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            saveCounter = 0;
            let idleState = 'idle';
            await process(userTabs, 'idleStateChanged', { tabId, idleState, saveReadingActivity});

            saveCounter = 0;
            idleState = 'locked';
            await process(userTabs, 'idleStateChanged', { tabId, idleState, saveReadingActivity});

            assert.equal(userTabs.tabs.length, 1);
            assert.equal(newTabInfo.startTime, null);
            assert.equal(saveCounter, 0);
        });
    });

    describe('tabRemoved', function () {
        it('initialized -> tabRemoved', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 0,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = async ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            saveCounter = 0;
            let collectGarbageTabs = async ()=> {};
            await process(userTabs, 'tabRemoved', { tabId, saveReadingActivity, collectGarbageTabs});

            assert.equal(userTabs.tabs.length, 0);
            assert.equal(saveCounter, 1);
        });
    });

    describe('mark word', function () {
        it('initialized -> markWord', async function () {
            let time1 = new Date().getTime();
            let userTabs = {
                tabs:[]
            };

            let newTabInfo = {
                tabId: '123',
                title: 'foo',
                url: 'https://example.com/xyz.html',
                isbn: '456',
                site: 'example.com',
                totalWordCount: 100,
                wordChanges: 10,
                startTime: time1,
            };

            let tabId = '123';

            var saveCounter = 0;
            let saveReadingActivity = ()=>{saveCounter++};

            await process(userTabs, 'initialized', { tabId, newTabInfo, saveReadingActivity});

            saveCounter = 0;
            let wordChanges = 1;
            await process(userTabs, 'markWord', { tabId, wordChanges});

            assert.equal(userTabs.tabs.length, 1);
            assert.equal(newTabInfo.wordChanges, 11);
        });
    });
});
