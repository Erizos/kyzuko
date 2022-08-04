const {
  MessageEmbed,
  MessageAttachment,
  MessageActionRow,
  MessageButton,
  ClientVoiceManager,
} = require("discord.js");
const { collection } = require("../../src/models/player");
var Playerdb = require("../../src/models/player");

module.exports = {
  name: "bjstart",
  aliases: [],
  category: "blackjack",
  run: async (client, message, args) => {
    const checkPlayerPB = await Playerdb.findOne({
      discId: message.author.id,
      role: "Player",
    });
    if (checkPlayerPB) return message.reply("Mày đéo phải chủ party");
    const checkAmount = await Playerdb.count({ role: "Player" });
    const thumbnail = new MessageAttachment("imgs/utils/Blackjack-icon.png");
    const errorEmbed = new MessageEmbed()
      .setTitle("Error")
      .setColor("RED")
      .setThumbnail("attachment://Blackjack-icon.png")
      .setTimestamp()
      .setFooter({
        text: client.user.tag,
        iconURL: client.user.displayAvatarURL(),
      });
    if (checkAmount < 1) {
      errorEmbed.setDescription(
        "BlackJack đéo có lỗi, lỗi tại thằng <@508950199381524480>\n:eye: :lips: :eye:\n:point_right: :point_left: \n`操你妈` dịch ra là `đéo đủ người`."
      );
      return message.channel.send({ embeds: [errorEmbed], files: [thumbnail] });
    }

    const startEmbed = new MessageEmbed()
      .setColor("GREEN")
      .setThumbnail("attachment://Blackjack-icon.png")
      .setDescription("Game start!");
    message.channel.send({ embeds: [startEmbed] });
    // console.log(checkAmount + " player(s) is/are available");

    const suits = ["bích", "chuồng", "rô", "cơ"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    // empty array to contain cards
    let deck = [];

    // create a deck of cards
    for (let i = 0; i < suits.length; i++) {
      for (let x = 0; x < values.length; x++) {
        let card = { Value: values[x], Suit: suits[i] };
        deck.push(card);
      }
    }

    // shuffle the cards
    for (let i = deck.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = deck[i];
      deck[i] = deck[j];
      deck[j] = temp;
    }

    function dealCard(deck) {
      return deck.pop();
    }

    // display results
    const messageArray = [];
    const playerArray = [];
    for (let i = 0; i < checkAmount; i++) {
      const playerId = await Playerdb.find({ role: "Player" });
      const user = await client.users.fetch(playerId[i].discId);
      playerArray.push(user.id);

      // Clear mảng lá bài của mỗi người
      Playerdb.findOneAndUpdate(
        {
          discId: playerId[i].discId,
        },
        {
          $set: {
            card: [],
          },
        },
        {
          new: true,
        },
        async (err, doc) => {
          if (err) {
            console.log(err);
          }
        }
      );

      // Chia 2 lá bài đầu tiên cho từng người chơi
      const firstCard = deck.slice(0, 1);
      const secondCard = deck.slice(1, 2);

      deck.splice(0, 2);

      // Upload lá bài vào database
      Playerdb.findOneAndUpdate(
        {
          discId: playerArray[i],
        },
        {
          $push: {
            card: [
              {
                value: firstCard[0].Value,
                suit: firstCard[0].Suit,
              },
              {
                value: secondCard[0].Value,
                suit: secondCard[0].Suit,
              },
            ],
          },
        },
        {
          new: true,
        },
        async (err, doc) => {
          if (err) {
            console.log(err);
          }
        }
      );
          let sentCardMessage = await user.send({
            content: `Bài của mày đây!`,
            files: [
              {
                attachment: `imgs/cards/${firstCard[0].Suit}-${firstCard[0].Value}.png`,
                name: `${firstCard[0].Suit}-${firstCard[0].Value}.png`,
              },
          {
            attachment: `imgs/cards/${secondCard[0].Suit}-${secondCard[0].Value}.png`,
            name: `${secondCard[0].Suit}-${secondCard[0].Value}.png`,
          },
        ],
      });
      messageArray.push(sentCardMessage.id);
    }
    startEmbed.setDescription("Đang chia bài cho từng đứa!");
    message.channel.send({ embeds: [startEmbed] });

    const row = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId("draw")
          .setLabel("Rút")
          .setEmoji("🤌🏻")
          .setStyle("SUCCESS")
      )
      .addComponents(
        new MessageButton()
          .setCustomId("stop")
          .setLabel("Dằn")
          .setEmoji("✋🏿")
          .setStyle("DANGER")
      );

    // turn based function
    let i = 0

    async function loop() {
      console.log(`lá bài còn: ${deck.length}`);
      startEmbed.setDescription(`Tới lượt của <@${playerArray[i]}>`);
      message.channel.send({ embeds: [startEmbed] });
      const editor = await client.users.createDM(playerArray[i]);
      let DMPlayer = playerArray[i];
      const edit = await editor.messages.fetch(messageArray[i]);
      edit.edit({
        content: "Tới mày kìa!",
        components: [row],
      });
      const filter = () => {
        return true;
      };
      const collector = edit.createMessageComponentCollector({
        filter,
        time: 1000 * 30,
      });

      collector.on("collect", async (y) => {
        if (y.customId === "draw") {
          const amountOfCards = await Playerdb.aggregate([
            {
              $match: { discId: DMPlayer },
            },
            {
              $project: {
                cards: { $size: "$card" },
              },
            },
          ]);
          const cardNumber = amountOfCards.map(function (item) {
            return item["cards"];
          });
          if (cardNumber[0] > 4) {
            return y.update({
              content: "Đủ 5 lá rồi má!",
              components: [row],
            });
          }
          let card = dealCard(deck);
          // console.log(`lá bài được rút: ${card.Value}-${card.Suit}`);
          Playerdb.findOneAndUpdate(
            {
              discId: DMPlayer,
            },
            {
              $push: {
                card: [
                  {
                    value: card.Value,
                    suit: card.Suit,
                  },
                ],
              },
            },
            {
              new: true,
            },
            async (err, doc) => {
              if (err) {
                console.log(err);
              }
              // console.log(" đã nhét vào db: " + doc);
              const cardlist = await Playerdb.findOne({
                discId: DMPlayer,
              });
              // console.log(`lá bài hiện tại ${cardlist}`);
              await y.update({
                content: "Đã rút thêm 1 lá",
                files: cardlist.card.map((card) => ({
                  attachment: `imgs/cards/${card.suit}-${card.value}.png`,
                  name: `${card.suit}-${card.value}.png`,
                })),
                components: [row],
              });
            }
          );
        } else if (y.customId === "stop") {
          collector.stop();
            clearTimeout(neededClear);
            if (i > checkAmount) {
              ++i;
              loop();
            }
        
          return y.update({
            content: "done",
            components: [],
          });
        }
      });

      collector.on("end", (collection) => {
        edit.edit({
          content: "Hết thời gian rồi, đã chuyển lượt cho người kế tiếp",
          components: [],
        });
        if (i < checkAmount - 1) {
          ++i;
          console.log("skipped another loop")
          loop();
        } else {
            startEmbed.setDescription("The game ended!")
            message.channel.send({embeds: [startEmbed]})
        }
      });
    }
    let neededClear = setTimeout(loop, 5000);

  },
};
