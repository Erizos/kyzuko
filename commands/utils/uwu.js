const { MessageAttachment } = require("discord.js");

module.exports = {
  name: "uwu",
  aliases: [],
  category: "utils",
  run: (client, message, args) => {
    const attachment = new MessageAttachment(
      "imgs/emojis/fuhua-chibi-cute4maiwe.gif"
    );
    message.channel.send({ files: [attachment] });
  },
};
