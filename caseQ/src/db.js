const mysql = require('mysql');
const bluebird = require('bluebird');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'question'
})

// 抓取錯誤
db.on('error', (error) => {
    console.log('error:', error);
});

db.connect();
bluebird.promisifyAll(db);

module.exports = db;