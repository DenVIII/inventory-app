// app.js
const express = require("express");
const path = require("path");
require("dotenv").config();

const PORT = process.env.PORT || 3000;
const app = express();
const homeRouter = require("./routes/homeRoute");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use("/", homeRouter);

app.listen(PORT, () => console.log(`Server is running at: localhost:${PORT}`));
