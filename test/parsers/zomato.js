const assert = require('assert');
const fileHelper = require('./file-helper');
const moment = require('moment');
const parseData = require('../../src/parsers/zomato');

describe('Test parsers - Zomato', () => {
    it('Parse Zomato', (done) => {
        fileHelper.loadData('./test/data/zomato.html')
            .then((html) => {
                const testDate = moment('23.10.2017', 'DD.MM.YYYY');
                const menu = parseData(html, testDate);
                assert.deepEqual(menu,
                    {
                        found: true,
                        message: 'Polévka rýžová se zeleninou /Bezlepkové jídlo/   \n' +
                            '1. Cuketová omáčka, tofu, brambory   \n' +
                            '2. Hrachová kaše, tempeh, okurek, pečivo /Bezlepkové jídlo/   '
                    }
                );
                done();
            })
            .catch((e) => done(e));
    });
});
