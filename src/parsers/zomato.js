'use strict'

const moment = require('moment');

function parseData(html, date) {
    const json = JSON.parse(html);
    let menu = {
        found: false
    };
    if (json.daily_menus) {
        let text = [];
        json.daily_menus.forEach(({ daily_menu }) => {
            if (date.isSame(daily_menu.start_date, 'day') &&
                daily_menu.end_date) {
                text = daily_menu.dishes.map(({ dish }) =>
                    `${dish.name}   ${dish.price}`
                );
            }
        });
        menu = {
            found: (text.length > 0),
            message: text.join("\n")
        };
    }
    return menu;
}

module.exports = parseData;
