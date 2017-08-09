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
    this.zomato_token = settings.zomato_token;
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
    const restaurants = [
      //Ova
      'basta', 'jarosi', 'kovork',
      //NJ
      'daniela'
    ];
    for (var restaurant_name of restaurants) {
      if(message.text.indexOf(`:${restaurant_name}:`) > -1){
        self._getMenu(restaurant_name).then(function(menu){
          self._replyToMessage(message, menu);
        }).catch(function(e){
          console.log(e);
        });
      }
    }
  }

  _replyToMessage(originalMessage, response){
    this.postMessage(originalMessage.channel, response, { as_user: true })
  }

  _getMenu(restaurant_name){
    var self = this;
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
                    menu += $(this).text().replace(/\s+/g, ' ').trim();
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
              var days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
              var today = moment().day() - 1;
              var found = 0;
              var menu = "";
              $('tr').each(function(i, el){
                let text = $(this).text().replace(/\n/g, '').replace(/\s+/g, ' ').trim();
                if(found == 0 && text.indexOf(days[today]) == 0){
                  found = 1
                  menu = "Jarosi: \n ```";
                  menu += text.trim();
                } else if (found > 0){
                  if(text.indexOf(days[today+1]) > -1 || found > 5){
                    return;
                  } else {
                    menu += '\n';
                    menu += text;
                    found++;
                  }
                }
              });
              if (found > 0){
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
        url = `https://graph.facebook.com/v2.10/kavarnakovork/feed?access_token=${self.fb_token}`;
        return new Promise(function(resolve, reject) {
          request(url, function(e, r, html){
            if(!e){
              var menu = "Sorry, I couldn't find menu for today.";
              var json = JSON.parse(html);
              if(json.data){
                for( var i = 0; i < 7; i++){
                  var text = decodeURIComponent(json.data[i].message);
                  if (text.indexOf(moment().format('D.M.YYYY')) > -1){
                    menu = "Kovork: \n ```"
                    menu += text.replace(/\n\n/g, '\n');
                    menu += '```';
                  }
                }
              }
              resolve(menu);
            }else{
              reject(e);
            }
          });
        });
      case 'daniela':
        url = 'https://developers.zomato.com/api/v2.1/dailymenu?res_id=16513150';
        return new Promise(function(resolve, reject) {  
          request({
            url: url,
            headers: { 'user_key' : self.zomato_token }
          }, function(e, r, html){
            if(!e){
              var json = JSON.parse(html);
              var menu = "Sorry, I couldn't find menu for today.";
              if(json['daily_menus']){
                for (var daily_menu of json['daily_menus']){
                  if(moment().isSame(daily_menu['daily_menu']['start_date'], 'day')){
                      menu = "Daniela:\n ```";
                      for(var dish of daily_menu['daily_menu']['dishes']){
                        menu += dish['dish']['name'];
                        menu += '\n';
                      }
                      menu += '```';
                  }
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