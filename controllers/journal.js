const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator/check");
const Entry = require("../models/entry");
const User = require("../models/user");

function getCurrentDate() {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let minutes = today.getMinutes();
  let hours = today.getHours();
  let yyyy = today.getFullYear();
  let date;

  if (dd < 10) {
    dd = "0" + dd;
  }
  if (mm < 10) {
    mm = "0" + mm;
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  date = yyyy + "-" + mm + "-" + dd + " - " + hours + ":" + minutes;

  return date;
}

exports.getEntries = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation error - incorrect user id.");
    error.statusCode = 422;
    throw error;
  }
  Entry.find({ uId: req.body.uId })
    .then(entries => {
      res.status(200).json({
        message: "Entries fetched successfully!",
        entries: entries
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createEntry = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation error - felonious submission data.");
    error.statusCode = 422;
    throw error;
  }
  let imgUrl = req.body.imgUrl;
  if (!req.file) {
    imgUrl = "noimage";
  } else {
    imgUrl = req.file.path.replace("\\", "/");
  }
  try {
    const title = req.body.title;
    const body = req.body.body;
    const date = getCurrentDate();
    const uId = req.body.uId;
    const entry = new Entry({
      title: title,
      body: body,
      date: date,
      imgUrl: imgUrl,
      uId: uId
    });
    const newEntry = await entry.save();
    const user = await User.findById(uId);
    user.posts.push(entry);
    await user.save();
    res.status(201).json({
      message: "Entry created successfully!",
      entry: newEntry
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getEntry = (req, res, next) => {
  const entryId = req.params.entryId;
  Entry.findById(entryId)
    .then(entry => {
      res.status(200).json({
        message: "Singular entry fetched successfully!",
        entry: entry
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateEntry = async (req, res, next) => {
  const errors = validationResult(req);
  let imageUrl;
  if (!errors.isEmpty()) {
    const error = new Error("Validation error - felonious submission data.");
    error.statusCode = 422;
    throw error;
  }
  try {
    if (req.file) {
      imageUrl = req.file.path.replace("\\", "/");
    }
    const title = req.body.title;
    const body = req.body.body;
    const date = req.body.date;
    const uId = req.body.uId;
    const entryId = req.params.entryId;
    const entry = await Entry.findById(entryId);
    if (imageUrl && entry.imgUrl !== imageUrl) {
      clearImage(entry.imgUrl);
    }
    entry.title = title;
    entry.body = body;
    entry.date = date;
    if (imageUrl) {
      entry.imgUrl = imageUrl;
    }
    entry.uId = uId;
    await entry.save();
    res.status(201).json({
      message: "Entry updated successfully!"
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteEntry = async (req, res, next) => {
  const entryId = req.params.entryId;
  try {
    const entry = await Entry.findById(entryId);
    const userId = entry.uId;
    const imgUrl = entry.imgUrl;
    await Entry.findByIdAndDelete(entryId);
    await User.findByIdAndUpdate(
      { _id: userId },
      { $pullAll: { posts: [entryId] } }
    );
    if (imgUrl !== "noimage") {
      clearImage(imgUrl);
    }
    res.status(201).json({
      message: "Entry successfully deleted!"
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postFontSize = async (req, res, next) => {
  try {
    const newFontSize = req.body.newFontSize;
    const userId = req.body.userId;
    const user = await User.findById(userId);
    user.settings.fontSize = newFontSize;
    await user.save();
    res.status(200).json({ message: "Font size updated successfully!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postMenuPosition = async (req, res, next) => {
  try {
    const newMenuPos = req.body.newMenuPosition;
    const userId = req.body.userId;
    const user = await User.findById(userId);
    user.settings.menuPosition = newMenuPos;
    await user.save();
    res.status(200).json({ message: "Menu position updated successfully!" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => console.log(err));
};
