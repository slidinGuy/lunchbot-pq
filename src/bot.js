'use strict';

const util = require('util');
const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const Bot = require('slackbots');

// Restaurants definition
const restaurants = require('./restaurants.json');

class LunchBot extends Bot {
    constructor(settings) {
        super(settings);
        this.name = 'lunchbot';
        this.user = null;
        this.fb_token = settings.fb_token;
        this.zomato_token = settings.zomato_token;
    }

    handleOnStart() {
        const myName = this.name;
        this.user = this.users.filter(
            (user) => user.name === myName
        )[0];
    }

    handleOnMessage(message) {
        if (this.isChannelMessage(message) &&
            !this.isFromLunchBot(message)) {
            this.checkMessageContent(message);
        }
    }

    isChannelMessage(message) {
        return (message.type === 'message') &&
            Boolean(message) &&
            (typeof (message.channel) === 'string') && ['C', 'G', 'D'].includes(message.channel[0]);
    }

    isFromLunchBot(message) {
        return message.user === this.user.id;
    }

    checkMessageContent(message) {
        restaurants.map((restaurant) => {
            const restaurant_name = restaurant.keyWord;
            if (message.text && message.text.indexOf(`:${restaurant_name}:`) > -1) {
                this.getMenu(restaurant)
                    .then((menu) => this.createResponse(restaurant, menu))
                    .then((response) => this.replyToMessage(message, response))
                    .catch((e) => {
                        console.log(e);
                    });
            }
        });
    }

    createResponse(restaurant, menu) {
        if (menu) {
            return `${restaurant.response} \n\`\`\`${menu}\`\`\``;
        } else {
            return `${restaurant.response} Sorry, I couldn't find menu for today.`;
        }
    }

    replyToMessage(originalMessage, response) {
        this.postMessage(originalMessage.channel, response, {
            as_user: true
        })
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

module.exports = LunchBot;