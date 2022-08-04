const { MessageEmbed, MessageReaction } = require("discord.js");

module.exports = {
  name: "sayd",
  aliases: ["sd"],
  category: "utils",
  run: async (client, message, args) => {
    let msg = args.join(" ");
    const embed = new MessageEmbed()
      .setTitle(`Lời thân thương gửi gắm tới ${message.author.username}`)
      .setColor("RED")
      .setDescription(`Mày chưa nhập gì hết thằng ngu`);
    if (!args[0])
      return message.channel
        .send({ embeds: [embed] })
        .then(message.react("❌"));
    message.delete().catch();
    message.channel.send(msg);
  },
};
