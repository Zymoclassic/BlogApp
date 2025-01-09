const express = require("express");
const postRouter = express.Router();

// import functions from postController
const { addPost, getAllPosts, updatePost, getById, getByCategory, deletePost, getAllMemberPosts } = require("../controllers/postController");
const { authMiddleware } = require("../utils/authMiddleware");

// Define post routes
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getById);
postRouter.get("/categories/:category", getByCategory);
postRouter.get("/user/:id", getAllMemberPosts);
postRouter.post("/create", authMiddleware, addPost);
postRouter.patch("/:id", authMiddleware, updatePost);
postRouter.delete("/:id", authMiddleware, deletePost);

module.exports = postRouter;


