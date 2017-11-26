'use strict'

const cheerio = require('cheerio');

function parseData(html) {
    const $ = cheerio.load(html);
    let menu = [];
    $('.daily-item.today li').each(function () {
        menu.push($(this).text().replace(/\s+/g, ' ').trim());
    });
    return menu.join("\n");
}

module.exports = parseData;
