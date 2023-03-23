const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;

// check if exisiting property document exists
async function checkPropertyDetails(postalCode) {
    const db = connectMongo.getDB();
    const result = await db.collection("property_details").findOne({ "address.postalCode": postalCode });
    return result;

};

// retrieve all property documents together with referenced documents from listing_details collection
async function getPropertyDetails() {
    const db = connectMongo.getDB();
    const result = await db.collection("property_details").aggregate([
        {
            $lookup: {
                from: "listing_details",
                localField: "listingDetails._id",
                foreignField: "_id",
                as: "listingDetails"
            }
        }
    ]).toArray();

    return result;
};


// Post new property
async function postPropertyDetails(country, postalCode, streetName, block, project, district, type, subType, tenure, wef, top, coordinates, timestamp, _id) {
    const db = connectMongo.getDB();
    await db.collection("property_details").insertOne({

        "address": { "country": country, "postalCode": postalCode, "streetName": streetName, "block": block, "project": project },
        "district": district,
        "propertyType": { 'type': type, 'subType': subType },
        "tenure": tenure,
        "wef": wef,
        "top": top,
        "coordinates": coordinates,
        "created": timestamp,
        "listingDetails": [{ "_id": new ObjectId(_id) }]
    });
};

// add new listing reference ID to property document(existing)

async function addListingReferenceId(pid, lid) {
    const db = connectMongo.getDB();
    await db.collection("property_details").updateOne({
        "_id": new ObjectId(pid)
    }, {
        "$push": { "listingDetails": { "_id": new ObjectId(lid) } }
    });
};


// edit property details
async function putPropertyDetails(id, project, type, subType, tenure, wef, top, timestamp) {
    const db = connectMongo.getDB();
    await db.collection("property_details").updateOne({
        "_id": new ObjectId(id)
    }, {
        "$set": {
            "address.project": project,
            "propertyType": { 'type': type, 'subType': subType },
            "tenure": tenure,
            "wef": wef,
            "top": top,
            'created': timestamp,
        }
    });
};

// remove the referenced ID of listing_details collection when deleting a listing
async function updateListingReferenceId(pid, lid) {
    const db = connectMongo.getDB();
    let rpid = new ObjectId(pid);
    let rlid = new ObjectId(lid);

    await db.collection("property_details").updateOne({
        "_id": rpid

    }, {
        "$pull": { "listingDetails": { "_id": rlid } }

    });
};

module.exports = { getPropertyDetails, checkPropertyDetails, postPropertyDetails, addListingReferenceId, putPropertyDetails, updateListingReferenceId };

