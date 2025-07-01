const Listing = require("../models/listing.js");

module.exports.index = async (req, res) =>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm =  (req, res) =>{
    res.render("listings/new.ejs");
};

module.exports.showListing =  async (req, res, next) =>{
    let{ id } = req.params;
    const listing = await Listing.findById(id). populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    }).populate("owner");
    
    if (!listing) {
        // throw new ExpressError( 404,"Listing not found!");
        req.flash("error", "Listing you requested for, doesn't exist!")
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing } );
};

module.exports.createListing =async (req, res, next) =>{
    // let { title, description, image, price, location, country } = req.body; //another option below-->
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send VALID data for listing.")
    // }

        //geocoding
        const { location } = req.body.listing;

        const geoUrl = `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=zssgD3Y166g41rair5wK`;

        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (geoData.features && geoData.features.length > 0) {
            const coordinates = geoData.features[0].geometry.coordinates;
            console.log("Coordinates:", coordinates); // [lng, lat]
        } else {
            console.log("Location not found");
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename,
            };
        }
        //store coordinates-->
        newListing.geometry = {
            type: "Point",
            coordinates: geoData.features[0].geometry.coordinates
        };

        let savedListing = await newListing.save();
        console.log("SavedListing: ", savedListing)
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) =>{
    let{ id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        // throw new ExpressError( 404,"Listing not found!");
        req.flash("error", "Listing you requested for, doesn't exist!")
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) =>{
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send VALID data for listing.")
    // } //becoz we used now 'validateListing'
    let{ id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing} );

    if(typeof req.file !== "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    
     
    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`); //show route me redirect hoga
};

module.exports.destroyListing = async (req, res) =>{
    let{ id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings"); 
};