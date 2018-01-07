const assert = require('assert');
const fileHelper = require('./file-helper');
const moment = require('moment');
const parseData = require('../../src/parsers/jarosi');

describe('Test parsers - Jarosi', () => {
    it('Parse Jarosi', (done) => {
        fileHelper.loadData('./test/data/jarosi.html')
            .then((html) => {
                const testDate = moment('23.10.2017', 'DD.MM.YYYY');
                const menu = parseData(html, testDate);
                assert.deepEqual(menu,
                    {
                        found: true,
                        message: 'Pondělí : Rajská s rýží\n' +
                            '1. 120g Kuřecí plátek s restovanýma paprikama a pórkem, americké brambory, ďábelka 99 .-\n' +
                            '2. 350g Salát CÉZAR s mozzarellou a rajčaty, bylinková bagetka 99 .-\n' +
                            '3. 150g V. panenka plněná kuřecím masem,sýrem a špenátem,sýrová om. mačkané br. 109 ,-\n' +
                            '4. 130g ROŠTĚNÁ NA ROŠTU S HOŘČICOVOU KŮRČIČKOU, VÍDEŇSKÁ CIBULKA 156 ,-\n' +
                            'HRANOLKY, SÁZENÉ VEJCE, TATARKA'
                    }
                );
                done();
            })
            .catch((e) => done(e));
    });
});
