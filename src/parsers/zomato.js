'use strict'

const moment = require('moment');

function parseData(html, date) {
    const json = JSON.parse(html);
    if (json.daily_menus) {
        let menu = [];
        json.daily_menus.forEach(({daily_menu}) => {
            if (date.isSame(daily_menu.start_date, 'day') &&
                daily_menu.end_date !== undefined) {
                menu = daily_menu.dishes.map(({dish}) =>
                    `${dish.name}   ${dish.price}`
                );
            }
        });
        return menu.join("\n");
    }      
}

module.exports = parseData;
