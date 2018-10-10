const assert = require('assert');
const fileHelper = require('./file-helper');
const moment = require('moment');
const parseData = require('../../src/parsers/menza');

describe('Test parsers - Menza', () => {
    it('Parse Menza', (done) => {
        fileHelper.loadData('./test/data/menza.html')
            .then((html) => {
                const menu = parseData(html);
                assert.deepEqual(menu,
                    {
                        found: true,
                        message: '1. Svíčková na smetaně, houskové knedlíky, zbývá porcí: 0\n' +
                            '2. Sklářský vepřový závitek, bramborová kaše, zbývá porcí: 0\n' +
                            '3. Nudle s tvarohem, zbývá porcí: 0\n' +
                            '4. Sójový perkelt, těstoviny, zbývá porcí: 0\n' +
                            '5. Losos po mlynářsku, grilovaná zelenina, zbývá porcí: 0\n' +
                            '6. Holandský řízek, opékané brambory, zbývá porcí: 2'
                    }
                );
                done();
            })
            .catch((e) => done(e));
    });
});
