'use strict'

const cheerio = require('cheerio');

function parseData(html) {
    const $ = cheerio.load(html);
    let text = [];
    $('.daily-item.today li').each(function (i) {
        text.push(`${i+1}. ${$(this).text().replace(/\s+/g, ' ').trim()}`);
    });
    text = text.join("\n");
    return {
        found: (text.length > 0),
        message: text
    };
}

module.exports = parseData;
