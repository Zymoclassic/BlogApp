const express = require("express");
const postRouter = express.Router();

const { addPost, getAllPosts, updatePost, getById, getByCategory, deletePost, getAllMemberPost } = require("../controllers/postController");
const { authMiddleware } = require("../utils/authMiddleware");

// Define all the routes for the "/posts" and the corresponding http request
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getById);
postRouter.get("/categories/:category", getByCategory);
postRouter.get("/user/:id", getAllMemberPost);
postRouter.post("/create", authMiddleware, addPost);
postRouter.patch("/:id", authMiddleware, updatePost);
postRouter.delete("/:id", authMiddleware, deletePost);

module.exports = postRouter;


