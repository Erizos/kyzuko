const {
  MessageEmbed,
  MessageAttachment,
  MessageActionRow,
  MessageButton,
  ClientVoiceManager,
  MessageSelectMenu,
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
        var weight = parseInt(values[x]);
        if (values[x] == "J" || values[x] == "Q" || values[x] == "K")
          weight = 10;
        if (values[x] == "A") weight = 1;
        let card = { Value: values[x], Suit: suits[i], Weight: weight };
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
          $set: {
            card: [
              {
                value: firstCard[0].Value,
                suit: firstCard[0].Suit,
                weight: firstCard[0].Weight,
              },
              {
                value: secondCard[0].Value,
                suit: secondCard[0].Suit,
                weight: secondCard[0].Weight,
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
      const checkCond = checkInitialCard(
        firstCard[0].Value,
        firstCard[0].Weight,
        secondCard[0].Value,
        secondCard[0].Weight
      );
      let sentCardMessage = await user.send({
        content: checkCond,
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
      if (checkCond == "XÌ DÁCH" || checkCond == "XÌ BẰNG") {
        const index = playerArray.indexOf(playerArray[i]);
        playerArray.splice(index, 1);
      } else {
        messageArray.push(sentCardMessage.id);
      }
    }

    // chia bài cho nhà cái
    const firstDealerCard = deck.slice(0, 1);
    const secondDealerCard = deck.slice(1, 2);
    deck.splice(0, 2);
    const dealerId = await Playerdb.findOne({ role: "Dealer" });
    const dealerUser = await client.users.fetch(dealerId.discId);

    Playerdb.findOneAndUpdate(
      {
        discId: dealerId.discId,
      },
      {
        $set: {
          card: [
            {
              value: firstDealerCard[0].Value,
              suit: firstDealerCard[0].Suit,
              weight: firstDealerCard[0].Weight,
            },
            {
              value: secondDealerCard[0].Value,
              suit: secondDealerCard[0].Suit,
              weight: secondDealerCard[0].Weight,
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
        checkInitialCard(
          firstDealerCard[0].Value,
          firstDealerCard[0].Weight,
          secondDealerCard[0].Value,
          secondDealerCard[0].Weight
        );
      }
    );
    let sentDealerCardMessage = await dealerUser.send({
      content: "Bài của mày đây!",
      files: [
        {
          attachment: `imgs/cards/${firstDealerCard[0].Suit}-${firstDealerCard[0].Value}.png`,
          name: `${firstDealerCard[0].Suit}-${firstDealerCard[0].Value}.png`,
        },
        {
          attachment: `imgs/cards/${secondDealerCard[0].Suit}-${secondDealerCard[0].Value}.png`,
          name: `${secondDealerCard[0].Suit}-${secondDealerCard[0].Value}.png`,
        },
      ],
    });
    messageArray.push(sentDealerCardMessage.id);
    playerArray.push(dealerId.discId);
    // cooldown wait for the shuffle then start the game
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

    const listOfPlayer = await Playerdb.find({ role: "Player" });
    const playerList = new MessageActionRow().addComponents(
      new MessageSelectMenu()
        .setCustomId("player-select")
        .setPlaceholder("Chọn người mà mày muốn xét bài")
        .setMinValues(1)
        .setMaxValues(checkAmount)
        .addOptions(
          listOfPlayer.map((userInfo) => ({
            label: userInfo.discName,
            description: "",
            value: userInfo.discName,
          }))
        )
    );

    // turn based function
    let i = 0;
    async function loop() {
      let DMPlayer = playerArray[i];
      //  check người chơi có phải là dealer ko, nếu ko thì skip lệnh if
      const dealerExist = await Playerdb.countDocuments({
        discId: playerArray[i],
        role: "Dealer",
      });
      if (dealerExist > 0) {
        startEmbed.setDescription(`Tới lượt của nhà cái <@${playerArray[i]}>`);
        message.channel.send({ embeds: [startEmbed] });
        return dealerLoop();
      } else {
        let playerPoint = getPoint(playerArray[i]);
        startEmbed.setDescription(`Tới lượt của <@${playerArray[i]}>`);
        message.channel.send({ embeds: [startEmbed] });
        const editor = await client.users.createDM(playerArray[i]);

        const edit = await editor.messages.fetch(messageArray[i]);
        playerPoint.then(async (playerPoint) => {
          edit.edit({
            content: `Tới mày kìa! Hiện có \`${playerPoint}\` nút`,
            components: [row],
          });
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
                      weight: card.Weight,
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
                let nut = getPoint(DMPlayer);
                nut.then(async (value) => {
                  await y.update({
                    content: `Đã rút thêm 1 lá, hiện có \`${value}\` nút`,
                    files: cardlist.card.map((card) => ({
                      attachment: `imgs/cards/${card.suit}-${card.value}.png`,
                      name: `${card.suit}-${card.value}.png`,
                    })),
                    components: [row],
                  });
                });
                // console.log(`lá bài hiện tại ${cardlist}`);
              }
            );
          } else if (y.customId === "stop") {
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
            startEmbed.setDescription(
              `<@${playerArray[i]}> đã dằn với \`${cardNumber[0]}\` lá`
            );
            message.channel.send({ embeds: [startEmbed] });
            collector.stop();
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

        collector.on("end", async (collection) => {
          edit.edit({
            content: "Hết thời gian rồi, đã chuyển lượt cho người kế tiếp",
            components: [],
          });

          ++i;
          loop();
        });
      }
    }
    // let neededClear = setTimeout(loop, 1000);
    loop();

    function dealerLoop() {
      let dealerPoint = getPoint(message.author.id);
      dealerPoint.then(async (dealerPoint) => {
        sentDealerCardMessage.edit({
          content: `Tới mày kìa! Hiện có \`${dealerPoint}\` nút`,
          components: [playerList, row],
        });
      });
      const filter = () => {
        return true;
      };
      const collector = sentDealerCardMessage.createMessageComponentCollector({
        filter,
      });
      collector.on("collect", async (y) => {
        if (y.customId === "draw") {
          const amountOfCards = await Playerdb.aggregate([
            {
              $match: { discId: message.author.id },
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
          console.log(cardNumber[0]);
          if (cardNumber[0] > 4) {
            return await y.update({
              content: "Đủ 5 lá rồi má!",
              components: [playerList, row],
            });
          }
          let dealerCard = dealCard(deck);
          Playerdb.findOneAndUpdate(
            {
              discId: message.author.id,
            },
            {
              $push: {
                card: [
                  {
                    value: dealerCard.Value,
                    suit: dealerCard.Suit,
                    weight: dealerCard.Weight,
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
          const cardlist = await Playerdb.findOne({
            discId: message.author.id,
          });
          dealerPoint.then(async (value) => {
            await y.update({
              content: `Đã rút thêm 1 lá, hiện có \`${value}\` nút`,
              files: cardlist.card.map((card) => ({
                attachment: `imgs/cards/${card.suit}-${card.value}.png`,
                name: `${card.suit}-${card.value}.png`,
              })),
              components: [playerList, row],
            });
          });
        } else if (y.customId === "stop") {
          console.log("The dealer has stopped");
          collector.stop();
          for (let i = 0; i < playerArray.length; ++i) {
            const checkResult = await Playerdb.findOne({
              discId: message.author.id,
            });
            // console.log(checkResult);
          }
          return y.update({
            content: "done",
            components: [],
          });
        } else if (y.customId === "player-select") {
          const chosenPlayers = y.values[0];
          console.log(chosenPlayers);
          const index = y.values.indexOf(chosenPlayers);
          y.values.splice(index, 1);
          console.log(listOfPlayer);
          dealerLoop();
        }
      });
      collector.on("end", () => {});
    }

    // đếm nút
    async function getPoint(player) {
      const allCard = await Playerdb.findOne({
        discId: player,
      });
      // console.log(allCard.card);
      const foundAce = allCard.card.some((el) => el.value === "A");
      const howManyCards = allCard.card.length;
      let point = 0;
      let result = [];

      // Nếu có con Ace
      console.log(foundAce);
      if (foundAce) {
        point = 0;
        for (let i = 0; i < howManyCards; ++i) {
          result = allCard.card.map((a) => a.weight);
          point += result[i] + 10;
        }
        //Nếu tổng quân bài với A lớn hơn 11 thì A = 1
        if (point < 21) {
          Playerdb.findOneAndUpdate(
            {
              discId: player,
              card: {
                value: "A",
              },
            },
            {
              $set: {
                card: {
                  weight: 11,
                },
              },
            },
            async (err, doc) => {
              point = 0;
              for (let i = 0; i < howManyCards; ++i) {
                result = allCard.card.map((a) => a.weight);
                point += result[i];
              }
            }
          );
        }
      } else {
        result = allCard.card.map((i) => i.weight);
        for (let i = 0; i < howManyCards; ++i) {
          point += result[i];
        }
      }
      return point;
    }

    function checkInitialCard(
      firstCardValue,
      firstCardWeight,
      secondCardValue,
      secondCardWeight
    ) {
      let result = "Bài của mày đây!";
      if (firstCardValue == "A" && secondCardValue == "A") {
        result = "XÌ DÁCH";
        return result;
      }
      if (
        (firstCardValue == "A" && secondCardWeight == "10") ||
        (firstCardWeight == "10" && firstCardValue == "A")
      ) {
        result = "XÌ BÀN";
        return result;
      }
      return result;
    }
  },
};
