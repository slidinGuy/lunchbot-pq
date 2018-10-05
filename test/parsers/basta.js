const assert = require('assert');
const fileHelper = require('./file-helper');
const moment = require('moment');
const parseData = require('../../src/parsers/basta');

describe('Test parsers - Basta', () => {
    it('Parse Basta', (done) => {
        fileHelper.loadData('./test/data/basta.html')
            .then((html) => {
                const menu = parseData(html);                
                assert.deepEqual(menu,
                    {
                        found: true,
                        message: 'Kmínová s vejcem 0,33 dl\nMořská štika na grilu, petrželové noky 124 Kč 150 g\n' + 
                        'Kuřecí CORDON BLUE, vídeňský bramborový salát 108 Kč 120 g\n' + 
                        'Domácí sekaná s bramborovou kaší, sterilovaný okurek 98 Kč 150 g\n' + 
                        'Listový salát se smaženým sýrem niva 98 Kč 400 g\n'
                    }
                );
                done();
            })
            .catch((e) => done(e));
    });
});
