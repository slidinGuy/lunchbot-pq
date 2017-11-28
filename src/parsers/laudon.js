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
    let message = text.slice(mb, me);
    // Remove line with next menu
    if (me > 0) {
        message = message.slice(0, message.lastIndexOf('\n'));
    }
    return {
        found: (message.length > 0),
        message
    };
}

module.exports = parseData;
