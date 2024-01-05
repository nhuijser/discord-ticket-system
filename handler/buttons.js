const discord = require("discord.js");
const fs = require("fs");

client.buttons = new discord.Collection();

const buttonFiles = fs
  .readdirSync("./buttons/")
  .filter((f) => f.endsWith(".js"));
buttonFiles.forEach((file) => {
  require(`../buttons/${file}`);
});
console.log(`${buttonFiles.length} Buttons Loaded`);
