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
        return message &&
            (message.type === 'message') &&
            (typeof (message.channel) === 'string') &&
            ['C', 'G', 'D'].includes(message.channel[0]);
   }

    isFromLunchBot(message) {
        return message.user === this.user.id;
    }

    checkMessageContent(message) {
        restaurants.map((restaurant) => {
            const keyWords = restaurant.keyWords.map((k) => `:${k}:`);
            if (message.text && keyWords.some((kw) => message.text.includes(kw))) {
                this.replyToMessage(message, restaurant)
                    .then((msg) => {
                        this.menuChecker.getMenu(restaurant)
                            .then((menu) => this.createResponse(restaurant, menu))
                            .then((response) => this.updateBotMessage(msg, response))
                            .catch((e) => {
                                this.updateBotMessage(
                                    msg,
                                    this.createErrorResponse(restaurant, e.message));
                                console.log(e);
                            });
                    });
            }
        });
    }

    createResponse(restaurant, menu) {
        let message = menu;
        if (!menu) {
            message = "Sorry, I couldn't find menu for today.";
        }

        return {
            attachments: [
                {
                    fallback: restaurant.response,
                    color: menu ? 'good' : 'warning',
                    title: restaurant.response,
                    title_link: restaurant.sourceType === 'web' ? restaurant.url : '',
                    text: message
                }
            ],
            as_user: false
        };
    }

    createErrorResponse(restaurant, error) {
        return {
            attachments: [
                {
                    fallback: restaurant.response,
                    color: 'danger',
                    title: restaurant.response,
                    title_link: restaurant.sourceType === 'web' ? restaurant.url : '',
                    text: `Error: ${error}`
                }
            ],
            as_user: false
        };
    }

    createResponseHolder(restaurant) {
        return {
            attachments: [
                {
                    fallback: restaurant.response,
                    title: restaurant.response,
                    title_link: restaurant.sourceType === 'web' ? restaurant.url : '',
                    text: "Getting menu..."
                }
            ],
            as_user: false
        };
    }

    replyToMessage(originalMessage, restaurant) {
        return this.postMessage(originalMessage.channel, '', this.createResponseHolder(restaurant));
    }

    updateBotMessage(message, response) {
        this.updateMessage(message.channel, message.ts, '', response);
    }
}

module.exports = LunchBot;