const express = require('express');
const postRouter = express.Router();
const Post = require("../model/Post");
const Member = require("../model/Member");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();


// Get all available blogs
const getAllBlogs = async (req, res, next) => {
    let posts;
    try {
        posts = await Post.find().sort({ updatedAt: -1 });
    } catch (err) {
        return res.status(500).json({ message: "ERROR!!! couldn't process the posts." });
    }
    if (!posts) {
        return res.status(404).json({ message: "ERROR!!! No post found." });
    }
    return res.status(200).json({ posts });
};

// Placeholder for a specific post by ID
const getById = async (req, res, next) => {
    const { id } = req.params;
    res.json({ 
        message: `Fetching post with ID: ${id}`, 
        post: { id, title: `Post ${id}`, content: `This is the content of post ${id}`, category: "Example", author: "User1" } 
    });
};

// Placeholder for posts by category
const getByCategory = async (req, res, next) => {
    const { category } = req.params;
    res.json({ 
        message: `Fetching posts in category: ${category}`, 
        posts: [
            { id: 3, title: "Tech Post", content: "A tech-related post", category, author: "User3" }
        ] 
    });
};

// Placeholder for posts by a user
const getAllMemberPosts = async (req, res, next) => {
    const { id } = req.params;
    res.json({ 
        message: `Fetching all posts by user with ID: ${id}`, 
        posts: [
            { id: 4, title: "User Post", content: "A post by the user", category: "Personal", author: `User${id}` }
        ] 
    });
};

// Placeholder for creating a post
const addPost = async (req, res, next) => {
    const { title, content, category } = req.body;
    res.status(201).json({ 
        message: "Post created successfully", 
        post: { id: 5, title, content, category, author: "User5" } 
    });
};

// Placeholder for updating a post
const updatePost = async (req, res, next) => {
    const { id } = req.params;
    const { title, content, category } = req.body;
    res.json({ 
        message: `Post with ID: ${id} updated successfully`, 
        updatedPost: { id, title, content, category, author: "User5" } 
    });
};

// Placeholder for deleting a post
const deletePost = async (req, res, next) => {
    const { id } = req.params;
    res.json({ 
        message: `Post with ID: ${id} deleted successfully` 
    });
};

module.exports = {
    getAllPosts,
    getById,
    getByCategory,
    getAllMemberPosts,
    addPost,
    updatePost,
    deletePost
};
