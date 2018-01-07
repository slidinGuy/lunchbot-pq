'use strict'

const moment = require('moment');

function parseData(html, date) {
    const json = JSON.parse(html);
    const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
    const today = date.day() - 1
    let menu = {
        found: false
    };
    if (json.data) {
        for (let i = 0; i < 7; i++) {
            const text = json.data[i].message;
            const attachments = json.data[i].attachments;
            if (text && attachments &&
                text.toLowerCase().includes(days[today].toLowerCase())) {
                menu = {
                    found: true,
                    image: attachments.data[0].media.image.src
                };
            }
        }
    }
    return menu;
}

module.exports = parseData;
