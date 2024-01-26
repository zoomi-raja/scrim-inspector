const { 
    ApplicationCommandOptionType,
    ChannelType,
    PermissionsBitField,
    ActionRowBuilder,
    UserSelectMenuBuilder,
    EmbedBuilder,
    ComponentType
} = require("discord.js");
const { isCheckinChannel, getScrim } = require("../../db/models/scrims");
const { alertMsg, alertType } = require("../../utils/alerts");
const { addScrimTeam, addTeamChannel } = require("../../db/models/scrimTeams");
const { updateLobby, isValidTeamRole } = require("../../utils/helper");

const checkedInTeams = [];

const onClick = async(interaction, teamRoleID) => {
    let text = '';
    const isCaptain = interaction.member.roles.cache.find( ({id}) => id === process.env.CAPTAIN_ROLE_ID );
        
    if(!Boolean(isCaptain) && !interaction.member.roles.cache.has( process.env.STAFF_ROLE_ID)){
        return await alertMsg({
            text:`<@${interaction.user.id}> You are not the Captain of Your TEAM! :anguished:`,
            interaction,
        });
    }
    //captain should be in his team channel
    if (!interaction.member.roles.cache.has(teamRoleID) && !interaction.member.roles.cache.has( process.env.STAFF_ROLE_ID)) {
        return alertMsg({
            interaction,
            text:'You are in wrong place. Are you lost? 💦'
        });
    }
   const permissionOverwritesManager = interaction.channel.permissionOverwrites;
    const permissionOverwrites = interaction.channel.permissionOverwrites.cache;
    // Log each permission overwrite
    permissionOverwrites.forEach(async (overwrite) => {
        if(overwrite.type === 1){
            await overwrite.delete();
        }
      });
    
    interaction.users.forEach((user, key) => {
        //0 is id 1 is user object in array
        permissionOverwritesManager.create(user,{
            Connect: true
        });
        text+= `<@${key}> `;
    });
    return alertMsg({
        interaction,
        text: `${text} been given access to join your channel :+1:`,
        type: alertType.SUCCESS,
        temp: false
    });
}

const createVoicChanel = async ({
    channelName,
    interaction,
    teamRoleID,
}) =>{
    const { member, guild } = interaction;
    const channels = guild.channels;
    const categoryName = 'voice channels';
    //get voice channel category
    const category = channels.cache.find(channel => channel.name.toLowerCase() === categoryName);
    if(!Boolean(category)){
        return alertMsg({
            interaction,
            text:`Category ${categoryName} does not exists.`
        });
    }
    let channelID;
    try{
        // Create voice channel
        const channelExist = channels.cache.find(channel => channel.name.toLowerCase() === channelName.toLowerCase());
        if(Boolean(channelExist)){
            return channelExist.id;
        }
        const voiceChannel = await channels.create( {
            name: channelName,
            type: ChannelType.GuildVoice,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.Connect],
                },
                {
                    id: teamRoleID,
                    allow: [PermissionsBitField.Flags.Connect],
                },
            ],
        });

        const UserSelectMenu = new UserSelectMenuBuilder()
        .setCustomId('inc-user')
        .setMaxValues(2)
        .setMinValues(1) // One user minimum
        .setPlaceholder( 'Add Player');
        const row = new ActionRowBuilder()
            .addComponents(UserSelectMenu);
        const embed = new EmbedBuilder()
        .setTitle(`Manage ${channelName} Channel....!`)
        .setDescription(`Take control of your channel and add temporary players.\n Max limit 2..!`)
        .addFields({
            name: 'Team Captain 👨‍✈️',
            value: `<@${interaction.user.id}>`,
            inline: false
        });

        const reply = await voiceChannel.send({ content: `<@${interaction.user.id}>`, embeds:[embed], components: [row]})
        // Listen on button
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.UserSelect,
        });
      
        collector.on('collect', async (interaction) => {
            console.log('Listened on user select...' + interaction.customId);
            onClick(interaction, teamRoleID);
        });
        channelID = voiceChannel.id;
        // Move the user to the created voice channel
        await member.voice.setChannel(voiceChannel);
    }catch(err){
        if(err.code === 40032){
            // console.log(err); ignore
        }else{
            console.error(err);
        }
    }
    return channelID;
}

module.exports = {
    name: 'checkin',
    description: 'checkin team when its open. Format /checkin @team',
    openCommand: true,
    options: [
        {
            name: 'team',
            description: 'meanion team e.g @team',
            type: ApplicationCommandOptionType.Role,
            required: true,
        }
    ],
    checkedInTeams,
    async execute(interaction){
        const input = interaction.options.get('team');
        const serverID = interaction.guild.id;
        const chanelID =  interaction.channel.id;
        const user = interaction.user.username;
        const userID = interaction.user.id;
        // Check if the command is executed in the correct channel
        if (!await isCheckinChannel({ serverID, chanelID })) {
            return alertMsg({
                interaction,
                text:'This command is only available in the check-in channel. 🛑'
            });
        }
        //check if mentioned team is valid
        if(!Boolean(input) || !input?.role){
            return alertMsg({
                interaction,
                text:'Please use the correct format: `/checkin @team` 🛑'
            });
        }
        if(!isValidTeamRole(input.role)){
            return alertMsg({
                interaction,
                text:`You have to tag a team role 🛑`
            });
        }
        // Check if the user has the mentioned role
        if (!interaction.member.roles.cache.has(input.role.id)) {
            return alertMsg({
                interaction,
                text:'You do not have the required role to check in. 🛑'
            });
        }
        const {
            id: scrimID,
            open: scrimOpen
        } = await getScrim({
            serverID,
            checkinID: chanelID
        });
        if(!Boolean(scrimOpen)){
            return alertMsg({
                interaction,
                text:'Scrims are not open. You can not check in right now. 🛑'
            });
        }
        if( await addScrimTeam({
            name:user,
            roleID:userID,
            scrimID,
            mention:`<@${userID}>`,
            teamRoleID: input.role.id
        })){
            const channelID = await createVoicChanel({
                userName:user,
                channelName: input.role.name,
                interaction,
                teamRoleID: input.role.id
            });
            addTeamChannel({
                channelID,
                teamRoleID: input.role.id
            });
            const msg = await alertMsg({
                interaction,
                text:`**Team:** <@&${input.role.id}>, **checked in by:** <@${userID}> :notebook:\n \n*Voice channel has been created.*`,
                type: alertType.SUCCESS,
                temp: false
            });
            checkedInTeams[input.role.id] = {
                member: userID,
                messageID: msg.id,
                checkedIn: true
            }
            updateLobby({
                scrimID,
                channels:interaction.client.channels,
                client: interaction.client
            });

        } else {
            return alertMsg({
                interaction,
                text:'Team is already checked in. 🔥 You can\'t check in twice. ⛔'
            });
        }
    }
}