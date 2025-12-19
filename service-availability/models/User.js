const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,          // hashed
  facilityId: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model("User", UserSchema);