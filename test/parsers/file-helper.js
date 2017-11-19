const fs = require('fs');

const loadData = (fileName, test) => {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

module.exports = {
    loadData
};
