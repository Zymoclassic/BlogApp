const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const memberSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    blogs: [{
        type: mongoose.Types.ObjectId,
        ref: "Post",
        required: true
    }]
});

module.exports = mongoose.model("Member", memberSchema);