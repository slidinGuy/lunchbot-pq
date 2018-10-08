const assert = require('assert');
const fileHelper = require('./file-helper');
const moment = require('moment');
const parseData = require('../../src/parsers/menza');

describe('Test parsers - Menza', () => {
    it('Parse Menza', (done) => {
        fileHelper.loadData('./test/data/menza.html')
            .then((html) => {
                const menu = parseData(html, testDate);
                assert.deepEqual(menu,
                    {
                        found: true,
                        message: 'Hovězí tokáň, špagety\n' +
                            'Segedínský guláš, houskové knedlíky\n' +
                            'Bělehradský vepřový řízek, opékané brambory\n' +
                            'Sázené vejce, fazolky na smetaně, vařené brambory\n' +
                            '1/2 pečené kuře, chléb, okurek, zeleninová obloha\n'
                    }
                );
                done();
            })
            .catch((e) => done(e));
    });
});
