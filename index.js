const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;
const userDetails = require('./userDetails');
const propertyDetails = require('./propertyDetails');
const listingDetails = require('./listingDetails');
const axios = require('axios');
const chatGptApikey = process.env.OPENAI_APIKEY;


const app = express();

// Add middleware to set CORS headers explicitly
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'https://vue.gach.work');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     next();
// });

app.use(cors({
    origin: 'https://vue.gach.work',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['Access-Control-Allow-Origin']
}));

// Enable pre-flight requests for all routes
app.options('*', cors());

app.use(express.json());

async function connectDB() {
    const mongoUri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.zmiiogz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    await connectMongo.connect(mongoUri, "project");
    }

connectDB()

// // Handle preflight requests
// app.options('*', (req, res) => {
//     res.setHeader('Access-Control-Allow-Origin', 'https://vue.gach.work');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     res.sendStatus(200);
// });

// GET
// get property details and listing details embedded
app.get('/property_details', async function (req, res) {
    const data = await propertyDetails.getPropertyDetails();
    res.status(200);
    res.send(data);
})

// get property details based on postal code
app.get('/property_details/check/:postalCode', async function (req, res) {
    let postalCode = req.params.postalCode;

    try {
        let result = await propertyDetails.checkPropertyDetails(postalCode);
        res.status(200);
        res.send(result);
    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    }
}


)

// get property details via address input for editing purpose
app.get('/property_details/:address', async function (req, res) {
    const db = connectMongo.getDB();
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
    ]).limit(8).toArray();
    res.send(result);

})

// POST

// Post user_details

app.post('/user_details/create', async function (req, res) {
    let { ceaNo } = req.body;
    let { mobile, email } = req.body.contact;
    let { username, password } = req.body.login;
    let { first, last } = req.body.name;
    let timestamp = new Date().toISOString();

    try {
        await userDetails.postUserDetails(ceaNo, mobile, email, username, password, first, last, timestamp);
        res.status(200);
        res.send("user data inserted");
    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    };
});

// Post property_details
app.post("/property_details/create", async function (req, res) {
    let { country, postalCode, streetName, block, project } = req.body.address;
    let { district, tenure, wef, top, coordinates } = req.body;
    let { type, subType } = req.body.propertyType;
    let { _id } = req.body.listingDetails[0];
    let timestamp = new Date().toISOString();

    try {
        await propertyDetails.postPropertyDetails(country, postalCode, streetName, block, project, district, type, subType, tenure, wef, top, coordinates, timestamp, _id);
        res.status(200);
        res.send("property data inserted");
    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    };

});

// Post listing_details
app.post("/listing_details/create/", async function (req, res) {
    let { type, subType, term } = req.body.listingType;
    let { amount, state, builtPsf, landPsf } = req.body.price;
    let { built, land } = req.body.size;
    let { headline, mainText, maintFee, gst } = req.body.description;
    let { photo, video } = req.body.media;
    let { unit, rooms } = req.body;
    let timestamp = new Date().toISOString();

    try {
        const listingId = await listingDetails.postListingDetails(type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, unit, rooms, timestamp);
        res.status(200);
        res.json({ success: true, "id": listingId });

    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    };

});

// Post to ChatGPT
app.post('/filldescription', async (req, res) => {
    let { message } = req.body;

    const parameters = {
        "prompt": message,
        "max_tokens": 3000,
        "model": 'text-davinci-003',
        "temperature": 0.5,
        "n": 1,
        "stream": false
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
    };
});



// PUT

// Put property_details
app.put("/property_details/update/:id", async function (req, res) {
    let id = req.params.id;
    let { project } = req.body.address;
    let { tenure, wef, top } = req.body;
    let { type, subType } = req.body.propertyType;
    let timestamp = new Date().toISOString();

    try {
        await propertyDetails.putPropertyDetails(id, project, type, subType, tenure, wef, top, timestamp);
        res.status(200);
        res.send("property data updated");
    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    };
});

// remove property_details (listingDetails ID update only)
app.put("/property_details/update/:pid/:lid", async function (req, res) {
    let pid = req.params.pid;
    let lid = req.params.lid;
    try {
        await propertyDetails.updateListingReferenceId(pid, lid);
        res.status(200);
        res.send("Listing ID removed");
    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    };


});

// add new listing_details to exisiting property document
app.put("/property_details/add/:pid/:lid", async function (req, res) {
    let pid = req.params.pid;
    let lid = req.params.lid;
    try {
        await propertyDetails.addListingReferenceId(pid, lid);
        res.status(200);
        res.send("inserted new listing into existing property document");
    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    };
});

// Put listing_details
app.put("/listing_details/update/:id", async function (req, res) {
    let id = req.params.id;
    let { type, subType, term } = req.body.listingType;
    let { amount, state, builtPsf, landPsf } = req.body.price;
    let { built, land } = req.body.size;
    let { headline, mainText, maintFee, gst } = req.body.description;
    let { photo, video } = req.body.media;
    let { unit, rooms } = req.body;
    let timestamp = new Date().toISOString();

    try {
        const listingId = await listingDetails.putListingDetails(id, type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, unit, rooms, timestamp);
        res.status(200);
        res.send("listing data updated");

    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    };
});


// DELETE

// Delete listing_details 
app.delete("/listing_details/delete/:id", async function (req, res) {
    let id = req.params.id;
    try {
        await listingDetails.deleteListingDetails(id);
        res.status(200);
        res.send("Listing data deleted");
    } catch (e) {
        res.status(500);
        res.send(e);
        console.log(e);
    };

});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;

