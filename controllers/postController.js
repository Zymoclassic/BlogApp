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


// Get all available posts
const getAllPosts = async (req, res, next) => {
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

// Add blog, but verify user before adding
const addPost = async (req, res, next) => {
    const { title, description, category, user } = req.body;
    const { image } = req.files;
    let existingMember;
    try {
        if (!title || !description || !category || !user || !image) {
            return res.status(422).json({ message: "Fill in all empty field(s) and upload an image." });
        }

        // Check the file size
        if (image.size > 2000000) {
            return res.status(400).json({ message: "File too large, Please upload something lesser than 2mb." });
        }

        // Check file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({ message: "Invalid file type. Please upload a valid image." });
        }

        // Rename file
        let fileName = image.name;
        let modFileName = fileName.split(".");
        let newFileName = `${modFileName[0]}_${uuid()}.${modFileName.pop()}`;

        // Upload file
        image.mv(path.join(__dirname, "..", "uploads", newFileName), async (err) => {
            if (err) {
                return res.status(400).json({ message: "Error encountered while uploading file." });
            }
        });

        existingMember = await Member.findById(member);
        if (!existingMember) {
            return res.status(400).json({ message: "This user cannot be found." });
        }
        const post = new Post({
            title,
            category,
            description,
            image: newFileName,
            user,
        });

        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            await post.save({ session });
            existingMember.posts.push(post);
            await existingMember.save({ session });
            await session.commitTransaction();
        } catch (err) {
            await session.abortTransaction();
            return res.status(500).json({ message: "Error! Post can not be saved." });
        } finally {
            session.endSession();
        }

        return res.status(201).json({ post });
    } catch (err) {
        return res.status(500).json({ message: "We encountered an error trying to process the request." });
    }
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
