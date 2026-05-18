const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class StatsEmitter extends EventEmitter {}

const statsEmitter = new StatsEmitter();
const statsFilePath = path.join(__dirname, '..', 'stats.json');

statsEmitter.on('requestCompleted', (data) => {
    let currentLogs = [];

    if (fs.existsSync(statsFilePath)) {
        try {
            const fileContent = fs.readFileSync(statsFilePath, 'utf8');
            currentLogs = JSON.parse(fileContent || '[]');
        } catch (e) {
            currentLogs = [];
        }
    }

    currentLogs.push(data);
    fs.writeFileSync(statsFilePath, JSON.stringify(currentLogs, null, 2));
    console.log(`[Stats] Data saved for ${data.path}`);
});

module.exports = statsEmitter;
