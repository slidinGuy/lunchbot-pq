const assert = require('assert');
const MenuChecker = require('../src/menu-checker');
const fs = require('fs');
const moment = require('moment');

describe('Test MenuChecker', () => {
    describe('Test parsers', () => {
        const loadData = (fileName, test) => {
            return new Promise((resolve, reject) => {
                fs.readFile(fileName, 'utf8', function (err, data) {
                    if (err) {
                        reject(err);
                    }
                    resolve(data);
                });
            });
        }

        menuChecker = new MenuChecker({
            fb_token: "123456789012345|abcd1abcd2abcd3abcd4abcd5abcd6abcd",
            zomato_token: "01234567890a1234567890a123456789"
        });

        it('Parse Zomato', (done) => {
            loadData('./test/data/zomato.html')
                .then((html) => {
                    const testDate = moment('23.10.2017', 'DD.MM.YYYY');
                    const menu = menuChecker.parseZomato(html, testDate);
                    assert.equal(menu,
                        'Polévka rýžová se zeleninou /Bezlepkové jídlo/   \n' +
                        '1. Cuketová omáčka, tofu, brambory   \n' +
                        '2. Hrachová kaše, tempeh, okurek, pečivo /Bezlepkové jídlo/   '
                    );
                    done();
                })
                .catch((e) => done(e));
        });

        it('Parse Jarosi', (done) => {
            loadData('./test/data/jarosi.html')
                .then((html) => {
                    const testDate = moment('23.10.2017', 'DD.MM.YYYY');
                    const menu = menuChecker.parseJarosi(html, testDate);
                    assert.equal(menu,
                        'Pondělí : Rajská s rýží\n' +
                        '1. 120g Kuřecí plátek s restovanýma paprikama a pórkem, americké brambory, ďábelka 99 .-\n' +
                        '2. 350g Salát CÉZAR s mozzarellou a rajčaty, bylinková bagetka 99 .-\n' +
                        '3. 150g V. panenka plněná kuřecím masem,sýrem a špenátem,sýrová om. mačkané br. 109 ,-\n' +
                        '4. 130g ROŠTĚNÁ NA ROŠTU S HOŘČICOVOU KŮRČIČKOU, VÍDEŇSKÁ CIBULKA 156 ,-\n' +
                        'HRANOLKY, SÁZENÉ VEJCE, TATARKA'
                    );
                    done();
                })
                .catch((e) => done(e));
        });

        it('Parse FB-post', (done) => {
            loadData('./test/data/fb-post.html')
                .then((html) => {
                    const testDate = moment('23.10.2017', 'DD.MM.YYYY');
                    const menu = menuChecker.parseFBPost(html, testDate);
                    assert.equal(menu,
                        'PONDĚLÍ 23.10.2017\n' +
                        'BROKOLICOVÝ KRÉM\n' +
                        'MEXICKÁ TORTILLA S KUŘECÍM MASEM (80G), SÝREM, RAJČATY, CIBULKOU A HOŘČIČNÝM DRESINGEM, SMAŽENÉ HRANOLKY A SALÁT COLESLAW\n' +
                        '119,- \n' +
                        'SMAŽENÝ SÝR (150G) S VAŘENÝM MLADÝM BRAMBŮRKEM S PETRŽELKOU, MAJONÉZA\n' +
                        '99,- \n' +
                        'UZENÝ HOVĚZÍ JAZYK (120G) S KŘENOVOU OMÁČKOU, HOUSKOVÝ KNEDLÍK\n' +
                        '99,-'
                    );
                    done();
                })
                .catch((e) => done(e));
        });
    });
});
