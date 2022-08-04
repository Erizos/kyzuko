const { MessageAttachment } = require("discord.js");

module.exports = {
  name: "gospel",
  aliases: ["kinhthanh", "buoi"],
  run: (client, message, args, interaction) => {
    const attachment = new MessageAttachment("imgs/utils/unknown.png");
    message.channel.send({ files: [attachment] });
  },
};
