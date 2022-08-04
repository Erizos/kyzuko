module.exports = {
  name: "ping",
  aliases: ["p"],
  category: "utils",
  run: (client, message, args) => {
    message.reply(`Pong! <:8215bonk:832661725991272479>`);
  },
};
