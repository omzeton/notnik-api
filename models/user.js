const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true
    }
  ],
  settings: {
    fontSize: {
      type: String,
      required: true
    },
    menuPosition: {
      type: String,
      required: true
    }
  }
});

module.exports = mongoose.model("User", userSchema);
