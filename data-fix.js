// //extra for adding geometry to existing old listing
// data-fix.js

require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./init/data.js");
const Listing = require("./models/listing.js");
// const fetch = require("node-fetch");

const db_URL = process.env.ATLASDB_URL;
console.log("DB URL:", db_URL);

main().then(() => {
  console.log("connected to DB!");
  initDB().then(() => mongoose.connection.close());
}).catch(err => {
  console.log(err);
});

async function main() {
  await mongoose.connect(db_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});
  const updatedData = [];

  for (let obj of initData.data) {
    const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(obj.location)}.json?key=zssgD3Y166g41rair5wK`;

    try {
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      let geometry = {
        type: "Point",
        coordinates: [0, 0], // fallback
      };

      if (geoData.features.length > 0) {
        geometry.coordinates = geoData.features[0].geometry.coordinates;
      }

      updatedData.push({
        ...obj,
        owner: "6862332bcd8c94ccec3367aa",
        geometry,
      });

    } catch (error) {
      console.error(`Geocoding failed for ${obj.title}`, error);
    }
  }

  await Listing.insertMany(updatedData);
  console.log("Database seeded with real coordinates.");
};



//**ignore-below-->
// require("dotenv").config();

// const mongoose = require('mongoose');
// const Listing = require('./models/listing');
// const db_Url = process.env.ATLASDB_URL;

// console.log("updated!")
// async function main() {
//   await mongoose.connect(db_Url); // adjust DB name if needed

//   const listings = await Listing.find({ "geometry": { $exists: false } });

//   for (let listing of listings) {
//     const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(listing.location)}.json?key=zssgD3Y166g41rair5wK`;
//     const geoRes = await fetch(geoUrl);
//     const geoData = await geoRes.json();

//     if (geoData.features.length > 0) {
//       listing.geometry = {
//         type: 'Point',
//         coordinates: geoData.features[0].geometry.coordinates
//       };
//       await listing.save();
//       console.log(`Fixed geometry for: ${listing.title}`);
//     } else {
//       console.log(`Could not find location for: ${listing.title}`);
//     }
//   }

//   mongoose.connection.close();
// }

// main();