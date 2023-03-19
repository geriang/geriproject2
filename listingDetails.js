const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;

// async function getListingDetails() {
//     const db = connectMongo.getDB();
//     const result = await db.collection("listing_details").find().toArray();
//     return result;
// }


// async function getListingDetails() {
//     const db = connectMongo.getDB();
//     const result = await db.collection.aggregate([
//         {
//             $lookup: {
//                 from: "property_listing",
//                 localField: "referencedObjectId"
//             }
//         }
//     ])
// }
// db.collection.aggregate([
//     {
//       $lookup: {
//         from: "referencedObject",
//         localField: "referencedObjectId",
//         foreignField: "_id",
//         as: "referencedObject"
//       }
//     }
//   ])
// async function postListingDetails(pid, uid, type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, timestamp) {
//     const db = connectMongo.getDB();
//     const result = await db.collection("listing_details").insertOne({
//         "property_details": new ObjectId(pid),
//         "user_details": { $ref: "user_details", $id: uid },
//         "listingType": {
//             "type": type,
//             "subType": subType,
//             "term": term
//         },
//         "price": {
//             "amount": amount,
//             "state": state,
//             "builtPsf": builtPsf,
//             "landPsf": landPsf
//         },
//         "size": {
//             "built": built,
//             "land": land
//         },
//         "description": {
//             "headline": headline,
//             "mainText": mainText,
//             "maintFee": maintFee,
//             "gst": gst
//         },
//         "media": {
//             "photo": photo,
//             "video": video
//         },
//         "created": timestamp

//     })
//     let returnId = result.insertedId
//     console.log(returnId)
//     return returnId

// }


async function postListingDetails(type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, unit, rooms, timestamp) {
    const db = connectMongo.getDB();
    const resultId = await db.collection("listing_details").insertOne({

        "listingType": {
            "type": type,
            "subType": subType,
            "term": term
        },
        "price": {
            "amount": amount,
            "state": state,
            "builtPsf": builtPsf,
            "landPsf": landPsf
        },
        "size": {
            "built": built,
            "land": land
        },
        "description": {
            "headline": headline,
            "mainText": mainText,
            "maintFee": maintFee,
            "gst": gst
        },
        "media": {
            "photo": photo,
            "video": video
        },
        "created": timestamp,
        "unit": unit,
        "rooms": rooms

    })
    let returnId = resultId.insertedId
    // console.log(returnId)
    return returnId

}

async function putListingDetails(id, type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, unit, rooms, timestamp) {
    const db = connectMongo.getDB();
    await db.collection("listing_details").updateOne({
        "_id": new ObjectId(id)
    }, {
        "$set": {
            "listingType": {
                "type": type,
                "subType": subType,
                "term": term
            },
            "price": {
                "amount": amount,
                "state": state,
                "builtPsf": builtPsf,
                "landPsf": landPsf
            },
            "size": {
                "built": built,
                "land": land
            },
            "description": {
                "headline": headline,
                "mainText": mainText,
                "maintFee": maintFee,
                "gst": gst
            },
            "media": {
                "photo": photo,
                "video": video
            },
            "created": timestamp,
            "unit": unit,
            "rooms": rooms
        }

    })
}

async function deleteListingDetails(id) {

    const db = connectMongo.getDB();
    await db.collection("listing_details").deleteOne({
        "_id": new ObjectId(id)
    });
}




module.exports = { postListingDetails, putListingDetails, deleteListingDetails }




// async function putListingDetails(id, type, subType, term, amount, state, builtPsf, landPsf, built, land, headline, mainText, maintFee, gst, photo, video, unit, rooms, timestamp) {
//     const db = connectMongo.getDB();
//     await db.collection("listing_details").updateOne({
//         "_id": new ObjectId(id)
//     }, {
//         "$set": {
//             "property_details": new ObjectId(pid),
//             "user_details": { $ref: "user_details", $id: uid },
//             "listingType": {
//                 "type": type,
//                 "subType": subType,
//                 "term": term
//             },
//             "price": {
//                 "amount": amount,
//                 "state": state,
//                 "builtPsf": builtPsf,
//                 "landPsf": landPsf
//             },
//             "size": {
//                 "built": built,
//                 "land": land
//             },
//             "description": {
//                 "headline": headline,
//                 "mainText": mainText,
//                 "maintFee": maintFee,
//                 "gst": gst
//             },
//             "media": {
//                 "photo": photo,
//                 "video": video
//             },
//             "created": timestamp,
//             "unit": unit,
//             "rooms": rooms

//         }

//     })
// }