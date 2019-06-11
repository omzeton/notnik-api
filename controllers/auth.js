const fs = require("fs");
const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Entry = require("../models/entry");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
      email: email,
      password: hashedPw,
      posts: [],
      settings: {
        fontSize: "1",
        menuPosition: "left"
      }
    });
    const result = await user.save();
    res
      .status(201)
      .json({
        message: "New user created",
        userId: result._id.toString(),
        userSettings: user.settings
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found!");
      error.statusCode = 401;
      error.data = errors.array();
      throw error;
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      "iloveuior",
      { expiresIn: "1d" }
    );
    console.log(user.settings);
    res.status(200).json({
      token: token,
      userId: user._id.toString(),
      userSettings: user.settings
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const newPw = req.body.newPassword;
    const uId = req.body.uId;
    let hashedPw;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed!");
      error.data = errors.array();
      error.statusCode = 401;
      throw error;
    }
    hashedPw = await bcrypt.hash(newPw, 12);
    const user = await User.findById(uId);
    user.password = hashedPw;
    const result = await user.save();
    res
      .status(201)
      .json({ message: "Password changed successfully.", result: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const uId = req.body.uId;
    await User.findByIdAndDelete(uId);
    const entries = await Entry.find({ uId: uId });
    if (entries) {
      for (let e of entries) {
        if (e.imgUrl !== "noimage") {
          deleteFile(e.imgUrl);
        }
      }
      await Entry.deleteMany({ uId: uId });
    }
    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const deleteFile = filePath => {
  fs.unlink(filePath, err => {
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;
