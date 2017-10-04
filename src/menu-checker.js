'use strict';

const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');

class MenuChecker {
    constructor(settings) {
        this.fb_token = settings.fb_token;
        this.zomato_token = settings.zomato_token;
    }
    
    getMenu(restaurant) {
        switch (restaurant.type) {
            case 'basta': return this.getBasta(restaurant);
            case 'jarosi': return this.getJarosi(restaurant);
            case 'kovork': return this.getKovork(restaurant);
            case 'zomato': return this.getZomato(restaurant);
        }
    }

    getData (url, options) {
        return new Promise(function (resolve, reject) {
            request(Object.assign({url}, options),
                function (error, response, body) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(body);
                    }
                }
            );
        });
    }

    getBasta(restaurant) {
        return this.getData(restaurant.url)
            .then((html) => {
                const $ = cheerio.load(html);
                let menu = [];
                $('.daily-item.today li').each(function () {
                    menu.push($(this).text().replace(/\s+/g, ' ').trim());
                });
                return menu.join("\n");
            });
    }

    getJarosi(restaurant) {
        return this.getData(restaurant.url)
            .then((html) => {
                const $ = cheerio.load(html);
                const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
                const today = moment().day() - 1;
                let menu = [];
                $('tr').each(function (i, el) {
                    let text = $(this).text().replace(/\n/g, '').replace(/\s+/g, ' ').trim();
                    if (!menu.length && text.indexOf(days[today]) == 0) {
                        menu.push(text.trim());
                    } else if (menu.length) {
                        if (text.indexOf(days[today + 1]) > -1 || menu.length > 5) {
                            return;
                        } else {
                            menu.push(text);
                        }
                    }
                });
                if (menu.length) {
                    return menu.join("\n");
                }
            });
    }

    getKovork(restaurant) {
        const url =  `${restaurant.url}?access_token=${this.fb_token}`;
        return this.getData(url)
            .then((html) => {
                var json = JSON.parse(html);
                if (json.data) {
                    let menu = "";
                    for (var i = 0; i < 7; i++) {
                        var text = decodeURIComponent(json.data[i].message);
                        if (text.indexOf(moment().format('D.M.YYYY')) > -1) {
                            menu += text.replace(/\n\n/g, '\n');
                        }
                    }
                    return  menu;
                }
            });
    }

    createZomatoUrl(id) {
        return `https://developers.zomato.com/api/v2.1/dailymenu?res_id=${id}`;
    }

    getZomato(restaurant) {
        const self = this;
        const url = this.createZomatoUrl(restaurant.id);
        return this.getData(url,
            {
                headers: {
                    'user_key': self.zomato_token
                }
            })
            .then((html) => {
                var json = JSON.parse(html);
                if (json['daily_menus']) {
                    let menu = [];
                    for (var daily_menu of json['daily_menus']) {
                        if (moment().isSame(daily_menu['daily_menu']['start_date'], 'day') &&
                            daily_menu['daily_menu']['end_date'] !== undefined) {
                            for (var dish of daily_menu['daily_menu']['dishes']) {
                                menu.push(dish['dish']['name']);
                            }
                        }
                    }
                    return menu.join("\n");
                }
            });
    }
}

module.exports = MenuChecker;