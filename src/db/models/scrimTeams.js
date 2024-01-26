const db = require('../mysql');
const table = 'added_teams';

const getTeamByCaptainID = async(captainId = null) => {
    if(!captainId) return false;
    try{
        const sql = `SELECT team_name, team_role_id, tier_role_id, captain_id, member_ids FROM added_teams WHERE captain_id = ? OR FIND_IN_SET(?, member_ids) LIMIT 1`;
        const result = await db.executeQuery(sql, [captainId, captainId]);
        return (result.length > 0) ? result[0] : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const insertTeam = async(captainId = null) => {
    if(!captainId) return false;
    try{
        const sql = 'INSERT INTO added_teams (team_name, team_role_id, tier_role_id, captain_id, member_ids) VALUES (?, ?, ?, ?, ?)';
        const result = await db.executeQuery(sql, ['4O4', '3434', 'sad324', captainId, '3,43,4' ]);
        console.log(result);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const addScrimTeam = async ({
    name,
    roleID,
    scrimID,
    mention,
    teamRoleID,
}) => {//todo saving userid as roleid which is weired instead use team role id and its name + captain id in future
    const sql = `SELECT team_id FROM teams WHERE team_role_id = ? AND scrim_id = ? LIMIT 1`;
    const result = await db.executeQuery(sql, [teamRoleID, scrimID]);
    if(result.length > 0) return false;
    const sql2 = "INSERT INTO teams (role_id, name, tier, mention, scrim_id, team_role_id) VALUES(?, ?, ?, ?, ?, ?)";
    await db.executeQuery(sql2, [roleID, name, 0, mention, scrimID, teamRoleID]);
    return true;
}

const addTeamChannel = async({
    teamRoleID,
    channelID,
}) => {
    await db.executeQuery( `UPDATE teams SET channel_id = ? WHERE team_role_id = ?`, [  channelID, teamRoleID ]);
    return true;
}

const getCheckedInTeam = async({teamID, scrimID}) => {
    if(!teamID) return false;
    try{
        const sql = `SELECT team_id, role_id, channel_id FROM teams WHERE team_role_id = ? AND scrim_id = ? LIMIT 1`;
        const result = await db.executeQuery(sql, [teamID, scrimID]);
        return (result.length > 0) ? result[0] : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const deleteCheckedInTeam = async (teamRoleID = null) => {
    if(!teamRoleID) return false;
    try{
        const sql = `DELETE FROM teams WHERE team_role_id = ?`;
        await db.executeQuery(sql, [ teamRoleID ]);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const getScrimTeams = async (scrimID) => {
    try{
        const sql = `SELECT role_id, tier, mention, team_role_id FROM teams WHERE scrim_id = ? ORDER BY team_id`;
        const result = await db.executeQuery(sql, [scrimID]);
        return (result.length > 0) ? result : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    insertTeam,
    addScrimTeam,
    getScrimTeams,
    addTeamChannel,
    getCheckedInTeam,
    getTeamByCaptainID,
    deleteCheckedInTeam,
};