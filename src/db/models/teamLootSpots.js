const db = require('../mysql');
const table = 'team_loot_spots';

const getMapSpotsByCaptain = async(captainId = null) => {
    if(!captainId) return false;
    try{
        const sql = `SELECT captain_id, map, spot_index, spot_name, message_id FROM ${table} WHERE captain_id = ?`;
        const result = await db.executeQuery(sql, [captainId]);
        return (result.length > 0) ? result : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}
const getMapSpotsByTeam = async(teamID = null) => {
    if(!teamID) return false;
    try{
        const sql = `SELECT captain_id, map, spot_index, spot_name,
        message_id, channel_message_id, team_role_id FROM ${table} WHERE team_role_id = ?`;
        const result = await db.executeQuery(sql, [teamID]);
        return (result.length > 0) ? result : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const insertMapSpotForCaptain = async({captainID, map, spotIndex, spotName, messageID, channelMessageID, teamRoleID}) => {
    if(!captainID || !spotIndex || !['M', 'T', 'E'].includes(map)) return false;
    try{
        const sql = `INSERT INTO ${table} (captain_id, map, spot_index, spot_name, message_id, channel_message_id, team_role_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const result = await db.executeQuery(sql, [ captainID, map, spotIndex, spotName, messageID, channelMessageID, teamRoleID ]);
        await db.executeQuery( `UPDATE ${table} SET message_id = ? WHERE captain_id = ?`, [  messageID, captainID ]);
        return result;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const updateMapSpotForCaptain = async({captainID, map, spotIndex, spotName, messageID, channelMessageID, teamRoleID}) => {
    if(!captainID || !spotIndex || !['M', 'T', 'E'].includes(map)) return false;
    try{
        const sql = `UPDATE ${table} SET spot_index = ?, spot_name = ?, channel_message_id = ?, team_role_id = ? WHERE captain_id = ? AND map = ?`;
        await db.executeQuery(sql, [ spotIndex, spotName, channelMessageID, teamRoleID, captainID, map ]);
        await db.executeQuery( `UPDATE ${table} SET message_id = ? WHERE captain_id = ?`, [  messageID, captainID ]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const deleteLootSpots = async (map) => {
    if(!map || !['M', 'T', 'E'].includes(map)) return false;
    try{
        const sql = `DELETE FROM team_loot_spots WHERE map = ?`;
        await db.executeQuery(sql, [ map ]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
const deleteTeamLootSpots = async (value = null) => {
    if(!value) return false;
    let sql
    try{
        if(['M', 'T', 'E'].includes(value)){
            sql = `DELETE FROM team_loot_spots WHERE map = ?`;
        } else {
            sql = `DELETE FROM team_loot_spots WHERE team_role_id = ?`;
        }
        await db.executeQuery(sql, [ value ]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const isCaptainCheckedId = async (captainID) => {
    try {
        const sql = `SELECT role_id FROM teams WHERE role_id = ? LIMIT 1`;
        const result = await db.executeQuery(sql, [ captainID ]);
        return (result.length > 0) ? result : false;
        
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    deleteLootSpots,
    getMapSpotsByTeam,
    isCaptainCheckedId,
    deleteTeamLootSpots,
    getMapSpotsByCaptain,
    insertMapSpotForCaptain,
    updateMapSpotForCaptain,
};