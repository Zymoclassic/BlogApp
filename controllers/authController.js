const Member = require("../model/Member");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

// create account
const signUp = async (req, res, next) => {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Fill in all details" });
    }

    // convert email to lowercase
    const newEmail = email.toLowerCase();

    // check if user is pre-existing
    let existingMember;
    try {
        existingMember = await Member.findOne({ email: newEmail });
    } catch (err) {
        return res.status(500).json({ message: "ERROR!!! Validation interrupted" });
    }
    if (existingMember) {
        return res.status(400).json({ message: "Pre-existing Member, Please use the Login page instead." });
    }

    if ((password.trim()).length < 8) {
        return res.status(400).json({ message: "Password is too short." });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords doesn't match." });
    }

    const salt = await bcrypt.genSalt(10);
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, salt);
    } catch (err) {
        return res.status(500).json({ message: "Error! Please try again." });
    }

    const member = new Member({
        name,
        email: newEmail,
        password: hashedPassword,
        blogs: [],
    });
    try {
        await member.save();
    } catch (err) {
        return res.status(500).json({ message: "ERROR!!! Can not process data" });
    }
    return res.status(201).json({ member, message: "Account successfully created. Welcome to BlogApp" });
};

// login
const logIn = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Fill in all details." });
    }

    const newEmail = email.toLowerCase();

    let existingMember;
    try {
        existingMember = await Member.findOne({ email: newEmail });
    } catch (err) {
        return res.status(500).json({ message: "ERROR!!! Validation interrupted" });
    }
    if (!existingMember) {
        return res.status(404).json({ message: "Email or Password is invalid." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingMember.password);

    if (!isPasswordCorrect) {
        return res.status(404).json({ message: "Email or Password is invalid." });
    }

    const { _id: id, name } = existingMember;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.cookie("authToken", token, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successful", token, id, name });
};

module.exports = {
    signUp,
    logIn,
}