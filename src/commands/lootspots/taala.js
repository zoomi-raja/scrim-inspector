const { ApplicationCommandOptionType } = require("discord.js");
const { tempMsg } = require("../../utils/helper");

let lock = false;

module.exports = {
    name: 'taala',
    description: 'lock loot spots !',
    options: [
        {
            name: 'value',
            description: 'Possible Value True/False',
            type: ApplicationCommandOptionType.String,
        }
    ],
    async execute(interaction){
        const input = interaction.options.get('value')?.value?.toLowerCase();
        switch(input) {
            case 'true':
                lock = true
                await tempMsg({
                    text:`Lootspot has been locked by 🚒`,
                    interaction,
                });
                break;
            default:
                lock = false
                return await tempMsg({
                    text:`Lootspot has been unLocked by 🚒`,
                    interaction,
                });
        }
    },
    getLock(){
        return lock;
    },
}