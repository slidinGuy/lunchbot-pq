const assert = require('assert');
const fileHelper = require('./file-helper');
const moment = require('moment');
const parseData = require('../../src/parsers/laudon');

describe('Test parsers - Laudon', () => {
    it('Parse Laudon', (done) => {
        fileHelper.loadData('./test/data/laudon.html')
            .then((html) => {
                const testDate = moment('05.10.2018', 'DD.MM.YYYY');
                const menu = parseData(html, testDate);                
                assert.deepEqual(menu,
                    {
                        found: true,
                        message: 'Pátek:\nČesneková s krutony, Drůbeží s nudlemi\n' + 
                        '1. Palačinky s horkým ovocem a šlehačkou\n' +
                        '2. Vepřová roláda plněná vaječnou směsí, bramborová\nkaše\n' + 
                        '3. 120g Vepřový plátek s fazolkami a\nanglickou slaninou, hranolky'
                    }
                );
                done();
            })
            .catch((e) => done(e));
    });
});
