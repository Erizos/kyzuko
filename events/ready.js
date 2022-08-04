require("dotenv").config();
const mongoose = require("mongoose");

module.exports = (client) => {
  console.log("Bot thiểu neng đã ready!");
  client.user.setPresence({
    activities: [{ name: "hentaiz.vip" }],
    status: "dnd",
  });
};
