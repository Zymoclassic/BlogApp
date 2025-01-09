const express = require("express");
const authRouter = express.Router();

// import functions from authController
const {  signUp, logIn,  } = require("../controllers/authController");

// define authentication routes
authRouter.post('/signup', signUp);
authRouter.post('/login', logIn);

module.exports = authRouter;

