const express = require('express');
const cors = require('cors')
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;

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


// FOR DEMONSTRATION WITH THE SAMPLE_AIRBNB database
app.get('/', async function (req, res) {
    // eqv: db.collection('listings_and_reviews').find().limit(10);
    const listings = await db.collection("user_details").find().limit(10).toArray();
    // if we use res.send and the first parameter is a JavaScript object or array, Express will automatically send back JSON
    res.status(200); // indicate later when we send, we want the status code to be 200
    res.send(listings);  // a normal res.send or res.render by default is status code 200
})
}
// app.get('/', function(req,res){
//     res.send("Hello World")
// })

main()

app.listen(5000, function () {
    console.log("app started")
})

app.post("/user_details", async function(req, res) {
    let userId = req.body.description;
    let ceaNo = req.body.food;
    let datetime = new Date(req.body.datetime) || new Date();

    try{
        let result = await db.collection("user_details").insertOne({

              userId : "0000001",
              ceaNo : "R006232H",
              contact : {
                mobile : "84430486",
                email: "geriang@huttonsgroup.com"
              },
               login : {
                "username": "jery",
                "password": "password1!"
              },
              name : {
                "first": "Geri",
                "last": "Ang"
              },
              created: {
                "$timestamp": {
                  "t": 0,
                  "i": 0
                }
              }
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