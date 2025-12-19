const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema({
  name: String,
  type: String, // Campus, Hotel, Hospital, Office
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Facility", FacilitySchema);