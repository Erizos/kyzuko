const mongoose = require("mongoose");

var schema = new mongoose.Schema({
  discId: {
    type: String,
    require: true,
  },
  discName: {
    type: String,
  },
  role: {
    type: String,
    require: true,
  },
  money: {
    type: Number,
    default: 50000,
    require: true,
    min: 0,
  },
  bet: {
    type: Number,
    require: true,
    max: 1000000,
  },
  card: [
    {
      value: String,
      suit: String,
      weight: Number,
    },
  ],
  totalWeight: {
    type: Number,
    require: true,
  },
});

const Playerdb = mongoose.model("playerdb", schema);

module.exports = Playerdb;
