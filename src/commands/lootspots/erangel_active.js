const {
    EmbedBuilder,
    ComponentType
} = require('discord.js');

const {
    original_images_era: originalImagesEra,
    original_names_era: originalNamesEra,
    grey_images_era: greyImagesEra,
} = require('../../lootSpotData/data');

const {
    getTeamByCaptainID,
} = require('../../db/models/scrimTeams');

const {
    updateLootspotClaim,
    getLootEmbed,
    tempMsg,
} = require('../../utils/helper');

const {
    isCaptainCheckedId, deleteTeamLootSpots
} = require('../../db/models/teamLootSpots');

let { getLock } = require('../../commands/lootspots/taala');

let state = {
    generatingSpots: false,
    teams:{
    }
};

const erangel_cmd = {
    name: 'erangel_active',
    description: 'Make Erangel lootspots available for team Captains !',
    async execute(interaction){
        if(state.generatingSpots){
            interaction.reply(`<@${interaction.user.id}> wait for process to complete! 🤦`);
            console.log('waiting...');
            return;
        }

        const eraChannel = interaction.client.channels.cache.get(process.env.ERANGEL_CHANEL_ID);
        if (!eraChannel) {
            return interaction.reply('Channel not found.');
        }
        //firt remove old messages from chanel
        state.teams = {};
        state.generatingSpots = true;
        await eraChannel.bulkDelete(100);
        deleteTeamLootSpots('E');
        await interaction.reply(`Erangel loot spot will be active soon! <@${interaction.user.id}> 👨‍🚒`);
        
        //prepare and send loot spot selection button
        const promisesMir = originalNamesEra.map(async (name, i) => {
            if (!name || !originalImagesEra[i]) return;
            const reply = await eraChannel.send(getLootEmbed({
                label: 'Grab LootSpot',
                title: name,
                image: originalImagesEra[i],
                customID: `erangel_active_${i}`,
            }));
          
            // Listen on button
            const collector = reply.createMessageComponentCollector({
                componentType: ComponentType.Button,
            });
          
            collector.on('collect', async (interaction) => {
                console.log('Listened on collect...' + interaction.customId);
                await this.onClick(interaction, reply);
            });
            
            return reply;
        });
        // Wait for all btn message to send
        await Promise.all(promisesMir);
        //final message
        const botIconURl = interaction.client.user.avatarURL()??process.env.DEFAULT_BOT_ICON;
        const embed = new EmbedBuilder()
        .setTitle("Erangel LootSpot Update")
        .setDescription("Erangel LootSpot is now **OPEN**! 💯" )
        .setColor(0x00FF00)
        .setThumbnail("https://secure.earnsfly.org/uploads/open.png")
        .setFooter({
            text: interaction.client.user.username,
            iconURL: botIconURl
        });
        await eraChannel.send({embeds:[embed]});
        state.generatingSpots = false;
    },
    onClick: async (interaction, reply) => {
        const user = interaction.user.username;
        const userID = interaction.user.id;
        if(state.generatingSpots){
            interaction.reply(`<@${userID}> wait for process to complete! 🤦`);
            console.log('waiting...');
            return;
        }
        
        if(getLock()){
            return await tempMsg({
                text:`<@${userID}> Lootspot has been locked by Admin 🚒`,
                interaction,
            });
        }
        const spotIndex = interaction.customId.substring("erangel_active_".length);
        const captainInfo = {
            captainID: userID,
            spotIndex: spotIndex
        }
        //check if user is team captain
        const isCaptain = interaction.member.roles.cache.find( ({id}) => id === process.env.CAPTAIN_ROLE_ID );

        if(!Boolean(isCaptain)){
            return  await tempMsg({
                content:`<@${userID}> You are not the Captain of Your TEAM! :anguished:`,
                interaction,
            });
        }
        //todo check if team checkedIn
        if(! await isCaptainCheckedId(userID)){
            return await tempMsg({
                text:`<@${userID}> Your Team is not checked in 🤦, Please do that first. 🖕`,
                interaction,
            });
        }
        //get captain team info
        const { team_name: teamName, team_role_id: teamRoleID } = await getTeamByCaptainID(userID);
        captainInfo.team = teamName;
        if(!Boolean(captainInfo.team)){
            return await tempMsg({
                text:`<@${userID}> You are not in any of registered teams. 🔥`,
                interaction,
            });
        }

        //check if lootspot taken by anyother team
        if(state.teams[spotIndex] &&  state.teams[spotIndex].captainID !== userID ){
            return interaction.reply(`<@${userID}> **${originalNamesEra[spotIndex]}** is already taken by ${state.teams[spotIndex].team} :crossed_swords:`);
        }
        //its same spot inform captain
        if(state.teams[spotIndex] &&  state.teams[spotIndex].captainID === userID ){
            return await tempMsg({
                text:`${user} You already have ${originalNamesEra[spotIndex]} ✅`,
                interaction,
            });
        }
        
        //if captain already have spot taken reset previus spot soother can take
        if(state.teams){
            const alreadySelectedSpot =  Object.keys(state.teams).find(index => {
                return state.teams[index].captainID === userID
            });
            if(Boolean(alreadySelectedSpot)){
                state.teams[alreadySelectedSpot].spot.edit(getLootEmbed({
                    label: 'Grab LootSpot',
                    title: originalNamesEra[alreadySelectedSpot],
                    image: originalImagesEra[alreadySelectedSpot],
                    customID: `erangel_active_${alreadySelectedSpot}`,
                }));
                delete state.teams[alreadySelectedSpot];
            }
        }
        //add spot for captain
        state.teams[spotIndex] = captainInfo;
        state.teams[spotIndex].spot = reply;
        reply.edit(getLootEmbed({
            label: `TAKEN BY ${user}, TEAM: ${captainInfo.team}`,
            title: `Erangel LootSpot Taken ${(spotIndex * 1)+1}`,
            image: greyImagesEra[spotIndex],
            customID: `erangel_active_${spotIndex}`,
            disable: true
        }));
        await tempMsg({
            text: `Your loot spot change saved 👍`,
            interaction,
        });
        //what everthe decision in above flow send msg in lootspot status chanel
        await updateLootspotClaim({
            spotIndex,
            map:'E',
            spotTitle:originalNamesEra[spotIndex],
            captainID:captainInfo.captainID,
            teamName:captainInfo.team,
            teamRoleID,
            channels:interaction.client.channels,
            channelMessageID: reply.id
        });
    },
    makeLootSpotAvailable(spotIndex) {
        delete state.teams[spotIndex];
    }
};

module.exports = erangel_cmd;