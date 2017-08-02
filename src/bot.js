'use strict';

const util = require('util');
const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const Bot = require('slackbots');

class LunchBot extends Bot {
  constructor(settings){
    super(settings);
    this.name = 'lunchbot';
    this.user = null;
    this.fb_token = settings.fb_token;
  }
  handleOnStart() {
    var self = this;
    this.user = this.users.filter(function (user) {
      return user.name === self.name;
    })[0];
  }
  handleOnMessage(message){
    if (this._isChannelMessage(message) &&
        !this._isFromLunchBot(message))
    {
      this._checkMessageContent(message);
    }
  }
  _isChannelMessage(message){
    return (message.type === 'message') &&
           Boolean(message) &&
           (typeof(message.channel) === 'string') &&
           (message.channel[0] === 'C' || message.channel[0] === 'G');
  }
  _isFromLunchBot(message){
    return message.user === this.user.id;
  }
  _checkMessageContent(message){
    const self = this;
    if(message.text.indexOf(':basta:') > -1){
      self._getMenu('basta').then(function(menu){
        self._replyToMessage(message, menu);
      }).catch(function(e){
        console.log(e);
      });
    }
    if(message.text.indexOf(':jarosi:') > -1){
      self._getMenu('jarosi').then(function(menu){
        self._replyToMessage(message, menu);
      }).catch(function(e){
        console.log(e);
      });
    }
    if(message.text.indexOf(':kovork:') > -1){
      self._getMenu('kovork').then(function(menu){
        self._replyToMessage(message, menu);
      }).catch(function(e){
        console.log(e);
      });
    }
  }
  _replyToMessage(originalMessage, response){
    // const channel = this._getChannelById(originalMessage.channel);
    this.postMessage(originalMessage.channel, response, { as_user: true })
  }
  _getChannelById(channelId){
    return this.channels.filter(function (item) {
      return item.id === channelId;
    })[0];
  }
  _getMenu(restaurant_name){
    var url;
    switch (restaurant_name) {
      case 'basta':
        url = 'http://www.pustkoveckabasta.cz/denni-menu/';
        return new Promise(function(resolve, reject) {
          request(url, function(e, r, html){
            if(!e){
              const $ = cheerio.load(html);
              var menu = "Sorry, I couldn't find menu for today.";
              $('.title').each(function(){
                if($(this).text().indexOf(moment().format('D. MM. YYYY')) > -1){
                  menu = "Basta: \n ```";
                  $(this).siblings().each(function(){
                    menu += $(this).text().trim();
                    menu += "\n";
                  });
                  menu += '```';
                }
              });
              resolve(menu);
            }else{
              reject(e);
            }
          });
        });
      case 'jarosi':
        url = 'http://www.ujarosu.cz/cz/denni-menu/';
        return new Promise(function(resolve, reject) {
          request(url, function(e, r, html){
            if(!e){
              const $ = cheerio.load(html);
              var days = ["Pondělí", "Úterý", "Středa", "Čtrvtek", "Pátek"];
              var today = moment().day();
              var index = today * 6;
              var menu = $(`tbody tr:nth-child(${index})`).text().replace(/\n/g, '');
              if (menu.indexOf(days[today - 1]) > -1){
                menu = "Jarosi: \n ```" + menu.trim();
                for(var i = 1; i<6; i++){
                  menu += "\n";
                  menu += $(`tbody tr:nth-child(${index + i})`).text().replace(/\n/g, '').trim();
                }
                menu += '```';
              }else{
                menu = "Sorry, I couldn't find menu for today.";
              }
              resolve(menu);
            }else{
              reject(e);
            }
          });
        });
      case 'kovork':
        url = `https://graph.facebook.com/v2.10/kavarnakovork/feed?access_token=${this.fb_token}`;
        return new Promise(function(resolve, reject) {
          request(url, function(e, r, html){
            if(!e){
              var menu = "Sorry, I couldn't find menu for today.";
              var json = JSON.parse(html);
              for( var i = 0; i < 7; i++){
                var text = decodeURIComponent(json.data[i].message);
                if (text.indexOf(moment().format('D.M.YYYY')) > -1){
                  menu = "Kovork: \n ```"
                  menu += text.replace(/\n\n/g, '\n');
                  menu += '```';
                }
              }
              resolve(menu);
            }else{
              reject(e);
            }
          });
        });
    }
  }
}

module.exports = LunchBot;