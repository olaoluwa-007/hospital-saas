//import express
const express = require("express");

// import all swagger related packages
// const swaggerUi = require("swagger-ui-express");
// const YAML = require("yamljs");
// const swaggerDocument = YAML.load("./apidoc.yaml");
// const morgan = require("morgan");
const cors = require("cors");
//import fs and path for file handling
const fs = require("fs");
const path = require("path");
const connectDB = require("./database/dbConnection"); // mongoose connection

//instantiate express
const app = express();
app.use(express.json());
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST"],
// }))
require("dotenv").config(); //import .env //mongoose connection
//app.use(morgan("dev"));

//create the routes
const { authRouter } = require("./src/routes/auth.route");

//route to swagger documentation

app.use("/api/v1/auth", authRouter);

//route to grab images uploaded

//it takes 2 parameters the path and the controller
app.get("/", (req, res) => {
  res.end("Welcome to my hospital platform!");
});

//expose our backend through api using server to external requests
const PORT = process.env.PORT;
connectDB(); //connect to the database;
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:9000");
});

//View-where files are kept, Model-Schemas, Controller-fuctions that perform some certain tasks you've scripted them to perform
