const path = require('path');

exports.homePage = (req, res) => {
    res.sendFile(path.dirname(__dirname + '../') + '/templates/home.html');
}