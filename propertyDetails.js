const connectMongo = require('./connectMongo');
const ObjectId = require('mongodb').ObjectId;


// const array1 = [{"id": "1"}, {"id":"2"}];
// const array2 = [{"id": "1", "time":"10"}, {"id":"2", "time":"9"}];

// // Pass a function to map
// const map1 = array1.map(x => {
//   const id = x.id
//   const array2item = array2.find(y => y.id===id)
//   x.info=array2item
//   return x
// });



// async function getPropertyDetails() {
//     const db = connectMongo.getDB()
//     const result = await db.collection("property_details").find().toArray();
    
//     console.log(result)

//     return result
// }

// array.map( , ) => ()

// async function getListingDetails(){
//     const db = connectMongo.getDB()
//     const result = await db.collection("listing_details").find().toArray();

// }

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
    
      
      
      
      
      



async function postPropertyDetails(country, postalCode, streetName, block, unit, project, district, type, subType, tenure, top, coordinates, timestamp, lid) {
    const db = connectMongo.getDB(); 

    let listingId = new ObjectId(lid)
    console.log(listingId)
     
    await db.collection("property_details").insertOne({
        

        "address": { "country": country, "postalCode": postalCode, "streetName": streetName, "block": block, "unit": unit, "project": project },
        "district": district,
        "propertyType": { 'type': type, 'subType': subType },
        "tenure": tenure,
        "top": top,
        "coordinates": coordinates,
        "created": timestamp,
        "listingDetails": [{"_id": listingId}]
    });
};

async function putPropertyDetails(id, country, postalCode, streetName, block, unit, project, district, type, subType, tenure, top, coordinates, timestamp) {
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
            "coordinates": coordinates,
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

