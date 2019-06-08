const express = require("express");
const { body } = require("express-validator/check");
const User = require("../models/user");
const authController = require('../controllers/auth');

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-Mail address already exists!');
          }
        });
      })
      .normalizeEmail(),
    body("password", "The password must be 5+ chars long.")
      .trim()
      .isLength({ min: 5 }),
    body("repeatPassword", "The password must be 5+ chars long.")
      .trim()
      .custom((value, { req }) => {
          if (value !== req.body.password) {
              throw new Error("Passwords don't match!");
          }
          return true;
      })
  ],
  authController.signup
);

router.post('/login', authController.login);

module.exports = router;
