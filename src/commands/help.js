const { EmbedBuilder } = require("discord.js");
const { alertType, getInspectorBota } = require("../utils/alerts");
const { getScrim } = require("../db/models/scrims");

module.exports = {
    name: 'help',
    description: 'Get commands information..',
    openCommand: true,
    async execute(interaction){
        const serverID = interaction.guild.id;
        const staffRoleID = process.env.STAFF_ROLE_ID;
        //check for staff role
        let text = `Inspector Bota 👨‍🚒 offers the following commands.\n
        🤜/get -> Server Member can use this command to search for their team or find out which players is in which team\n
        🤜/list -> Server Member can use this command to get list of registered teams.\n
        🤜/checkin -> Registered team can use this command to checkin in **✅│check-in** Channel. It will create VC for team, Tean captain of that team can add upto two server member to their VC\n
        🤜/checkout -> Both Registered and Non Registered team can use this command to checkout in **❌│check-out** Channel which will clear lootspot taken by that team and delete team VC if have one\n
        🤜/checkin_mix -> Non Registered team can use this command to checkin in **✅│check-in** Channel.\n
        **Note** If checkIn/checkout channel not visible check with Server Staff (Staff can generate following channel using /init command)... 🏳️`;
        const isStaff = interaction.member.roles.cache.has( staffRoleID );
        if(Boolean(isStaff)){
            text = ` 👨‍🚒 There are two types of commands Private and Open.Private commands can only be run by user with staff role in bot-commands channel, bot-commands channel will be created in result of /init command\n
            🤜/init ->(Only Server Owner) Initializes the scrim server by creating important channels, tier roles, and other essential roles such as STAFF\n
            🤜/scrim_edit ->(Private) This command is useful for changing the minimum teams, maximum teams, and scrim mode set using the /init command.\n
            🤜/scrim ->(Private) This command can be used to close/open, announce, or reset a scrim.\n
            🤜/add ->(Private) This command is used to register a team with a name. It will also create a role with the team name and assign that role to all players of that team. To delete a team, simply delete the role.\n
            🤜/ls_create ->(Private) Create a lootspot for a lobby, e.g., /ls_create lobby1, and select a map for that lobby.\n
            🤜/ls_active ->(Private) Send lootspot options to all channels created using the /ls_create command.\n
            🤜/ls_lock ->(Private) To lock/unlock lootspots in lobby channels.\n
            🤜/checkin ->(Open) Registered team can use this command to checkin. It will create VC for team, Tean captain of that team can add upto two server member to their VC\n
            🤜/checkin_mix ->(Open) Non Registered team can use this command to checkin.\n
            🤜/checkout ->(Open) Both Registered and Non Registered team can use this command to checkout which will clear lootspot taken by that team and delete team VC if have one\n
            🤜/get ->(Open) Server Member can use this command to search for their team or find out which players is in which team\n
            🤜/list ->(Open) Server Member can use this command to get list of registered teams.\n
            **Note** If you want to clear an initialized scrim, simply delete the category mentioned when you used the /init command. This action will delete roles and channels associated with that scrim.`;
        }
        const {
            botName,
            botIcon
        } = getInspectorBota();
        const embed = new EmbedBuilder()
        .setTitle('Help..!')
        .setDescription(text)
        .setColor(alertType.SUCCESS)
        .setFooter({
            text: botName,
            iconURL: botIcon
        });
        interaction.reply({
            embeds: [embed],
            ephemeral: true,
        });
    }
}
