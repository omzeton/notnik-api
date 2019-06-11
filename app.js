const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@cluster0-p7rod.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true`;

const fs = require("fs");
const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const uuidv4 = require("uuid/v4");
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");

const journalRoutes = require("./routes/journal.js");
const authRoutes = require("./routes/auth.js");

const app = express();


const fileStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "images");
  },
  filename: function(req, file, cb) {
    cb(null, uuidv4());
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/gif" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("imgUrl")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/journal", journalRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  let newError;
  if (error.data) {
    newError = error.data[0];
  } else {
    newError = error;
  }
  const status = newError.statusCode || 500;
  const message = newError.msg;
  res.status(status).json({ message: message });
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => {
    console.log("Systems online.");
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });
