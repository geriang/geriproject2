const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;

async function listingDetails() {
    await connectMongo.connect(mongoUri, "project")

    // GET
    app.get('/', async function (req, res) {
        const db = connectMongo.getDB();
        const listings = await db.collection("listing_details").find().limit(10).toArray();
        res.status(200);
        res.send(listings);
    })

    // POST
    app.post("/listing_details", async function (req, res) {
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
            const db = connectMongo.getDB();
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
            let { userId, ceaNo, mobile, email, username, password, first, last } = req.body;
            let timestamp = new Date().toISOString()

            const db = connectMongo.getDB()
            let result = await db.collection("user_details").updateOne({
                "_id": new ObjectId(req.params.id)
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
            "_id": new ObjectId(req.params.id)
        });
        res.status(200);
        res.send({
            message: "OK"
        });
    });

}


module.exports = { listingDetails }