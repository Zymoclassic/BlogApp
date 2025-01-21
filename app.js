const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const Homepage = require("./routes/Homepage");
const AuthRouter = require("./routes/AuthRoutes");
const PostRouter = require("./routes/PostRoutes");
const MemberRouter = require("./routes/MemberRoutes");
const { notFound } = require("./utils/errorMiddleware");
const fileUpload = require("express-fileupload");
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();


const app = express();
const uploadDir = path.join(__dirname, 'uploads');


// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(cors({credentials: true, origin: "*"}));
app.use(fileUpload({createParentPath: true}));
app.use('/uploads', express.static(uploadDir));


// Routes
app.use("/", Homepage)
app.use("/auth", AuthRouter);
app.use("/member", MemberRouter);
app.use("/posts", PostRouter);
app.use(notFound);


// Check if folder exists, If not then create the folder.
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'));
}


// Connection to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => app.listen(process.env.PORT))
.then(() => console.log(`Connection successful, please check port ${process.env.PORT}!`))
.catch((err) => console.log(err));

module.exports = app;