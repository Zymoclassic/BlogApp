const express = require("express");
const mongoose = require("mongoose");
const Homepage = require("./routes/Homepage");
const AuthRouter = require("./routes/AuthRoutes");
const PostRouter = require("./routes/PostRoutes");
const MemberRouter = require("./routes/MemberRoutes");
const dotenv = require('dotenv');
dotenv.config();

const app = express();

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Routes
app.use("/", Homepage)
app.use("/auth", AuthRouter);
app.use("/member", MemberRouter);
app.use("/posts", PostRouter);

// Connection to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => app.listen(process.env.PORT))
.then(() => console.log(`Connection successful, please check port ${process.env.PORT}!`))
.catch((err) => console.log(err));

module.exports = app;