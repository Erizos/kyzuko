// Require the necessary discord.js classes
const { Client, Intents, Collection } = require("discord.js");
require("dotenv").config();

const connectDB = require("./src/connection/connection");

// Create a new client instance
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_PRESENCES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});

client.commands = new Collection();
client.aliases = new Collection();
client.categories = new Collection();

["command", "event"].forEach((handler) =>
  require(`./handlers/${handler}`)(client)
);

// Connect to database
connectDB();

// Login to Discord with your client's token
client.login(process.env.TOKEN);
