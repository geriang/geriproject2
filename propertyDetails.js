const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;



async function getPropertyDetails() {
    const db = connectMongo.getDB()
    const result = await db.collection("property_details").find().limit(10).toArray();
    console.log(result)
    return result

}


async function postPropertyDetails(country, postalCode, streetName, block, unit, project, district, type, subType, tenure, top, timestamp) {
    const db = connectMongo.getDB();
    await db.collection("property_details").insertOne({

        "address": { "country": country, "postalCode": postalCode, "streetName": streetName, "block": block, "unit": unit, "project": project },
        "district": district,
        "propertyType": { 'type': type, 'subType': subType },
        "tenure": tenure,
        "top": top,
        'created': timestamp
    });
};

async function putPropertyDetails(id, country, postalCode, streetName, block, unit, project, district, type, subType, tenure, top, timestamp) {
    const db = connectMongo.getDB();
    await db.collection("property_details").updateOne({
        "_id": new ObjectId(id)
    }, {
        '$set': {
            "address": { "country": country, "postalCode": postalCode, "streetName": streetName, "block": block, "unit": unit, "project": project },
            "district": district,
            "propertyType": { 'type': type, 'subType': subType },
            "tenure": tenure,
            "top": top,
            'created': timestamp
        }
    });
}

async function deletePropertyDetails(id) {
    const db = connectMongo.getDB();
    await db.collection("property_details").deleteOne({
        "_id": new ObjectId(id)
    })
}

module.exports = { getPropertyDetails, postPropertyDetails, putPropertyDetails, deletePropertyDetails }

