'use strict';

const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');

class MenuChecker {
    constructor(settings) {
        this.tokens = {
            fb: settings.fb_token,
            zomato: settings.zomato_token,
        };
    }
    
    getMenu(restaurant) {
        return this.getRestaurantData(restaurant)
            .then((data) => this.parseRestaurantData(restaurant.type, data));
    }

    getRestaurantData(restaurant) {
        try {
            const getter = require(`./getters/${restaurant.sourceType}`);
            return getter(restaurant, this.tokens);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    getRestaurantWebUrl (restaurant) {
        switch (restaurant.sourceType) {
            case 'web': return restaurant.url;
            case 'fb': return `https://www.facebook.com/${restaurant.fbId}`;
        }
    }

    parseRestaurantData (restaurantType, data) {
        const today = moment();
        const parser = require(`./parsers/${restaurantType}`);
        return parser(data, today);
    }
}

module.exports = MenuChecker;