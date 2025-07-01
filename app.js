if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

process.traceDeprecation = true;

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate =  require("ejs-mate");
// const wrapAsync = require("./utils/wrapAsync.js")
// const { listingSchema , reviewSchema } = require("./schema.js");
const ExpressError = require('./utils/ExpressError.js');
// const Review = require("./models/reviews.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/nestpoint";
const dbUrl = process.env.ATLASDB_URL;

main().then(() =>{
    console.log("connected to DB!");
}).catch(err => {
    console.log(err)});

async function main() {
//   await mongoose.connect(MONGO_URL);
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//using mongo store-->
const store =  MongoStore.create({
    mongoUrl: dbUrl, //in atlasDB stores session info
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});     

store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE", err);
});

//using session--->
const sessionOptions = {
    store, //stores session info
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:  7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// app.get("/", (req,res)=>{
//     res.send("Heyy im root"); 
// });

//Session & Flash-------->
app.use(session(sessionOptions));
app.use(flash());


//Authentication {passport}----->
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));// use static authenticate method of model in LocalStrategy

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user || null;
    // console.log("Current User in middleware:", req.user);

    next();
});


//DemoUser--->
// app.get("/demouser", async(req,res) =>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "clg-student",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
// });


//Validate for Schema{Middleware} ----> is in 'routes' folder

//Note: Index, show, new, create, edit, update, delete routes are on 'routes' folder under 'listing.js' and other reviews in review.js

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


app.get("/", (req, res) => {
    res.redirect("/listings");
});


// app.get("/testListing", async (req,res) =>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 12000,
//         location: "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing!");
// });

//for page which not matched from above-->{'*'-->mns all}
//dont use ".all" it cause err for me Ok.
app.use( (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});


//middleware--error handling--->
app.use((err, req, res, next)=>{
    let { statusCode = 500, message = "Something went Wrong!"  } = err;
    // res.send("something went wrong!");
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});