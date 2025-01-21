const express = require('express');
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

// Add post, but verify member before adding
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

// Get a particular post
const getById = async (req, res, next) => {
    const postId = req.params.id;
    let post;
    try {
        post = await Post.findById(postId);
    } catch (err) {
        return res.status(500).json({ message: "Error! A blockade was encountered." });
    }
    if (!post) {
        return res.status(404).json({ message: "The post you are trying to locate doesn't exist." });
    }
    return res.status(200).json({ post });
};

// Get post by Category
const getByCategory = async (req, res, next) => {
    const { category } = req.params;
    let postCategory;
    try {
        postCategory = await Post.find({ category }).sort({ createdAt: -1 });
    } catch (err) {
        return res.status(500).json({ message: "Error! A blockade was encountered." });
    }
    if (!postCategory) {
        return res.status(404).json({ message: "The category you are trying to locate doesn't exist." });
    }
    return res.status(200).json({ postCategory });
};

// Get all posts by a particular user
const getAllMemberPosts = async (req, res, next) => {
    let memberId = req.params.id;
    let memberPosts;
    try {
        memberPosts = await Member.findById(memberId).select("-password").populate("posts");
    } catch (err) {
        return res.status(500).json({ message: "An error occurred! Please try again." });
    }
    if (!memberPosts) {
        return res.status(400).json({ message: "This is not a valid user" });
    }
    return res.status(200).json({ memberInfo: memberPosts });
};

// Edit post
const updatePost = async (req, res, next) => {
    const { title, description, category } = req.body;
    const postId = req.params.id;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "The blog you are trying to locate doesn't exist." });
        }

        if (!post.member.equals(new mongoose.Types.ObjectId(req.member.id))) {
            return res.status(403).json({ message: "Unauthorized action." });
        }

        if (!title || !description || !category) {
            return res.status(422).json({ message: "Please fill all blank fields." });
        }

        const image = req.files?.image;
        if (image) {
            if (image.size > 2000000) {
                return res.status(400).json({ message: "File too large. Please upload something smaller than 2MB." });
            }

            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
            if (!allowedTypes.includes(image.mimetype)) {
                return res.status(400).json({ message: "Invalid file type. Please upload a valid image." });
            }

            if (post.image) {
                const oldImagePath = path.join(__dirname, "..", "uploads", post.image);
                try {
                    await fs.promises.unlink(oldImagePath);
                } catch (err) {
                    console.error("Failed to delete existing image:", err);
                }
            }

            const modFileName = image.name.split(".");
            const newFileName = `${modFileName[0]}_${uuid()}.${modFileName.pop()}`;
            const uploadPath = path.join(__dirname, "..", "uploads", newFileName);
            await image.mv(uploadPath);

            post.image = newFileName;
        }

        post.title = title;
        post.description = description;
        post.category = category;

        const updatedPost = await post.save();

        return res.status(200).json({ message: "Post updated successfully.", post: updatedPost });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred. Please try again later." });
    }
};

// Delete Post
const deletePost = async (req, res, next) => {
    const postId = req.params.id;

    try {
        const post = await Post.findById(postId).populate("member");
        if (!post) {
            return res.status(404).json({ message: "The blog you are trying to locate doesn't exist." });
        }

        if (!post.member.equals(new mongoose.Types.ObjectId(req.member.id))) {
            return res.status(403).json({ message: "Unauthorized action." });
        }

        if (post.image) {
            const filePath = path.join(__dirname, "..", "uploads", post.image);
            try {
                await fs.promises.unlink(filePath);
            } catch (err) {
                console.error("Error deleting the image file:", err);
                return res.status(500).json({ message: "Failed to delete the associated image file." });
            }

        }

        await Post.findByIdAndDelete(postId);

        post.member.posts.pull(post);
        await post.member.save();

        return res.status(200).json({ message: "Post successfully deleted." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "An error occurred while executing. Please try again later." });
    }
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
