const { MessageEmbed } = require("discord.js");
var Playerdb = require("../../src/models/player.js");
const blackjack = require("../../src/functions/blackjack.js");

module.exports = {
  name: "bjbet",
  aliases: [],
  category: "blackjack",
  run: async (client, message, args) => {
    const number = args.join(" ");
    const checkAmount = await Playerdb.findOne({
      discId: message.author.id,
    });
    const error = new MessageEmbed().setColor("RED");
    const response = new MessageEmbed().setColor("GREEN");
    if (!number || isNaN(number)) {
      error.setDescription("Nhập số vô!");
      return message.channel.send({ embeds: [error] });
    }
    if (number > checkAmount.money) {
      error.setDescription("Tiền cược phải ≤ tiền hiện có");
      return message.channel.send({ embeds: [error] });
    }
    blackjack.betMoney(message.author.id, number);

    response.setDescription(
      `Bạn đã cược \`${number}\` vào xì dách! Join lại party xì dách đi thằng loz`
    );
    message.channel.send({ embeds: [response] });
  },
};
