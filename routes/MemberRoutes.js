const express = require("express");
const memberRouter = express.Router();

// import functions from memberController
const {  getAllMember, getMember, changeDp, editMemberDetails } = require("../controllers/memberController");

// import the authentication middleware
const { authMiddleware } = require("../utils/authMiddleware");

// define user routes
memberRouter.get('/', getAllMember);
memberRouter.get('/:id', getMember);
memberRouter.post('/changedp', authMiddleware, changeDp);
memberRouter.patch('/editdetails', authMiddleware, editMemberDetails);

module.exports = memberRouter;
