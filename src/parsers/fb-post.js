'use strict'

const moment = require('moment');

function parseData(html, date) {
    const json = JSON.parse(html);
    if (json.data) {
        let menu = "";
        for (let i = 0; i < 7; i++) {
            const text = json.data[i].message;
            if (text.includes(date.format('D.M.YYYY'))) {
                menu += text.replace(/\n\n/g, '\n');
            }
        }
        return  menu;
    }
}

module.exports = parseData;
