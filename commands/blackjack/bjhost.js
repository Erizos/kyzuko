const { MessageEmbed, MessageAttachment } = require("discord.js");
const { collection } = require("../../src/models/player");
var Playerdb = require("../../src/models/player");

const blackjack = require("../../src/functions/blackjack.js");

module.exports = {
  name: "bjhost",
  aliases: [],
  category: "blackjack",
  run: async (client, message, args) => {
    //đăng kí người mới vào database
    const author = message.author;
    Playerdb.findOne({ discId: message.author.id }).then((user) => {
      if (!user) {
        //Người nhập lệnh sẽ làm dealer khi ko có trong database
        const dealer = new Playerdb({
          discId: message.author.id,
          discName: message.author.tag,
          role: "Dealer",
        });
        dealer.save(dealer);
      } else {
        blackjack.becomeDealer(message.author.id);
      }
    });
    let list = "";
    const resentPlayer = await Playerdb.find({ role: "Player" });
    for (const i in resentPlayer) {
      list += `${parseInt(i) + 1}. <@${resentPlayer[i].discId}> đang cược \`${
        resentPlayer[i].bet
      }\`\n`;
    }
    const thumbnail = new MessageAttachment("imgs/utils/Blackjack-icon.png");
    const exec = new MessageEmbed()
      .setAuthor({
        name: "Vào chơi xì dách đi bọn ml",
        iconURL: message.author.displayAvatarURL(),
      })
      .setColor("GREEN")
      .setThumbnail("attachment://Blackjack-icon.png")
      .setDescription(
        `${message.author} đang host xì dách\nTick ✅ để tham gia party\n\`-bjbet {tiền cược}\` để cược trước khi vào party\nParty này sẽ tự timeout sau 5p`
      )
      .addFields(
        { name: "Nhà cái:", value: `👑 ${message.author}` },
        {
          name: "Người tham gia:",
          value: list || "Chưa ai tham gia cả",
        }
      )
      .setTimestamp()
      .setFooter({
        text: client.user.tag,
        iconURL: client.user.displayAvatarURL(),
      });
    message.channel
      .send({ embeds: [exec], files: [thumbnail] })
      .then(async (sentMessage) => {
        await sentMessage.react("✅");

        const filter = (reaction, user) => {
          return (
            ["✅"].includes(reaction.emoji.name) &&
            user.id !== message.author.id &&
            user.id !== sentMessage.author.id
          );
        };
        const collector = sentMessage.createReactionCollector({
          filter,
          time: 300000,
        });

        collector.on("collect", async (reaction, user) => {
          //if (sentMessage.author.bot) return;
          const reactor = user.id;

          Playerdb.findOne({ discId: reactor }).then(async (data) => {
            if (!data) {
              //Người tham gia sẽ làm player khi ko có trong database
              //console.log(reactor);
              const player = new Playerdb({
                discId: reactor,
                discName: user.tag,
                role: "",
              });
              player.save(player);
              message.channel
                .send(
                  `${user} Bạn hiện có \`${player.money}\` VNĐ, bạn muốn cược bao nhiêu?`
                )
                .then(async (askMessage) => {
                  const msg_filter = (message) => message.member.id === reactor;
                  askMessage.channel
                    .awaitMessages({
                      filter: msg_filter,
                      max: 1,
                    })
                    .then((collection) => {
                      const replyMessage = collection.first();
                      if (replyMessage < player.money) {
                        blackjack.editRole(reactor, undefined);
                        return replyMessage.reply(
                          "Tiền cược phải ≤ tiền hiện có"
                        );
                      }
                      if (isNaN(replyMessage.content)) {
                        blackjack.editRole(reactor, "");
                        return message.reply("Đấy đéo phải số! Thằng lồn");
                      }
                      Playerdb.findOneAndUpdate(
                        { discId: reactor },
                        { $set: { role: "Player", bet: replyMessage.content } },
                        { new: true },
                        async (err, doc) => {
                          if (err) {
                            console.log("Something wrong when updating data!");
                          }
                          //console.log(doc);
                          const refindPlayer = await Playerdb.find({
                            role: "Player",
                          });
                          let additionlist = "";
                          list = additionlist;
                          for (const i in refindPlayer) {
                            list += `${parseInt(i) + 1}. <@${
                              refindPlayer[i].discId
                            }> đang cược \`${refindPlayer[i].bet}\`\n`;
                          }
                          const newexec = new MessageEmbed()
                            .setAuthor({
                              name: "Vào chơi xì dách đi bọn ml",
                              iconURL: message.author.displayAvatarURL(),
                            })
                            .setColor("GREEN")
                            .setThumbnail("attachment://Blackjack-icon.png")
                            .setDescription(
                              `${message.author} đang host xì dách\nTick ✅ để tham gia party\n\`-bjbet {tiền cược}\` để cược trước khi vào party`
                            )
                            .addFields(
                              {
                                name: "Nhà cái:",
                                value: `👑 ${message.author}`,
                              },
                              {
                                name: "Người tham gia:",
                                value: list || "Chưa ai tham gia cả",
                              }
                            )
                            .setTimestamp()
                            .setFooter({
                              text: client.user.tag,
                              iconURL: client.user.displayAvatarURL(),
                            });
                          sentMessage.edit({ embeds: [newexec] });
                          console.log(
                            `${reaction.emoji.name} ${user.tag} joined the party`
                          );
                        }
                      );
                    });
                });
            } else {
              const existingPlayer = await Playerdb.findOne({
                discId: reactor,
              }); //Người tham gia sẽ làm player khi có trong database
              if (existingPlayer.bet == undefined) {
                const error = new MessageEmbed()
                  .setColor("RED")
                  .setDescription(
                    `${user} Bạn chưa đặt cược tiền, nhập lệnh \`!bjbet {số tiền cược}\` rồi join lại party!`
                  );
                return message.channel.send({
                  embeds: [error],
                });
              }
              Playerdb.findOneAndUpdate(
                { discId: reactor },
                { $set: { role: "Player" } },
                { new: true },
                async (err, doc) => {
                  if (err) {
                    console.log("Something wrong when updating data!");
                  }
                  //console.log(doc);
                  let additionlist = "";
                  list = additionlist;
                  const refindPlayer = await Playerdb.find({ role: "Player" });
                  for (const i in refindPlayer) {
                    list += `${parseInt(i) + 1}. <@${
                      refindPlayer[i].discId
                    }> đang cược \`${refindPlayer[i].bet}\`\n`;
                  }
                  const newexec = new MessageEmbed()
                    .setAuthor({
                      name: "Vào chơi xì dách đi bọn ml",
                      iconURL: message.author.displayAvatarURL(),
                    })
                    .setColor("GREEN")
                    .setThumbnail("attachment://Blackjack-icon.png")
                    .setDescription(
                      `${message.author} đang host xì dách\nTick ✅ để tham gia party\n\`-bjbet {tiền cược}\` để cược trước khi vào party`
                    )
                    .addFields(
                      { name: "Nhà cái:", value: `👑 ${message.author}` },
                      {
                        name: "Người tham gia:",
                        value: list || "Chưa ai tham gia cả",
                      }
                    )
                    .setTimestamp()
                    .setFooter({
                      text: client.user.tag,
                      iconURL: client.user.displayAvatarURL(),
                    });
                  sentMessage.edit({ embeds: [newexec] });
                }
              );
            }
          });
        });

        collector.on("end", async (message) => {
          if (!sentMessage) return;
          const timedOut = new MessageEmbed()
            .setAuthor({
              name: "Timeout!",
              iconURL: author.displayAvatarURL(),
            })
            .setColor("RED")
            .setThumbnail("attachment://Blackjack-icon.png")
            .setDescription("Timeout rồi mấy con đĩ\n`!bjhost` để host lại")
            .setTimestamp()
            .setFooter({
              text: client.user.tag,
              iconURL: client.user.displayAvatarURL(),
            });
          sentMessage.edit({ embeds: [timedOut] });
          sentMessage.reactions
            .removeAll()
            .catch((error) =>
              console.error("Failed to clear reactions:", error)
            );
        });
      });
  },
};
