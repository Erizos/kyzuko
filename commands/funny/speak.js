const { getAudioUrl } = require("google-tts-api");
const {
  joinVoiceChannel,
  createAudioResource,
  createAudioPlayer,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "speak",
  aliases: ["talk", "voice", "vc"],
  category: "fun",
  run: async (client, message, args) => {
    const error = new MessageEmbed().setColor("RED");
    if (!args[0]) {
      error.setDescription("Muốn t nói gì thì nhập vào đi");
      return message.channel.send({ embeds: [error] });
    }
    const string = args.join(" ");
    if (string.length > 200) {
      error.setDescription("Lạy má nhập ít hơn 200 ký tự!");
      return message.channel.send({ embeds: [error] });
    }
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      error.setDescription("Mày phải ở trong room để tao vào, thằng ngu");
      return message.channel.send({ embeds: [error] });
    }
    const audioURL = await getAudioUrl(string, {
      lang: "vi",
      slow: false,
      host: "https://translate.google.com",
      timeout: 10000,
    });
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });
      const player = createAudioPlayer();
      const resource = createAudioResource(audioURL);
      player.play(resource);
      connection.subscribe(player);
      connection.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });
      // setTimeout(() => connection.destroy(), 10_000);
    } catch (e) {
      error.setDescription("Bot lỗi, thử lại đi");
      message.channel.send({ embeds: [error] });
      console.error(e);
    }
  },
};
