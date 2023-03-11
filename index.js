const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;
const userDetails = require('./userDetails');
const propertyDetails = require('./propertyDetails');
const listingDetails = require('./listingDetails');
const axios = require('axios');
const mongoUri = process.env.MONGO_URI;
const chatGptApikey = process.env.OPENAI_APIKEY;

const app = express();

app.use(express.json());

app.use(cors());

async function main() {
    await connectMongo.connect(mongoUri, "project")

    // GET
    app.get('/user_details', async function (req, res) {
        const data = await userDetails.getUserDetails();
        res.status(200);
        res.send(data);
    })

    app.get('/property_details', async function (req, res) {
        const data = await propertyDetails.getPropertyDetails();
        res.status(200)
        res.send(data)
    })

    // app.get('/listing_details', async function (req, res) {
    //     const data = await listingDetails.getListingDetails();
    //     res.status(200)
    //     res.send(data)
    // })


    // POST


    // Post user_details

    app.post('/user_details/create', async function (req, res) {
        let { ceaNo } = req.body;
        let { mobile, email } = req.body.contact
        let { username, password } = req.body.login
        let { first, last } = req.body.name
        let timestamp = new Date().toISOString()

        try {
            await userDetails.postUserDetails(ceaNo, mobile, email, username, password, first, last, timestamp);
            res.status(200)
            res.send("user data inserted")
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }
    })

    // Post property_details
    app.post("/property_details/create", async function (req, res) {
        let { country, postalCode, streetName, block, unit, project } = req.body.address;
        let { district, tenure, top, coordinates } = req.body;
        let { type, subType } = req.body.propertyType;
        let { lid } = req.body.listingDetails[0];
        let timestamp = new Date().toISOString()
       

        try {
            await propertyDetails.postPropertyDetails(country, postalCode, streetName, block, unit, project, district, type, subType, tenure, top, coordinates, timestamp, lid)
            res.status(200)
            res.send("property data inserted")
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }

    })

    // Post listing_details
    app.post("/listing_details/create/", async function (req, res) {
        let { type, subType, term } = req.body.listingType
        let { amount, state, builtPsf, landPsf } = req.body.price
        let { built, land } = req.body.size
        let { headline, mainText, maintFee, gst } = req.body.description
        let { photo, video } = req.body.media
        let timestamp = new Date().toISOString()

        try {
            const listingId = await listingDetails.postListingDetails(type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, timestamp)
            res.status(200)
            res.json({ success: true, "id": listingId });  

        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }

    })

    // Post to ChatGPT
    app.post('/filldescription', async (req, res) => {
        let { message } = req.body;
    
        const parameters = {
            prompt: message,
            max_tokens: 3000,
            model: 'text-davinci-003',
            temperature: 0.5,
            n: 1,
            stream: false
        };
    
        try {
            const response = await axios.post('https://api.openai.com/v1/completions', parameters, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + chatGptApikey,
                },
            });
            const descriptionValue = response.data.choices[0].text.trim();
            res.send({"reply" : descriptionValue});
        } catch (error) {
            console.log(error);
            res.status(500).send('Error generating property description');
        }
    });
    

   
    // PUT

    // Put user_details
    app.put("/user_details/update/:id", async function (req, res) {
        let id = req.params.id
        let { ceaNo } = req.body;
        let { mobile, email } = req.body.contact;
        let { username, password } = req.body.login;
        let { first, last } = req.body.name
        let timestamp = new Date().toISOString()

        try {
            await userDetails.putUserDetails(id, ceaNo, mobile, email, username, password, first, last, timestamp)
            res.status(200);
            res.send("user data updated");
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }
    })

    // Put property_details
    app.put("/property_details/update/:id", async function (req, res) {
        let id = req.params.id
        let { country, postalCode, streetName, block, unit, project } = req.body.address;
        let { district, tenure, top, coordinates } = req.body;
        let { type, subType } = req.body.propertyType;
        let timestamp = new Date().toISOString()

        try {
            await propertyDetails.putPropertyDetails(id, country, postalCode, streetName, block, unit, project, district, type, subType, tenure, top, coordinates, timestamp)
            res.status(200);
            res.send("property data updated");
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }
    })

    // Put listing_details
    app.put("/listing_details/update/:id", async function (req, res) {
        let id = req.params.id

    })


    // DELETE

    // Delete user_details
    app.delete("/user_details/delete/:id", async function (req, res) {
        let id = req.params.id
        try {
            await userDetails.deleteUserDetails(id)
            res.status(200);
            res.send("user data deleted");
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }
    });

    // Delete property_details
    app.delete("/property_details/delete/:id", async function (req, res) {
        let id = req.params.id
        try {
            await propertyDetails.deletePropertyDetails(id)
            res.status(200);
            res.send("property data deleted");
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }
    });


};


main()

app.listen(5000, function () {
    console.log("app started")
})

