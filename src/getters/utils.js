'use strict'

const request = require('request');

function getData(url, options) {
    return new Promise(function (resolve, reject) {
        request(Object.assign({url}, options),
            function (error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    resolve(body);
                }
            }
        );
    });
}

module.exports = {
    getData
};
