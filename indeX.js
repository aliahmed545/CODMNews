require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Parser = require('rss-parser');
const { TwitterApi } = require('twitter-api-v2');
const fetch = require('node-fetch');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
});

const parser = new Parser();
const CHANNEL_ID = 'اكتب_هنا_رقم_القناة';

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  checkTwitter();
  checkRSS();
  setInterval(checkTwitter, 5 * 60 * 1000); // كل 5 دقائق
  setInterval(checkRSS, 10 * 60 * 1000);   // كل 10 دقائق
});

client.on('messageCreate', message => {
  if (message.content === '#ping') {
    message.channel.send('Pong!');
  }
});

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER);
let lastTweetId = null;

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

let lastRSS = '';

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

client.login(process.env.DISCORD_TOKEN);
