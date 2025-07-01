require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

//in atlas database-->


const db_URL = process.env.ATLASDB_URL;
console.log("DB URL:", process.env.ATLASDB_URL);

// const MONGO_URL = "mongodb://127.0.0.1:27017/nestpoint";

main().then(() =>{
    console.log("connected to DB!");
    return initDB();
}).catch(err => {
    console.log(err)});

async function main() {
  await mongoose.connect(db_URL);
}

const initDB = async () =>{
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) =>({
        ...obj,
        owner: "6862332bcd8c94ccec3367aa", //admin
    }));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

// initDB();