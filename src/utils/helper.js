const { 
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");

const {
    insertMapSpotForCaptain,
    updateMapSpotForCaptain,
    getMapSpotsByTeam,
} = require("../db/models/teamLootSpots");
const { getScrim, getScrimChannel } = require("../db/models/scrims");
const { getScrimTeams } = require("../db/models/scrimTeams");

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

//we are setting particular color for team roles
const isValidTeamRole = ({color}) => {
    const teamTagColor = 1177361;
    //#11f711
    if(!color) return false;
    return color === teamTagColor;
}

const getLootEmbed = ({
    title,
    image,
    customID,
    label,
    disable = false
}) => {
    const embed = new EmbedBuilder()
    .setTitle(title)
    .setImage(image);
    // Create a button
    const button = new ButtonBuilder()
    .setCustomId(customID)
    .setLabel(label)
    .setStyle((!disable) ? ButtonStyle.Success : ButtonStyle.Danger); 
    if(disable){
        button.setDisabled(true);
    }
    const row = new ActionRowBuilder().addComponents(button);
    return {embeds:[embed], components: [row]};
}

const getStatusEmbed = ({
    teamName,
    captainID,
    currentStatus,
}) => {
    const embed = new EmbedBuilder()
    .setTitle(`Team: ${teamName}`)
    .addFields({
        name: 'Taken By',
        value: `<@${captainID}>`,
        inline: false
    },{
        name: 'Lootspot',
        value: `E: ${currentStatus['E']}\nM: ${currentStatus['M']}\nT: ${currentStatus['T']}`,
        inline: false
    });
    return {embeds:[embed]};
}
const updateLootspotClaim = async ({
    map,
    channels,
    teamName,
    spotIndex,
    spotTitle,
    captainID,
    teamRoleID,
    channelMessageID
}) => {
    const currentStatus = {
        E: 'Not Taken Yet',
        M: 'Not Taken Yet',
        T: 'Not Taken Yet'
    }
    const captainSpotData = await getMapSpotsByTeam(teamRoleID);
    let oldMessageId;
    //if no previous spot save spot and send msg to status chanel
    if(captainSpotData){
        captainSpotData.forEach((data)=>{
            currentStatus[data['map']] = data['spot_name'];
            if(Boolean(data['message_id'])){
                oldMessageId = data['message_id'];
            }
        });
    }

    const statusChannel = channels.cache.get(process.env.LOOTSPOT_STATUS_CHANEL);
    if (!statusChannel) {
        console.log("No such status chanel found 🔥");
        return false;
    }

    const insert = currentStatus[map] === 'Not Taken Yet';
    currentStatus[map] = spotTitle;
    //prepare msg
    let message;
    const embed = getStatusEmbed({
        teamName,
        captainID,
        currentStatus,
    });

    if(oldMessageId){
        try {
            const fetchedMessage = await statusChannel.messages.fetch(oldMessageId);
            message = await fetchedMessage.edit(embed)
        } catch (error) {
            console.error(`Message with ID ${oldMessageId}
            not found in channel ${process.env.LOOTSPOT_STATUS_CHANEL}.
            Sending a new message. ${error}`);
            message = await statusChannel.send(embed);
        }
    } else {
        message = await statusChannel.send(embed);
    }

    if(insert){
        await insertMapSpotForCaptain({
            captainID,
            map,
            spotIndex,
            spotName: spotTitle,
            messageID: message?.id,
            teamRoleID,
            channelMessageID
        });
    } else {
        updateMapSpotForCaptain({
            captainID,
            map,
            spotIndex,
            spotName: spotTitle,
            messageID: message?.id,
            teamRoleID,
            channelMessageID
        });
    }
    //if all three spot taken update lobby status
    const countNotTakenYet = Object.values(currentStatus).filter(value => value !== 'Not Taken Yet').length;
    if(countNotTakenYet >=3){
        const {
            id: scrimID
        } = await getScrim({
            serverID: statusChannel.guildId,
        });

        updateLobby({
            scrimID,
            channels
        });
    }
    return true;
}

const formatDate = (date) => {
    const inputDate = new Date(date);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return inputDate.toLocaleDateString('en-US', options);
}

const updateLobby = async({
        scrimID,
        channels,
        client = null
    }) => {
    const {
        scrim_name: scrimName,
        date,
    } = await getScrim({
        scrimID
    });
    const scrimDate = formatDate(date);
    let botIconURl = process.env.DEFAULT_BOT_ICON;
    let botName = "IG - USTAAD G ";
    if(client){
        botIconURl = client.user.avatarURL();
        botName = client.user.username;
    }
    const {
        lobbystatus_channel_id: lobbyStatusChannel
     } = await getScrimChannel(scrimID);
    if(!lobbyStatusChannel){
        return console.error("Error: 'lobby status' channel not found in DB");
    }
    const statusChannel = channels.cache.get(lobbyStatusChannel);
    if (!statusChannel) {
        return  console.error("Error: 'lobby status' channel not found on discord server");
    }
    //todo get lobbies data compensate multiple lobbies 
    await statusChannel.bulkDelete(50);
    const teams = await getScrimTeams(scrimID);
    if(!teams || teams?.length <= 0){
        const embed = new EmbedBuilder()
        .setTitle(`${scrimName} - ${scrimDate}`)
        .setDescription("No teams checked in yet" )
        .setColor(0x0000FF)
        .setFooter({
            text: botName,
            iconURL: botIconURl
        });
        statusChannel.send({embeds:[embed]});
    } else {
        const statusText = await Promise.all(teams.map(async (team, i) => {
            const { role_id: captainID, tier, team_role_id: teamRoleID } = team;
            const captainSpotData = await getMapSpotsByTeam(teamRoleID);
            const emojy = captainSpotData.length >= 3 ?'✅': '❌';
            let count = i +3;
            return `${count}: <@&${teamRoleID}>: <@${captainID}>: ${emojy}\n`;
        }));
        
        const result = statusText.join('');
        const embed = new EmbedBuilder()
        .setTitle(`${scrimName} - ${scrimDate}`)
        .addFields({
            name: 'Reserve',
            value: `**Seat: Team: Cpt: LS**\n${result}`,
        })
        .setColor(0x000000)
        .setFooter({
            text: botName,
            iconURL: botIconURl
        });
        statusChannel.send({embeds:[embed]});
    }
}

module.exports = {
    tempMsg,
    updateLobby,
    getLootEmbed,
    isValidTeamRole,
    updateLootspotClaim,
}