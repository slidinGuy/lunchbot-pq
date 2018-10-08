'use strict'

const cheerio = require('cheerio');
const moment = require('moment');

function parseData(html) {
  const $ = cheerio.load(html);
  let message = [];
  $('td.TdAltNazev').each(function(i, el) {
      message.push($(this).text());
  })
  message.shift();
  if (message[message.length-1].includes("/výdej u oběda/")) {
    message.pop();
  }
  return {
    found: (message.length > 0),
    message: message.join("\n")
  };
}

module.exports = parseData;
