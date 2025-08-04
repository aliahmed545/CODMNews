// استدعاء المكتبات المطلوبة
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

// إنشاء عميل جديد للبوت
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// لما يكون البوت جاهز
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// الرد على أمر #ping
client.on('messageCreate', message => {
  if (message.content === '#ping') {
    message.reply('🏓 Pong!');
  }
});

// تسجيل الدخول باستخدام التوكن من .env
client.login(process.env.DISCORD_TOKEN);
