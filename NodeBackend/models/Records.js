const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema({
  consoleid: {
    type: String,
    required: true,
  },

  callhours: {
    type: String,
    required: true,
  },
  collmints: {
    type: String,
    required: true,
  },

  call1: { type: String, default: "" }, // Set default value to ''
  call2: { type: String, default: "" },
  call3: { type: String, default: "" },
});

const RecordModel = mongoose.model("recordcollection", RecordSchema);

module.exports = RecordModel;
