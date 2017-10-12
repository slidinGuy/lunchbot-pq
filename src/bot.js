'use strict';

const Bot = require('slackbots');
const botSettings = require('./bot-settings');
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
        let text = message.text;
        if (!text){
            // Nothing to check
            return;
        }

        // Get message channel info
        const channel = this.getChannel(message);

        // Check command
        text = this.checkCommandAndApplyDefaults(text, channel);

        if (!text){
            // Nothing to contine with
            return;
        }

        // Ignore list
        text = this.applyIgnoreList(text, channel);

        restaurants.map((restaurant) => {
            let keyWords = restaurant.keyWords.map((k) => `:${k}:`);
            if (botSettings.useSimpeKeyWordWithCommand && botSettings.command){
                keyWords = keyWords.concat(restaurant.keyWords); 
            }
            if (keyWords.some((kw) => new RegExp(`\\b${kw}\\b`,"i").test(text))) {
                this.processMessage(message, restaurant);
            }
        });
    }

    getChannel(message) {
        return this.channels.find(ch => ch.id === message.channel);
    }    

    checkCommandAndApplyDefaults(text, channel) {
        if (botSettings.command || botSettings.useBotNameAsCommand) {
            if (botSettings.command && text.startsWith(botSettings.command)) {
                text = text.slice(botSettings.command.length, text.length).trim();
            } else if (botSettings.useBotNameAsCommand && text.startsWith(`<@${this.user.id}>`)) {
                text = text.slice(this.user.id.length + 3, text.length).trim();
            } else {
                // Command or name are defined but message is not starting with it
                return;
            }

            // when text is empty, try to find default value for channel
            if (!text && channel && botSettings.channelDefault) {
                text = botSettings.channelDefault[channel.name];
            }
        }
        return text;
    }

    applyIgnoreList(text, channel) {
        if (channel && botSettings.channelIgnore) {
            const ignoreList = botSettings.channelIgnore[channel.name];
            if (ignoreList) {
                ignoreList.forEach((ignore) => {
                    text = text.replace(new RegExp(`\\b${ignore}\\b`, 'ig'), "");
                });
            }
        }
        return text;
    }

    processMessage(message, restaurant) {
        const threadId = this.getThreadId(message);
        this.replyToMessage(message, restaurant, threadId)
            .then((msg) => {
                this.menuChecker.getMenu(restaurant)
                    .then((menu) => this.createResponse(restaurant, menu, threadId))
                    .then((response) => this.updateBotMessage(msg, response))
                    .catch((e) => {
                        this.updateBotMessage(
                            msg,
                            this.createErrorResponse(restaurant, e.message, threadId));
                        console.log(e);
                    });
            });
    }

    createResponse(restaurant, menu, threadId) {
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
                    title_link: this.menuChecker.getRestaurantWebUrl(restaurant),
                    text: message
                }
            ],
            thread_ts: threadId,
            as_user: false
        };
    }

    createErrorResponse(restaurant, error, threadId) {
        return {
            attachments: [
                {
                    fallback: restaurant.response,
                    color: 'danger',
                    title: restaurant.response,
                    title_link: this.menuChecker.getRestaurantWebUrl(restaurant),
                    text: `Error: ${error}`
                }
            ],
            thread_ts: threadId,
            as_user: false
        };
    }

    createResponseHolder(restaurant, threadId) {
        return {
            attachments: [
                {
                    fallback: restaurant.response,
                    title: restaurant.response,
                    title_link: this.menuChecker.getRestaurantWebUrl(restaurant),
                    text: "Getting menu...",
                }
            ],
            thread_ts: threadId,
            as_user: false
        };
    }

    getThreadId(message) {
        if (botSettings.replyInThread) {
            if (Array.isArray(botSettings.replyInThread)) {
                const channel = this.getChannel(message);
                if (channel && botSettings.replyInThread.includes(channel.name)) {
                    return message.ts;
                }
            } else { 
                return message.ts;
            }
        }
    }

    replyToMessage(originalMessage, restaurant, threadId) {
        return this.postMessage(originalMessage.channel, '', this.createResponseHolder(restaurant, threadId));
    }

    updateBotMessage(message, response) {
        this.updateMessage(message.channel, message.ts, '', response);
    }
}

module.exports = LunchBot;