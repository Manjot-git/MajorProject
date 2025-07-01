const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");



//SignUp page--->

router.route("/signup")
    .get(userController.renderSignupForm)
    .post( wrapAsync (userController.signUp));


//Login page--->

router.route("/login")
    .get(userController.renderLoginForm)
    .post( saveRedirectUrl,
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }) , userController.login
    );

//Logout page---->
router.get("/logout", userController.logOut);


module.exports = router;