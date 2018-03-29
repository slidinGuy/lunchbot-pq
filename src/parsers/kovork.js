'use strict'

const moment = require('moment');

function parseData(html, date) {
    const json = JSON.parse(html);
    let menu = {
        found: false
    }
    if (json.data) {
        let message = "";
        for (let i = 0; i < 7; i++) {
            const text = json.data[i].message;
            if (text.includes(date.format('D.M.')) || text.includes(date.format('D. M.'))) {
                message += text.replace(/\n\n/g, '\n');
            }
        }
        menu = {
            found: (message.length > 0),
            message
        };
    }
    return menu;
}

module.exports = parseData;
