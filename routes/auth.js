const express = require("express");
const { body } = require("express-validator/check");
const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require('../middleware/is-auth');

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
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password", "Password must be 5+ chars long.")
      .trim()
      .isLength({ min: 5 }),
    body("repeatPassword", "Password must be 5+ chars long.")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords don't match");
        }
        return true;
      })
  ],
  authController.signup
);

router.post("/login", authController.login);

router.put(
  "/password-change",
  [
    body("newPassword", "Password must be 5+ chars long.")
      .trim()
      .isLength({ min: 5 }),
    body("repeatPassword", "Password must be 5+ chars long.")
      .trim()
      .isLength({ min: 5 })
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error("Passwords don't match");
        }
        return true;
      })
  ],
  isAuth,
  authController.changePassword
);

router.post("/terminate", isAuth, authController.deleteAccount);

module.exports = router;
