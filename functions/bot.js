require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a link to the video on YouTube"));

const getID = (url) => {
  const regx = url.match(/v=[\w\-\_]{11}|e\/[\w\-\_]{11}/gi);
  return regx.join("").substring(2);
};

bot.on("message", async (ctx) => {
  const url = ctx.message.text;

  if (ctx.message.entities === undefined) {
    ctx.reply("👍");
  } else if (
    (ctx.message.entities[0].type === "url" &&
      url.includes("https://youtu.be/")) ||
    url.includes("https://www.youtube.com/watch?v=")
  ) {
    const options = {
      method: "GET",
      url: `https://youtube-mp36.p.rapidapi.com/dl?id=${getID(url)}`,
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": process.env.API_HOST,
      },
    };

    await axios
      .request(options)
      .then((response) => ctx.replyWithAudio(response.data.link))
      .catch((error) => {
        ctx.reply("Возникла ошибка. Повторите попытку");
        console.error(error);
      });
  } else if (
    !url.includes("https://youtu.be") ||
    !url.includes("https://www.youtube.com")
  ) {
    ctx.reply("😒");
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
