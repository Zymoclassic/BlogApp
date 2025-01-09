const express = require("express");
const router = express.Router();

// import functions from authController
const {  signUp, logIn,  } = require("../controllers/authController");

router.post('/signup', signUp);
router.post('/login', logIn);

module.exports = router;

