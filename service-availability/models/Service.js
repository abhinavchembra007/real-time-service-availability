const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Facility"
  },
  name: String,
  status: {
    type: String,
    default: "Available"
  }
});

module.exports = mongoose.model("Service", ServiceSchema);