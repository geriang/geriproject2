const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;


async function getPropertyDetails() {
    const db = connectMongo.getDB()
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

    console.log(result);
    return result;
}


async function postPropertyDetails(country, postalCode, streetName, block, unit, project, district, type, subType, tenure, wef, top, coordinates, timestamp, lid) {
    const db = connectMongo.getDB();

    let listingId = new ObjectId(lid)
    console.log(listingId)

    await db.collection("property_details").insertOne({


        "address": { "country": country, "postalCode": postalCode, "streetName": streetName, "block": block, "unit": unit, "project": project },
        "district": district,
        "propertyType": { 'type': type, 'subType': subType },
        "tenure": tenure,
        "wef": wef,
        "top": top,
        "coordinates": coordinates,
        "created": timestamp,
        "listingDetails": [{ "_id": listingId }]
    });
};

async function putPropertyDetails(id, country, postalCode, streetName, block, unit, project, district, type, subType, tenure, wef, top, coordinates, timestamp) {
    const db = connectMongo.getDB();
    await db.collection("property_details").updateOne({
        "_id": new ObjectId(id)
    }, {
        '$set': {
            "address": { "country": country, "postalCode": postalCode, "streetName": streetName, "block": block, "unit": unit, "project": project },
            "district": district,
            "propertyType": { 'type': type, 'subType': subType },
            "tenure": tenure,
            "wef": wef,
            "top": top,
            "coordinates": coordinates,
            'created': timestamp,   
        }
    });
}

async function updateListingReferenceId(pid, lid) {
    const db = connectMongo.getDB();
    let rpid = new ObjectId(pid)
    let rlid = new ObjectId(lid)
    console.log(rpid)
    console.log(rlid)
    await db.collection("property_details").updateOne({
        "_id": rpid

    }, {
        "$pull": { "listingDetails": {"_id" : rlid } }

    })
}

// async function deletePropertyDetails(id) {
//     const db = connectMongo.getDB();
//     await db.collection("property_details").deleteOne({
//         "_id": new ObjectId(id)
//     })
// }

module.exports = { getPropertyDetails, postPropertyDetails, putPropertyDetails, updateListingReferenceId }

