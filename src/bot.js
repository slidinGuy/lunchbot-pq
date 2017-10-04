'use strict';

const Bot = require('slackbots');
const MenuChecker = require('./menu-checker');

// Restaurants definition
const restaurants = require('./restaurants.json');

class LunchBot extends Bot {
    constructor(settings) {
        super(settings);
        this.name = 'lunchbot';
        this.user = null;
        this.menuChecker = new MenuChecker({
            fb_token: settings.fb_token,
            zomato_token: settings.zomato_token
        });
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
            const keyWords = restaurant.keyWords.map((k) => `:${k}:`);
            if (message.text && keyWords.some((kw) => message.text.includes(kw))) {
                this.menuChecker.getMenu(restaurant)
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
}

module.exports = LunchBot;