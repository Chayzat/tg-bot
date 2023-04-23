require("dotenv").config();
const axios = require("axios");

const { Telegraf } = require("telegraf")
const bot = new Telegraf(process.env.BOT_TOKEN)

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

// bot.launch();

// process.once("SIGINT", () => bot.stop("SIGINT"));
// process.once("SIGTERM", () => bot.stop("SIGTERM"));

bot.command('thumbsup', async (ctx) => {
    try {
        ctx.reply('Here you go 👍!')
    } catch (error) {
        console.log('error', error)
        ctx.reply('error sending image')
    }
})

exports.handler = async event => {
  try {
    await bot.handleUpdate(JSON.parse(event.body))
    return { statusCode: 200, body: "" }
  } catch (e) {
    console.error("error in handler:", e)
    return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" }
  }
}