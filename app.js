const Discord = require('discord.js');
const axios = require('axios');
const express = require('express');
require('dotenv').config(); // to load variables from .env file into process.env

const app = express();
app.use(express.json());

const bot = new Discord.Client();
const webhookUrl = process.env.WEBHOOK_URL; // replace with your webhook URL
const channelID = process.env.DISCORD_CHANNEL_ID; // replace with your channel ID

bot.on('ready', () => {
  console.log('Bot is ready');
});

bot.on('message', msg => {
  console.log('Message received on Discord');
  if (msg.channel.id === channelID && msg.author.bot && msg.attachments.first()) {
    console.log('Sending image to Glide');
    // Replace 'http://example.com/receiveImage' with your Glide API endpoint
    axios.post('http://example.com/receiveImage', {
      imageUrl: msg.attachments.first().url
    })
    .then(response => {
      console.log('Image sent to Glide:', response.status);
    })
    .catch(error => {
      console.error('Error sending image to Glide:', error);
    });
  }
});

bot.login(process.env.BOT_TOKEN);

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
    if (error.response) {
      console.log('Error response from Discord:', error.response.status);
      console.log(error.response.data);
      console.log(error.response.headers);
      res.sendStatus(error.response.status);
    } else if (error.request) {
      console.log('Error request:', error.request);
    } else {
      console.log('Error:', error.message);
    }
    console.log('Error config:', error.config);
    res.sendStatus(500);
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));
