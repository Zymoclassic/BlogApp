const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: [
            "uncategorized", 
            "entertainment", 
            "health", 
            "romance", 
            "education", 
            "finance", 
            "technology", 
            "sport", 
            "art", 
            "agriculture", 
            "politics"
        ],
        default: "uncategorized"
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Member",
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);
