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
    if (!memberer) {
        return res.status(404).json({ message: "The user can not be found!" });
    }
    return res.status(200).json({ member });
};

const changeDp = async (req, res, next) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(422).json({ message: "Please select an image." });
        }

        const { image } = req.files;

        //check the file size
        if (image.size > 2000000) {
            return res.status(400).json({ message: "File too large, Please upload something lesser than 2mb." });
        }

        //check file type
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({ message: "Invalid file type. Please upload a valid image." });
        }

        // check if user is authorized
        const member = await Member.findById(req.member.id);

        if (!member) {
            return res.status(404).json({ message: "Member not found." });
        }

        //delete pre-existing dp
        if (member.image) {
            fs.unlink(path.join(__dirname, "..", "uploads", member.image), (err) => {
                if (err) {
                    return res.status(400).json({ message: "An error occurred, Please try again later." });
                }
            });
        }

        //rename file
        let fileName;
        fileName = image.name;
        let modFileName = fileName.split(".");
        let newFileName = `${modFileName[0]}_${uuid()}.${modFileName.pop()}`;

        // upload file
        image.mv(path.join(__dirname, "..", "uploads", newFileName), async (err) => {
            if (err) {
                return res.status(400).json({ message: "Error encountered while uploading file." });
            }

            try {
                // Update user record
                const updatedImage = await Member.findByIdAndUpdate(
                    req.member.id,
                    { image: newFileName },
                    { new: true }
                );
                if (!updatedImage) {
                    return res.status(400).json({ message: "Error updating user image." });
                }
                return res.status(200).json({ message: "File successfully uploaded.", image: newFileName });
            } catch (err) {
                return res.status(500).json({ message: "An error occurred while updating the image." });
            }
        });

    } catch (err) {
        return res.status(500).json({ message: "ERROR!!! Can not process it." });
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