'use strict'

const cheerio = require('cheerio');
const moment = require('moment');

function parseData(html, date) {
    const $ = cheerio.load(html);
    const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
    const today = date.day() - 1;
    let menu = [];
    $('tr').each(function (i, el) {
        let text = $(this).text().replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        if (!menu.length && text.indexOf(days[today]) == 0) {
            menu.push(text.trim());
        } else if (menu.length) {
            if (text.indexOf(days[today + 1]) > -1 || menu.length > 5) {
                return;
            } else {
                menu.push(text);
            }
        }
    });
    if (menu.length) {
        return menu.join("\n");
    }
}

module.exports = parseData;
