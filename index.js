const fetch = require('node-fetch');
const { Telegraf, Markup } = require('telegraf');
require('dotenv').config();
const bot = new Telegraf(process.env.TOKEN);
const LocalSession = require('telegraf-session-local');

const localSession = new LocalSession({
    database: 'sessions.json'
})
bot.use(localSession.middleware());

bot.on("text", async (ctx) => {
    ctx.session.state = "linkURL"
    if (ctx.session.state === "linkURL") {
        const isi = ctx.message.text
        const splitURL = isi.split("/video/")
        if(splitURL.length > 1) {
            const isiID = splitURL[1].split("?")[0]
            ctx.session.linkURL = isiID
            if (isiID.length < 19) {
                ctx.reply(`Link Url Salah `)
            } else {
                ctx.reply(`Tunggu sebentar`)
                await DataApiTiktok(ctx)
            }
        } else {
            ctx.reply(`Link Url Salah `)
        }
        ctx.session.state = "" 
    }
})

const DataApiTiktok = async (ctx) => {
    try {
        if (ctx.session.linkURL) {
            const headers = {
                'User-Agent': 'TikTok 26.2.0 rv:262018 (iPhone; iOS 14.4.2; en_US) Cronet'
            };

            const response = await fetch(`https://api16-normal-c-useast1a.tiktokv.com/aweme/v1/feed/?aweme_id=${ctx.session.linkURL}`, {
                headers: headers,
            });

            const data = await response.json();
            const videoUrl = data.aweme_list[0].video.play_addr.url_list[0];
            console.log(`ini data`, videoUrl)
            try {
                await bot.telegram.sendVideo(ctx.chat.id, videoUrl);
            } catch (error) {
                console.log('Error when replying:', error);
            }

        } else {
            console.log('videoId is required');
        }
    } catch (error) {
        console.error(error);
    }
}


bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));