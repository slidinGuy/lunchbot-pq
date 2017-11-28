'use strict'

const cheerio = require('cheerio');
const moment = require('moment');

function parseData(html, date) {
    const $ = cheerio.load(html);
    const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
    const today = date.day() - 1;
    let message = [];
    $('tr').each(function (i, el) {
        let text = $(this).text().replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        if (!message.length && text.indexOf(days[today]) == 0) {
            message.push(text.trim());
        } else if (message.length) {
            if (text.indexOf(days[today + 1]) > -1 || message.length > 5) {
                return;
            } else {
                message.push(text);
            }
        }
    });
    return {
        found: (message.length > 0),
        message: message.join("\n")
    };
}

module.exports = parseData;
