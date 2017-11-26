'use strict';

const utils = require('./utils');

function getData(restaurant) {
    return utils.getData(restaurant.url);
};

module.exports = getData;
