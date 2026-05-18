const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://soninartur_db_user:56756727127ger@ac-qtl7da0-shard-00-00.tf0fgiz.mongodb.net:27017,ac-qtl7da0-shard-00-01.tf0fgiz.mongodb.net:27017,ac-qtl7da0-shard-00-02.tf0fgiz.mongodb.net:27017/Lab4?ssl=true&replicaSet=atlas-srbnwr-shard-0&authSource=admin&appName=Cluster0';

function connectToDatabase() {
    if (mongoose.connection.readyState !== 0) {
        return mongoose.connection.asPromise();
    }

    return mongoose.connect(MONGO_URI)
        .then(() => {
            if (process.env.NODE_ENV !== 'test') {
                console.log('УСПІХ! База підключена');
            }
        })
        .catch(err => console.error('Помилка:', err.message));
}

module.exports = connectToDatabase;
