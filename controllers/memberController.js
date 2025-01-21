const Member = require("../model/Member");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const dotenv = require("dotenv");
dotenv.config();

// gets all users
const getAllMember = async (req, res, next) => {
    let members;
    try {
        members = await Member.find().select("-password");
    } catch (err) {
        return res.status(500).json({ message: "ERROR!!! Can not process it." });
    }
    if (!members) {
        return res.status(404).json({ message: "No member found!" });
    }
    return res.status(200).json({ members });
};

// check user profile
const getMember = async (req, res, next) => {
    const id = req.params.id;
    let member;
    try {
        member = await Member.findById(id).select("-password");
    } catch (err) {
        return res.status(500).json({ message: "ERROR!!! Can not process it." });
    }
    if (!member) {
        return res.status(404).json({ message: "The user can not be found!" });
    }
    return res.status(200).json({ member });
};

const changeDp = async (req, res, next) => {
    try {
        // Validate uploaded file
        if (!req.files || !req.files.image) {
            return res.status(422).json({ message: "Please select an image." });
        }

        const { image } = req.files;

        // Check file size (2MB max)
        if (image.size > 2 * 1024 * 1024) {
            return res.status(400).json({ message: "File too large. Please upload a file smaller than 2MB." });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({ message: "Invalid file type. Please upload a valid image." });
        }

        // Find the member
        const member = await Member.findById(req.member.id);
        if (!member) {
            return res.status(404).json({ message: "Member not found." });
        }

        // Delete pre-existing profile image if it exists
        if (member.image) {
            const oldFilePath = path.join(__dirname, "..", "uploads", member.image);
            try {
                await fs.unlink(oldFilePath);
            } catch (err) {
                console.error("Error deleting old image:", err.message);
                // Log the error but continue processing
            }
        }

        // Generate new unique filename
        const fileExtension = path.extname(image.name);
        const newFileName = `${uuid()}${fileExtension}`;

        // Define upload path
        const uploadPath = path.join(__dirname, "..", "uploads", newFileName);

        // Move uploaded file to destination
        await image.mv(uploadPath);

        // Update member record with the new image filename
        member.image = newFileName;
        await member.save();

        return res.status(200).json({
            message: "File successfully uploaded.",
            image: newFileName,
        });
    } catch (err) {
        console.error("Error in changeDp:", err.message);
        return res.status(500).json({ message: "An error occurred while processing your request." });
    }
};


// update user details
const editMemberDetails = async (req, res, next) => {
    try {
        const { name, email, currentPassword, newPassword, confirmNewPassword } = req.body;
        if (!name || !email || !currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(422).json({ message: "Fill all blank fields." });
        }

        //fetch user from database
        const member = await Member.findById(req.member.id);
        if (!member) {
            return res.status(403).json({ message: "Specified member not found." });
        }

        //confirm email doesn't exist already
        const newEmail = email.toLowerCase();
        const emailValidation = await Member.findOne({ email: newEmail });
        if (emailValidation && (emailValidation._id.toString() !== req.member.id)) {
            return res.status(422).json({ message: "Pre-existing email address, Please use another one." });
        }

        //validate current password
        const passwordValidation = await bcrypt.compare(currentPassword, user.password);
        if (!passwordValidation) {
            return res.status(422).json({ message: "Current password is invalid." });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(422).json({ message: "New passwords don't match." });
        }

        //hash new password
        const salt = await bcrypt.genSalt(10);
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(newPassword, salt);
        } catch (err) {
            return res.status(500).json({ message: "Error! Please try again." });
        }

        //Update database information
        const newMemberInfo = await Member.findByIdAndUpdate(
            req.member.id,
            { name, email: newEmail, password: hashedPassword },
            { new: true }
        );
        res.status(200).json(newMemberInfo);
    } catch (err) {
        return res.status(500).json({ message: "ERROR!!! Can not process it." });
    }
};


module.exports = {
    getAllMember,
    getMember,
    changeDp,
    editMemberDetails
}