'use strict'

const cheerio = require('cheerio');
const moment = require('moment');

function parseData(html, date) {
    const $ = cheerio.load(html);
    const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
    const today = date.day() - 1;
    const todayName = days[today];
    let text = "";
    $('div.text-tab-content').each(function () {
        text += $(this).text().replace(/\t+/g, '').trim() + '\n';
    });
    // Remove spaces
    text = text.split('\n').map((l) => l.trim()).join('\n');
    // Remove empty lines
    text = text.replace(/^\s*[\r\n]/gm, '');
    const mb = text.indexOf(todayName);
    const me = text.indexOf(':\n', mb + todayName.length + 1);
    let menu = text.slice(mb, me);
    // Remove line with next menu
    if(me > 0) {
        menu = menu.slice(0, menu.lastIndexOf('\n'));
    }
    return menu;
}

module.exports = parseData;
