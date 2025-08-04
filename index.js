// استدعاء المكتبات المطلوبة
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const { TwitterApi } = require('twitter-api-v2');
const fetch = require('node-fetch');

// إعداد عميل الديسكورد
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// متغير لتخزين معرف قناة الأخبار (غيرّه برقم القناة عندك)
const CHANNEL_ID = 'اكتب_هنا_رقم_القناة';

// إنشاء محلل RSS
const parser = new Parser();

// إنشاء عميل تويتر
const twitterClient = new TwitterApi(process.env.TWITTER_BEARER);

// لتتبع آخر تغريدة حتى لا يعيد نشر نفس التغريدة
let lastTweetId = null;

// لتتبع آخر خبر من RSS
let lastRSS = '';

// عند تشغيل البوت
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  // تنفيذ التحقق الأولي
  checkTwitter();
  checkRSS();

  // فحص تويتر كل 5 دقائق
  setInterval(checkTwitter, 5 * 60 * 1000);

  // فحص RSS كل 10 دقائق
  setInterval(checkRSS, 10 * 60 * 1000);
});

// أمر بسيط للتأكد من عمل البوت
client.on('messageCreate', message => {
  if (message.content === '#ping') {
    message.reply('🏓 Pong!');
  }
});

// دالة التحقق من تغريدات تويتر
async function checkTwitter() {
  try {
    const tweets = await twitterClient.v2.userTimeline('1059023053850216448', {
      exclude: 'replies',
      max_results: 5
    });

    const tweet = tweets.data?.data?.[0];
    if (tweet && tweet.id !== lastTweetId) {
      lastTweetId = tweet.id;
      const url = `https://twitter.com/PlayCODMobile/status/${tweet.id}`;
      const channel = await client.channels.fetch(CHANNEL_ID);
      channel.send(`🟦 تويتر COD Mobile:\n${tweet.text}\n${url}`);
    }
  } catch (err) {
    console.error('Twitter error:', err);
  }
}

// دالة التحقق من أخبار الموقع الرسمي عبر RSS
async function checkRSS() {
  try {
    const feed = await parser.parseURL('https://www.callofduty.com/content/atvi/callofduty/cod-touchui/en/home/headlines-feed.html');
    const latest = feed.items[0];
    if (latest.link !== lastRSS) {
      lastRSS = latest.link;
      const channel = await client.channels.fetch(CHANNEL_ID);
      channel.send(`📰 خبر جديد من الموقع الرسمي:\n**${latest.title}**\n${latest.link}`);
    }
  } catch (err) {
    console.error('RSS error:', err);
  }
}

// تسجيل الدخول إلى Discord باستخدام التوكن من ملف .env
client.login(process.env.DISCORD_TOKEN);
