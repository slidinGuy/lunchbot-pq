'use strict'

const cheerio = require('cheerio');
const moment = require('moment');

function parseData(html) {
  const $ = cheerio.load(html);
  let message = [];
  let portions = $('td.TdAltNazev + td').text()
  $('td.TdAltNazev').each(function(i, el) {
      message.push(`${i}. ${$(this).text()}, zbývá porcí: ${portions[i-1]}`);
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
