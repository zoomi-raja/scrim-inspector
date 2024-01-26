const { ApplicationCommandOptionType } = require("discord.js");
const { getScrim } = require("../../db/models/scrims");
const { alertMsg, alertType } = require("../../utils/alerts");
const { isValidTeamRole, getLootEmbed, updateLobby } = require("../../utils/helper");
const { getTeamByCaptainID, getCheckedInTeam, deleteCheckedInTeam } = require("../../db/models/scrimTeams");
const { getMapSpotsByTeam, deleteTeamLootSpots } = require("../../db/models/teamLootSpots");
const {
    original_images_mir: originalImagesMir,
    original_images_era: originalImagesEra,
    original_images_tea: originalImagesTea,
    original_names_mir: originalNamesMir,
    original_names_era: originalNamesEra,
    original_names_tea: originalNamesTea,

} = require("../../lootSpotData/data");
const {
    makeLootSpotAvailable: makeLootSpotAvailableEra
} = require("../lootspots/erangel_active");
const {
    makeLootSpotAvailable: makeLootSpotAvailableTea
} = require("../lootspots/taego_active");
const { makeLootSpotAvailable } = require("../lootspots/miramar_active");

module.exports = {
    name: 'checkout',
    description: 'checkout team. Format /checkout @team',
    openCommand: true,
    options: [
        {
            name: 'team',
            description: 'meanion checked in team e.g @team',
            type: ApplicationCommandOptionType.Role,
            required: true,
        }
    ],
    async execute(interaction){
        const input = interaction.options.get('team');
        const serverID = interaction.guild.id;
        const chanelID =  interaction.channel.id;
        const user = interaction.user.username;
        const userID = interaction.user.id;
        // Check if the command is executed in the correct channel
        const {
            id: scrimID,
            open: scrimOpen,
            checkout_channel_id: checkoutChannelID,
        } = await  getScrim({serverID})
        if ( checkoutChannelID !== chanelID) {
            return alertMsg({
                interaction,
                text:'This command is only available in the check-out channel. 🛑'
            });
        }
        if(!Boolean(scrimOpen)){
            return alertMsg({
                interaction,
                text:'Scrims are not open. You can not check out right now. 🛑'
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
        if (!interaction.member.roles.cache.has(input.role.id) && !interaction.member.roles.cache.has( process.env.STAFF_ROLE_ID)) {
            return alertMsg({
                interaction,
                text:'You do not have the required role to check out. 🛑'
            });
        }
        //as staff also can checkout for team. we have valid team role id and need to get his cpt id
        
        // check if team checked in
        const isCheckedIn = await getCheckedInTeam({
            teamID: input.role.id,
            scrimID
        });
        if(!Boolean(isCheckedIn)){
            return alertMsg({
                interaction,
                text:`No need to check out, <@&${input.role.id}> never checked in. 🛑`
            });
        }
        
        //get captain team info
        const {
            team_name: teamName,
            team_role_id: teamRoleID,

        } = await getTeamByCaptainID(isCheckedIn.role_id);
        //1 get loot spots from team_loot_spots which have message id too to update 
        //   for both status chanel and lootspot chanel
        const captainSpotData = await getMapSpotsByTeam(teamRoleID);
        if( captainSpotData?.length > 0 ){
            //delete lootspot status msg
            const lobbyStatusMsg = captainSpotData[0].message_id;
            if(lobbyStatusMsg){
                const statusChannel = interaction.client.channels.cache.get(process.env.LOOTSPOT_STATUS_CHANEL);
                if (!statusChannel) {
                    console.log("No such status chanel found 🔥");
                }
                try {
                    const fetchedMessage = await statusChannel.messages.fetch(lobbyStatusMsg);
                    fetchedMessage.delete();
                } catch (error) {
                    console.error(`Message with ID ${lobbyStatusMsg}
                    not found in channel ${process.env.LOOTSPOT_STATUS_CHANEL}.
                    Sending a new message. ${error}`);
                }
            }
            //for all 3 map reset lootspot button
            captainSpotData.forEach(async ({map, channel_message_id: messageID, spot_index: spotIndex})=>{
                if(Boolean(messageID)){
                    switch(map) {
                        case 'E':
                            const eraChannel = interaction.client.channels.cache.get(process.env.ERANGEL_CHANEL_ID);
                            if (!eraChannel) {
                                return interaction.reply('Erangel channel not found.');
                            }
                            const eraMessage = await eraChannel.messages.fetch(messageID);
                            makeLootSpotAvailableEra(spotIndex);
                            eraMessage.edit(getLootEmbed({
                                label: 'Grab LootSpot',
                                title: originalNamesEra[spotIndex],
                                image: originalImagesEra[spotIndex],
                                customID: `erangel_active_${spotIndex}`,
                            }));
                            break;
                        case 'T':
                            const taeChannel = interaction.client.channels.cache.get(process.env.TAEGO_CHANEL_ID);
                            if (!taeChannel) {
                                return interaction.reply('Taego channel not found.');
                            }
                            const teaMessage = await taeChannel.messages.fetch(messageID);
                            makeLootSpotAvailableTea(spotIndex);
                            teaMessage.edit(getLootEmbed({
                                label: 'Grab LootSpot',
                                title: originalNamesTea[spotIndex],
                                image: originalImagesTea[spotIndex],
                                customID: `erangel_active_${spotIndex}`,
                            }));
                            break;
                        case 'M':
                            const mirChannel = interaction.client.channels.cache.get(process.env.MIRAMAR_CHANEL_ID);
                            if (!mirChannel) {
                                return interaction.reply('Miramar channel not found.');
                            }
                            const mirMessage = await mirChannel.messages.fetch(messageID);
                            makeLootSpotAvailable(spotIndex);
                            mirMessage.edit(getLootEmbed({
                                label: 'Grab LootSpot',
                                title: originalNamesMir[spotIndex],
                                image: originalImagesMir[spotIndex],
                                customID: `erangel_active_${spotIndex}`,
                            }));
                            break;
                        default:
                    }
                }
            });
        }
        //2 delete lootspot from team_loot_spots
        deleteTeamLootSpots(teamRoleID);
        //3 delete checkin data from teams by roleid
        deleteCheckedInTeam(teamRoleID);
        //4 update lobby method
        updateLobby({
            scrimID,
            channels:interaction.client.channels,
            client: interaction.client
        });
        //delete voice channel
        const teamVC = interaction.client.channels.cache.find(channel => channel.id === isCheckedIn.channel_id);
        if(Boolean(teamVC)){
            try{
                console.log(teamName)
                teamVC.delete();
            } catch(err){
                console.log(err);
            }
        }

        alertMsg({
            interaction,
            text:`**Team:** <@&${teamRoleID}>, **checked out by:** <@${userID}> :notebook:\n \n*Voice Channel has been Deleted..*`,
            type: alertType.SUCCESS,
            temp: false
        });
    }
}