const { MessageEmbed, MessageAttachment } = require("discord.js");
var Playerdb = require("../models/player");

module.exports = {
  betMoney: function (id, number) {
    Playerdb.findOneAndUpdate(
      {
        discId: id,
      },
      { $set: { bet: number } },
      { new: true },
      (err, doc) => {
        if (err) {
          console.log("Something wrong when updating data!");
        }
        //console.log(doc);
      }
    );
  },
  becomeDealer: function (userId) {
    Playerdb.findOneAndUpdate(
      //Người nhập lệnh sẽ làm dealer khi có trong database
      { discId: userId },
      { $set: { role: "Dealer" } },
      { new: true },
      (err, doc) => {
        if (err) {
          console.log("The error has occured");
        }
      }
    );
  },

  editRole: function (userId, role) {
    Playerdb.findOneAndUpdate(
      { discId: userId },
      { $get: { role: role } },
      { new: true }
    );
  },
};
