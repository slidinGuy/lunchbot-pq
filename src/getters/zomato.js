'use strict';

const utils = require('./utils');

function getData(restaurant, tokens) {
    return utils.getData(
        `https://developers.zomato.com/api/v2.1/dailymenu?res_id=${restaurant.id}`,
        {
            headers: {
                'user_key': tokens.zomato
            }
        }
    );
};

module.exports = getData;
