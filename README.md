# lunchbot-pq
Simple bot for Slack to inform teams about restaurants' daily menus.

## To run:
To run the bot, you need to have three ENV variables set:

* The API key for your slack bot <your-team>.slack.com/services/new/bot
* Facebook access token in the form of <AppID>|<AppSecret>
* Zomato API key [developers.zomato.com/api](https://developers.zomato.com/api)

```bash
npm install
export BOT_API_KEY=<Your Slack bot API key>
export FB_API_KEY=<Your Facebook access token>
export ZOMATO_API_KEY=<Your Zomato.com API key>
npm start
```
