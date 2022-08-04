module.exports = {
  name: "say",
  category: "utils",
  aliases: ["s"],
  run: (client, message, args) => {
    let msg = args.join(" ");
    message.channel.send(msg);
  },
};
