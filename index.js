const express = require('express');
const cors = require('cors')
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId

const mongoUri = process.env.MONGO_URI;

const app = express();

app.use(express.json());

app.use(cors());

async function connect(uri, dbname) {
    let client = await MongoClient.connect(uri, {
        useUnifiedTopology: true
    })
    const db = client.db(dbname);
    return db
}

async function main() {
    const db = await connect(mongoUri, "project")


    // GET
    app.get('/', async function (req, res) {
        // eqv: db.collection('listings_and_reviews').find().limit(10);
        const listings = await db.collection("user_details").find().limit(10).toArray();
        // if we use res.send and the first parameter is a JavaScript object or array, Express will automatically send back JSON
        res.status(200); // indicate later when we send, we want the status code to be 200
        res.send(listings);  // a normal res.send or res.render by default is status code 200
    })

    // POST
    app.post("/user_details", async function (req, res) {
        let userId = req.body.userId;
        let ceaNo = req.body.ceaNo;
        let mobile = req.body.contact.mobile
        let email = req.body.contact.email
        let username = req.body.login.username
        let password = req.body.login.password
        let first = req.body.name.first
        let last = req.body.name.last
        let timestamp = new Date().toISOString()

        try {
            let result = await db.collection("user_details").insertOne({

                'userId': userId,
                'ceaNo': ceaNo,
                "contact": { 'mobile': mobile, 'email': email },
                "login": { 'username': username, 'password': password },
                "name": { 'first': first, 'last': last },
                'created': timestamp

            });
            res.status(200);
            res.send(result);
        } catch (e) {
            res.status(500);
            res.send({
                error: "Internal server error. Please contact administrator"
            });
            console.log(e);
        }
    });

    // PUT
    app.put("/user_details/:id", async function (req, res) {

        try {
            let userId = req.body.userId;
            let ceaNo = req.body.ceaNo;
            let mobile = req.body.contact.mobile
            let email = req.body.contact.email
            let username = req.body.login.username
            let password = req.body.login.password
            let first = req.body.name.first
            let last = req.body.name.last
            let timestamp = new Date().toISOString()

            let result = await db.collection("user_details").updateOne({
                '_id': ObjectId(req.params.id)
            }, {
                '$set': {

                    'userId': userId,
                    'ceaNo': ceaNo,
                    'contact': { 'mobile': mobile, 'email': email },
                    'login': { 'username': username, 'password': password },
                    'name': { 'first': first, 'last': last },
                    'created': timestamp

                }
            });

            res.status(200);
            res.send(result);

        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);

        }
    })
    // DELETE
    app.delete("/user_details/:id", async (req, res) => {
         await db.collection("user_details").deleteOne({
          "_id": ObjectId(req.params.id)
        });
        res.status(200);
        res.send({
          message: "OK"
        });
      });

}


main()

app.listen(5000, function () {
    console.log("app started")
})

