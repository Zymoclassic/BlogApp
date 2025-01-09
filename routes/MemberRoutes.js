const express = require("express");
const router = express.Router();

// import functions from userController
const {  getAllMember, getMember, changeDp, editMemberDetails } = require("../controllers/userController");

// import the authentication middleware
const { authMiddleware } = require("../utils/authMiddleware");

// define user routes
router.get('/', getAllMember);
router.get('/:id', getMember);
router.post('/changedp', authMiddleware, changeDp);
router.patch('/editdetails', authMiddleware, editMemberDetails);

module.exports = router;
