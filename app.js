const Discord = require('discord.js');
const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json());

const bot = new Discord.Client();
const webhookUrl = process.env.WEBHOOK_URL;
const channelID = process.env.CHANNEL_ID;

bot.on('ready', () => {
  console.log('Bot is ready');
});

bot.on('message', msg => {
  console.log('Received a message');
  if (msg.channel.id === channelID && msg.author.bot && msg.attachments.first()) {
    console.log('Conditions met, sending image to Glide');
    axios.post('http://example.com/receiveImage', {
      imageUrl: msg.attachments.first().url
    })
    .then(response => {
      console.log('Image sent to Glide:', response.status);
    })
    .catch(error => {
      console.error('Error sending image to Glide:', error);
    });
  } else {
    console.log('Conditions not met, ignoring message');
  }
});

bot.login(process.env.BOT_TOKEN).catch(error => console.error('Error logging in bot:', error));

app.post('/sendDiscordMessage', (req, res) => {
  console.log('Received POST from Glide');

  const rowID = req.body.params.rowID?.value;
  const message = req.body.params.message?.value;

  if (!rowID || !message) {
    console.error('rowID or message not provided');
    return res.sendStatus(400);
  }

  console.log('Sending message to Discord');
  axios({
    method: 'post',
    url: webhookUrl,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      "content": message
    }
  })
  .then(response => {
    console.log('Message sent successfully:', response.status);
    res.sendStatus(response.status);
  })
  .catch(error => {
    console.error('Error sending message to Discord:', error);
    res.sendStatus(500);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
