const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => app.listen(process.env.PORT))
.then(() => console.log(`Connection successful, please check port ${process.env.PORT}!`))
.catch((err) => console.log(err));

module.exports = app;