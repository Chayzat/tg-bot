require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("Send me a link to the video on YouTube"));

bot.on("message", async (ctx) => {
  if (ctx.message.entities === undefined) {
    ctx.reply("👍");
  } else if (ctx.message.entities[0].type === "url") {
    const url = ctx.message.text;
    const regx = url.match(/v=[\w\-\_]{11}|e\/[\w\-\_]{11}/gi);
    const id = regx.join("").substring(2);

    const options = {
      method: "GET",
      url: `https://youtube-mp36.p.rapidapi.com/dl?id=${id}`,
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
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
