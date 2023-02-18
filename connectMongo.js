const MongoClient = require("mongodb").MongoClient;

let db = null;

async function connect(url, databaseName) {
    let client = await MongoClient.connect(url, {
        useUnifiedTopology: true
    })
    // set the selected database
    db = client.db(databaseName);
}

function getDB() {
    return db;
}

// share the connect and getDB functions with other JS files
module.exports = { connect, getDB }
