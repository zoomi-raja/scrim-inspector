require('dotenv').config();
const { Client, IntentsBitField} = require('discord.js');
const commandFiles = require('./utils/commandParser');
const { tempMsg } = require('./utils/helper');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready',(c) => {
    console.log(  'The bot is ready '+ c.user.username)
});



client.on('interactionCreate', async (interaction) => {
    if(!interaction.isChatInputCommand()) return;
    
    try{
        const index = interaction.commandName;
        const command = require('../'+commandFiles[index]);
        
        if(!command.openCommand){
            //check for staff role
            const isAdmin = interaction.member.roles.cache.has( process.env.STAFF_ROLE_ID );
            
            if(!Boolean(isAdmin)){
                return await tempMsg({
                    text:`You are not Staff Member :anguished:`,
                    interaction,
                });
            }
        }
        await command.execute(interaction);
    } catch (error){
        console.log(error);
        console.log( `🔥 Error in command: ${error}`);
    }
})

client.on('messageCreate',(msg) => {
    if(msg.author.bot)return;
    // msg.reply(`its good 💩`).then(sentMessage => {
    //     // Set a timeout to delete the message after 5 seconds (5000 milliseconds)
    //     setTimeout(() => {
    //       sentMessage.delete();
    //     }, 5000);
    //   })
    //   .catch(console.error);;
    // msg.channel.send('Hello Jiii');
    console.log(commandFiles);
})
client.login(process.env.BOT_TOKEN);