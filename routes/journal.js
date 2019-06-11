const express = require("express");
const { body } = require("express-validator/check");

const journalController = require("../controllers/journal");

const router = express.Router();

// POST to GET /journal/entries
router.post(
  "/entries",
  [
    body("uId")
      .trim()
      .isLength({ min: 1 })
  ],
  journalController.getEntries
);

// POST /journal/entry
router.post(
  "/entry",
  [
    body("title")
      .trim()
      .isLength({ min: 1 }),
    body("body")
      .trim()
      .isLength({ min: 1 }),
    body("uId")
      .trim()
      .isLength({ min: 1 })
  ],
  journalController.createEntry
);

router.get("/entry/:entryId", journalController.getEntry);

router.put(
  "/entry/:entryId",
  [
    body("title")
      .trim()
      .isLength({ min: 1 }),
    body("body")
      .trim()
      .isLength({ min: 1 }),
    body("uId")
      .trim()
      .isLength({ min: 1 })
  ],
  journalController.updateEntry
);

router.delete("/entry/:entryId", journalController.deleteEntry);

router.post("/font-size", journalController.postFontSize);

router.post("/menu-position", journalController.postMenuPosition);

module.exports = router;
