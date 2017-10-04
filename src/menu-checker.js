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
        return this.getRestaurantData(restaurant)
            .then((data) => this.parseRestaurantData(restaurant.type, data));
    }

    createZomatoUrl(id) {
        return `https://developers.zomato.com/api/v2.1/dailymenu?res_id=${id}`;
    }

    getRestaurantData(restaurant) {
        switch (restaurant.sourceType) {
            case 'web': return this.getData(restaurant.url);
            case 'fb': {
                const url =  `${restaurant.url}?access_token=${this.fb_token}`;
                return this.getData(url)
            }
            case 'zomato': {
                const url = this.createZomatoUrl(restaurant.id);
                return this.getData(url,
                    {
                        headers: {
                            'user_key': this.zomato_token
                        }
                    });
            };
        }
    }

    parseRestaurantData (restaurantType, data) {
        switch (restaurantType) {
            case 'basta': return this.parseBasta(data);
            case 'jarosi': return this.parseJarosi(data);
            case 'kovork': return this.parseKovork(data);
            case 'zomato': return this.parseZomato(data);
        };
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

    parseBasta(html) {
        const $ = cheerio.load(html);
        let menu = [];
        $('.daily-item.today li').each(function () {
            menu.push($(this).text().replace(/\s+/g, ' ').trim());
        });
        return menu.join("\n");
    }

    parseJarosi(html) {
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
    }

    parseKovork(html) {
        const json = JSON.parse(html);
        if (json.data) {
            let menu = "";
            for (let i = 0; i < 7; i++) {
                const text = decodeURIComponent(json.data[i].message);
                if (text.includes(moment().format('D.M.YYYY'))) {
                    menu += text.replace(/\n\n/g, '\n');
                }
            }
            return  menu;
        }
    }

    parseZomato(html) {
        const json = JSON.parse(html);
        if (json.daily_menus) {
            let menu = [];
            json.daily_menus.forEach(({daily_menu}) => {
                if (moment().isSame(daily_menu.start_date, 'day') &&
                    daily_menu.end_date !== undefined) {
                    menu = daily_menu.dishes.map(({dish}) =>
                        `${dish.name}   ${dish.price}`
                    );
                }
            });
            return menu.join("\n");
        }      
    }
}

module.exports = MenuChecker;