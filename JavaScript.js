const app = require('./app');

if (require.main === module) {
    require('./bin/www');
}
module.exports = app;
