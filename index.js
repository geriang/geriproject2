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

    // get property details and listing details embedded
    app.get('/property_details', async function (req, res) {
        const data = await propertyDetails.getPropertyDetails();
        res.status(200)
        res.send(data)
    })

    // get property details via address input for editing purpose
    app.get('/property_details/:address', async function (req, res) {
        const db = connectMongo.getDB()
        const regexQuery = {
            $or: [
                { "address.postalCode": new RegExp(req.params.address, 'i') },
                { "address.streetName": new RegExp(req.params.address, 'i') },
                { "address.project": new RegExp(req.params.address, 'i') }
            ]
        };

        const result = await db.collection("property_details").aggregate([
            {
                $match: regexQuery
            },
            {
                $lookup: {
                    from: "listing_details",
                    localField: "listingDetails._id",
                    foreignField: "_id",
                    as: "listingDetails"
                }
            }
        ]).toArray();
        console.log(result)
        res.send(result)


        // const result = await db.collection("property_details").find(regexQuery).limit(5).toArray()
        // res.send(result)
    })


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
        let { district, tenure, wef, top, coordinates } = req.body;
        let { type, subType } = req.body.propertyType;
        let { lid } = req.body.listingDetails[0];
        let timestamp = new Date().toISOString()


        try {
            await propertyDetails.postPropertyDetails(country, postalCode, streetName, block, unit, project, district, type, subType, tenure, wef, top, coordinates, timestamp, lid)
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
        let { unit, rooms } = req.body
        let timestamp = new Date().toISOString()

        try {
            const listingId = await listingDetails.postListingDetails(type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, unit, rooms, timestamp)
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
            res.send({ "reply": descriptionValue });
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
        let { project } = req.body.address;
        let { tenure, wef, top } = req.body;
        let { type, subType } = req.body.propertyType;
        let timestamp = new Date().toISOString()

        try {
            await propertyDetails.putPropertyDetails(id, project, type, subType, tenure, wef, top, timestamp)
            res.status(200);
            res.send("property data updated");
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }
    })

    // Put property_details (listingDetails ID update only)
    app.put("/property_details/update/:pid/:lid", async function (req, res) {
        let pid = req.params.pid
        let lid = req.params.lid
        try {
            await propertyDetails.updateListingReferenceId(pid, lid)
            res.status(200);
            res.send("Property ListingDetails updated");
        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }


    });

    // Put listing_details
    app.put("/listing_details/update/:id", async function (req, res) {
        let id = req.params.id
        let { type, subType, term } = req.body.listingType;
        let { amount, state, builtPsf, landPsf } = req.body.price
        let { built, land } = req.body.size
        let { headline, mainText, maintFee, gst } = req.body.description
        let { photo, video } = req.body.media
        let { unit, rooms } = req.body
        let timestamp = new Date().toISOString()

        try {
            const listingId = await listingDetails.putListingDetails(id, type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, unit, rooms, timestamp)
            res.status(200)
            res.send("listing data updated");

        } catch (e) {
            res.status(500);
            res.send(e);
            console.log(e);
        }



        // let { type, subType, term } = req.body.listingType
        // let { amount, state, builtPsf, landPsf } = req.body.price
        // let { built, land } = req.body.size
        // let { headline, mainText, maintFee, gst } = req.body.description
        // let { photo, video } = req.body.media
        // let { unit, rooms } = req.body
        // let timestamp = new Date().toISOString()

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
    // app.delete("/property_details/delete/:id", async function (req, res) {
    //     let id = req.params.id
    //     try {
    //         await propertyDetails.deletePropertyDetails(id)
    //         res.status(200);
    //         res.send("property data deleted");
    //     } catch (e) {
    //         res.status(500);
    //         res.send(e);
    //         console.log(e);
    //     }
    // });

    // Delete listing_details 
    app.delete("/listing_details/delete/:id", async function (req, res) {
        let id = req.params.id
        try {
            await listingDetails.deleteListingDetails(id)
            res.status(200);
            res.send("Listing data deleted");
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

