const { EmbedBuilder } = require("discord.js");
const alertType = {
    DANGER : 0xD10000,
    SUCCESS : 0xED321,
}
const tempMsg = async ({interaction, text}) => {
    try{
        const sentMessage= await interaction.reply({
            content: text,
            ephemeral: true,
        });
        // Set a timeout to delete the message after 5 seconds (5000 milliseconds)
        setTimeout(() => {
            sentMessage.delete();
        }, 5000);
        
    }catch( error ){
        console.log(`Error while replying to interaction : ${interaction}`);
    }
}

const alertMsg = async ({interaction, text, type = alertType.DANGER, temp = true }) => {
    const botIconURl = interaction.client.user.avatarURL()??process.env.DEFAULT_BOT_ICON;
    try{
        const embed = new EmbedBuilder()
        .setTitle('Notification..!')
        .setDescription(text)
        .setColor(type)
        .setFooter({
            text: temp?'Message gets deleted in 5 seconds': interaction.client.user.username,
            iconURL: botIconURl
        });
        const sentMessage= await interaction.reply({
            embeds:[embed],
            ephemeral: !!temp,
        });
        if(temp){
            // Set a timeout to delete the message after 5 seconds (5000 milliseconds)
            setTimeout(() => {
                sentMessage.delete();
            }, 5000);
        }
        return sentMessage;
        
    }catch( error ){
        console.log(`Error while replying to interaction : ${interaction}`);
    }
}

module.exports = {
    tempMsg,
    alertMsg,
    alertType,
}