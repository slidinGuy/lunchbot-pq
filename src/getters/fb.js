'use strict';

const utils = require('./utils');

function getData(restaurant, tokens) {
    const url = `https://graph.facebook.com/v2.10/${restaurant.fbId}/feed?fields=attachments,message&access_token=${tokens.fb}`;
    return utils.getData(url);
};

module.exports = getData;
