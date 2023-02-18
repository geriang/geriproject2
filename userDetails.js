const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;


async function getUserDetails() {
    const db = connectMongo.getDB()
    const result = await db.collection("user_details").find().limit(10).toArray();
    return result

}

async function postUserDetails(ceaNo, mobile, email, username, password, first, last, timestamp) {

    const db = connectMongo.getDB();
    await db.collection("user_details").insertOne({

        "ceaNo": ceaNo,
        "contact": { 'mobile': mobile, 'email': email },
        "login": { 'username': username, 'password': password },
        "name": { 'first': first, 'last': last },
        'created': timestamp

    });

};

async function putUserDetails(id, ceaNo, mobile, email, username, password, first, last, timestamp) {

    const db = connectMongo.getDB();
    await db.collection("user_details").updateOne({
        "_id": new ObjectId(id)
    }, {
        '$set': {
            'ceaNo': ceaNo,
            'contact': { 'mobile': mobile, 'email': email },
            'login': { 'username': username, 'password': password },
            'name': { 'first': first, 'last': last },
            'created': timestamp
        }
    });
}

async function deleteUserDetails(id) {

    const db = connectMongo.getDB();
    await db.collection("user_details").deleteOne({
        "_id": new ObjectId(id)
    });
}

module.exports = { getUserDetails, postUserDetails, putUserDetails, deleteUserDetails }