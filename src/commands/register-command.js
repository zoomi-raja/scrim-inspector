/**
 * this script is to run only once to register available commands to discord server
 */
require('dotenv').config();
const { REST, Routes } = require('discord.js');
const commandFiles = require('../utils/commandParser');
const commands = [];
for (const command in commandFiles) {
    const cmd = require('../../'+commandFiles[command]);
    if(cmd.name && cmd.description){
        commands.push({
            name: cmd.name,
            description: cmd.description,
            ...(cmd.options? {
                options : cmd.options
            } : {}),
        });
    }
}
if(commands.length <= 0) return;

const rest = new REST({ version: 10 }).setToken(process.env.BOT_TOKEN);
(async () => {
    try{
        console.log( `Registring slash commands...`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.BOT_USER_ID, process.env.SERVER_ID),
            { body: commands }
        );
        console.log( `commands registered successfully 🏳️`);
        process.exit();
    }catch(error) {
        console.log( `🔥 Error while registring command: ${error}`);
    }
    return;
})();