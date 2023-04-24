require("dotenv").config();
const axios = require("axios");
const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Конвертировать YouTube в mp3."));
bot.help((ctx) => ctx.reply("Вставьте ссылку на YouTube."));

const getID = (url) => {
  const id = url.match(/v=[\w\-\_]{11}|e\/[\w\-\_]{11}/gi);
  return id.join("").substring(2);
};

bot.on("message", async (ctx) => {
  const url = ctx.message.text;
  const isYTubeLink = url.includes("https://youtu.be/") || url.includes("https://www.youtube.com/watch?v=")

  if (ctx.message.entities === undefined || !isYTubeLink) {
    ctx.reply("🙂Вставьте ссылку на YouTube. Ваш запрос не поддерживается.");
  } else if ((ctx.message.entities[0].type === "url" && isYTubeLink )) {
    const options = {
      method: "GET",
      url: `${process.env.API_HOST}/dl?id=${getID(url)}`,
      headers: {
        "x-rapidapi-key": process.env.API_KEY,
        "x-rapidapi-host": process.env.API_HOST,
      },
    };

    await axios
      .request(options)
      .then((response) => ctx.reply(response.data.link))
      .catch((error) => {
        ctx.reply("Произошла ошибка. Проверьте ссылку на корректность и повторите попытку.");
        console.error(error);
      });
  }
  // else if (!isYTubeLink) {
  //   ctx.reply("🙂Вставьте ссылку на YouTube. Ваш запрос не поддерживается.");
  // }
});

exports.handler = async (event) => {
  try {
    await bot.handleUpdate(JSON.parse(event.body));
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.error("error in handler:", e);
    return {
      statusCode: 400,
      body: "This endpoint is meant for bot and telegram communication",
    };
  }
};