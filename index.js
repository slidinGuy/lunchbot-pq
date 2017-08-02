'use strict';

var LunchBot = require('./src/bot');

var token = process.env.BOT_API_KEY;
var fb_token = process.env.FB_API_KEY;

var lunch_bot = new LunchBot({
  token: token,
  fb_token: fb_token
});

lunch_bot.on('start', lunch_bot.handleOnStart);
lunch_bot.on('message', lunch_bot.handleOnMessage);