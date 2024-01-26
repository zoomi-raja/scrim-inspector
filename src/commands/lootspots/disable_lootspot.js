const { ApplicationCommandOptionType, EmbedBuilder } = require("discord.js");
const { tempMsg, getLootEmbed } = require("../../utils/helper");
const { deleteLootSpots } = require("../../db/models/teamLootSpots");
const {
    original_images_mir: originalImagesMir,
    original_images_era: originalImagesEra,
    original_images_tea: originalImagesTea,
    original_names_mir: originalNamesMir,
    original_names_era: originalNamesEra,
    original_names_tea: originalNamesTea,

} = require("../../lootSpotData/data");

const getFinalMsg = (text) => {
    const botIconURl = interaction.client.user.avatarURL()??process.env.DEFAULT_BOT_ICON;
    const embed = new EmbedBuilder()
    .setTitle(`${text} LootSpot Update`)
    .setDescription(`${text} LootSpot is currently **CLOSED**! 🔐`)
    .setColor(0x00FF00)
    .setThumbnail("https://secure.earnsfly.org/uploads/close.png")
    .setFooter({
        text: interaction.client.user.username,
        iconURL: botIconURl
    });
    return {embeds:[embed]};
}

module.exports = {
    name: 'disable_lootspot',
    description: 'disable lootspots One By One or All at once !',
    options: [
        {
            name: 'map',
            description: 'Taego, Miramar, Erangel or All',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    async execute(interaction){
        const input = interaction.options.get('map')?.value?.toLowerCase();
        if(!['miramar', 'erangel', 'taego', 'all'].includes(input)){
            return await tempMsg({
                text: `invalid value 🧑‍🚒. Posible values = Miramar, Erangel, Taego, All ❎ (case insensitive)`,
                interaction,
            });
        }
        const statusChannel = interaction.client.channels.cache.get(process.env.LOOTSPOT_STATUS_CHANEL);
        switch(input) {
            case 'miramar':
                //1 delete db lootspots
                //2 reset chanel msgs
                //3 send disable chanel buttons
                const mirChannel = interaction.client.channels.cache.get(process.env.MIRAMAR_CHANEL_ID);
                if (!mirChannel) {
                    return interaction.reply('Miramar channel not found.');
                }
                await mirChannel.bulkDelete(100);
                await interaction.reply(`loot spot will be deactive soon! 👨‍🚒`);
                //prepare and send loot spot selection button
                for (const i in originalNamesMir) {
                    if(!originalNamesMir[i] || !originalImagesMir[i])continue;
                    
                    await mirChannel.send(getLootEmbed({
                        label: `Lootspot is currently disabled`,
                        title:  `Miramar LootSpot ${(i*1) + 1}`,
                        image: originalImagesMir[i],
                        customID: `miramar_active_${i}`,
                        disable: true
                    }));
                }
                await mirChannel.send(getFinalMsg( 'Miramar' ));
                await statusChannel.bulkDelete(100);
                await deleteLootSpots('M');
                break;
            case 'erangel':
                const eraChannel = interaction.client.channels.cache.get(process.env.ERANGEL_CHANEL_ID);
                if (!eraChannel) {
                    return interaction.reply('Erangel channel not found.');
                }
                await eraChannel.bulkDelete(100);
                await interaction.reply(`loot spot will be deactive soon! 👨‍🚒`);
                //prepare and send loot spot selection button
                for (const i in originalNamesEra) {
                    if(!originalNamesEra[i] || !originalNamesEra[i])continue;
                    
                    await eraChannel.send(getLootEmbed({
                        label: `Lootspot is currently disabled`,
                        title: `Erangel LootSpot ${(i*1) + 1}`,
                        image: originalImagesEra[i],
                        customID: `erangel_active_${i}`,
                        disable: true
                    }));
                }
                await eraChannel.send(getFinalMsg( 'Erangel' ));
                await statusChannel.bulkDelete(100);
                await deleteLootSpots('E');
                break;
            case 'taego':
                // code block
                const taeChannel = interaction.client.channels.cache.get(process.env.TAEGO_CHANEL_ID);
                if (!taeChannel) {
                    return interaction.reply('taego channel not found.');
                }
                await taeChannel.bulkDelete(100);
                await interaction.reply(`loot spot will be deactive soon! 👨‍🚒`);
                //prepare and send loot spot selection button
                for (const i in originalNamesTea) {
                    if(!originalNamesTea[i] || !originalNamesTea[i])continue;
                    
                    await taeChannel.send(getLootEmbed({
                        label: `Lootspot is currently disabled`,
                        title: `taego LootSpot ${(i*1) + 1}`,
                        image: originalImagesTea[i],
                        customID: `taego_active_${i}`,
                        disable: true
                    }));
                }
                await taeChannel.send(getFinalMsg( 'taego' ));
                await statusChannel.bulkDelete(100);
                await deleteLootSpots('T');
                break;
            default: // default is for all
                await interaction.reply(`loot spot will be deactive soon! 👨‍🚒`);
                await statusChannel.bulkDelete(100);

                const mirChan = interaction.client.channels.cache.get(process.env.MIRAMAR_CHANEL_ID);
                if (!mirChan) {
                    return interaction.reply('Miramar channel not found.');
                }
                const eraChan = interaction.client.channels.cache.get(process.env.ERANGEL_CHANEL_ID);
                if (!eraChan) {
                    return interaction.reply('Erangel channel not found.');
                }
                const taeChan = interaction.client.channels.cache.get(process.env.TAEGO_CHANEL_ID);
                if (!taeChan) {
                    return interaction.reply('taego channel not found.');
                }
                await mirChan.bulkDelete(100);
                await eraChan.bulkDelete(100);
                await taeChan.bulkDelete(100);

                const mirPromises = originalNamesMir.map(async (name, i) => {
                    if (!name || !originalImagesMir[i]) return;
                  
                    return mirChan.send(getLootEmbed({
                        label: `Lootspot is currently disabled`,
                        title: `Miramar LootSpot ${(i * 1) + 1}`,
                        image: originalImagesMir[i],
                        customID: `miramar_active_${i}`,
                        disable: true,
                    }));
                });

                const eraPromises = originalNamesEra.map(async (name, i) => {
                    if (!name || !originalImagesEra[i]) return;
                  
                    return eraChan.send(getLootEmbed({
                        label: `Lootspot is currently disabled`,
                        title: `Erangel LootSpot ${(i * 1) + 1}`,
                        image: originalImagesEra[i],
                        customID: `erangel_active_${i}`,
                        disable: true,
                    }));
                });

                const teaPromises = originalNamesTea.map(async (name, i) => {
                    if (!name || !originalImagesTea[i]) return;
                  
                    return taeChan.send(getLootEmbed({
                        label: `Lootspot is currently disabled`,
                        title: `Taego LootSpot ${(i * 1) + 1}`,
                        image: originalImagesTea[i],
                        customID: `taego_active_${i}`,
                        disable: true,
                    }));
                });

                await Promise.all([...mirPromises, ...eraPromises, ...teaPromises]);
                mirChan.send(getFinalMsg( 'Miramar' ));
                eraChan.send(getFinalMsg( 'Erangel' ));
                taeChan.send(getFinalMsg( 'taego' ));
                await deleteLootSpots('M');
                await deleteLootSpots('E');
                await deleteLootSpots('T');
        }
    }
}