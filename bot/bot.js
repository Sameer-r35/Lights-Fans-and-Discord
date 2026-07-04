require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Groq = require('groq-sdk');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const BACKEND_URL = 'http://localhost:5000';

function preprocessData(data) {
  const clone = JSON.parse(JSON.stringify(data));
  if (clone.devices && Array.isArray(clone.devices)) {
    clone.devices.forEach(d => {
      if (d.turnedOnAt) {
        d.turnedOnAt = new Date(d.turnedOnAt).toLocaleString();
      }
      if (d.lastUpdated) {
        d.lastUpdated = new Date(d.lastUpdated).toLocaleString();
      }
    });
  }
  return clone;
}

async function generateResponse(jsonData) {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a friendly office assistant. Convert this JSON device state into a natural, conversational, and brief response for the boss. Never use placeholders like [insert date], use the actual provided human-readable timestamps."
        },
        {
          role: "user",
          content: JSON.stringify(jsonData, null, 2)
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 256,
    });
    
    return chatCompletion.choices[0]?.message?.content || "Sorry, I couldn't process the state right now.";
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return "Encountered an error while trying to process the data with the LLM. Please check console logs.";
  }
}

client.once('clientReady', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    if (command === '!status') {
      message.channel.sendTyping();
      const response = await axios.get(`${BACKEND_URL}/api/status`);
      
      const replyMessage = await generateResponse(preprocessData(response.data));
      message.reply(replyMessage);
    } 
    else if (command === '!room') {
      const roomName = args.join(' ');
      if (!roomName) {
        return message.reply("Please specify a room name, e.g., `!room Drawing Room`");
      }
      
      message.channel.sendTyping();
      const response = await axios.get(`${BACKEND_URL}/api/status`);
      
      // Filter the devices by room (case-insensitive)
      const filteredDevices = response.data.devices.filter(d => 
        d.room.toLowerCase() === roomName.toLowerCase()
      );
      
      if (filteredDevices.length === 0) {
        return message.reply(`I couldn't find any devices in the room "${roomName}".`);
      }
      
      // Calculate current wattage for just this room
      const roomWattage = filteredDevices.reduce((sum, d) => sum + (d.status === 'ON' ? d.wattage : 0), 0);
      
      const filteredData = {
        room: roomName,
        totalDevices: filteredDevices.length,
        devices: filteredDevices,
        totalRoomWattage: roomWattage
      };
      
      const replyMessage = await generateResponse(preprocessData(filteredData));
      message.reply(replyMessage);
    }
    else if (command === '!usage') {
      message.channel.sendTyping();
      const response = await axios.get(`${BACKEND_URL}/api/status`);
      
      // current total wattage is provided by the API in Watts.
      const currentWattage = response.data.metrics.totalPower;
      
      // Calculate estimated daily kWh (assuming the current wattage is maintained for 24h)
      // kWh = (Watts / 1000) * 24
      const dailyKWh = ((currentWattage / 1000) * 24).toFixed(2);
      
      const usageData = {
        currentTotalWattage: currentWattage,
        estimatedDailyKWh: parseFloat(dailyKWh)
      };
      
      const replyMessage = await generateResponse(usageData);
      message.reply(replyMessage);
    }
  } catch (error) {
    console.error("Error processing command:", error.message);
    message.reply("Sorry, I encountered an error communicating with the backend or LLM API.");
  }
});

client.login(process.env.DISCORD_TOKEN);
