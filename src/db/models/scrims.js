const db = require('../mysql');
const table = 'scrims';

const isCheckinChannel = async({ serverID, chanelID }) => {
    if(!serverID || !chanelID) return false;
    try{
        const sql = `SELECT id FROM ${table} WHERE server_id = ? AND checkin_channel_id = ? LIMIT 1`;
        const result = await db.executeQuery(sql, [serverID, chanelID]);
        return (result.length > 0) ? result[0] : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const getScrimChannel = async(scrimID) => {
    if(!scrimID) return false;
    try{
        const sql = `SELECT id, mode, lobby_count, min_teams, max_teams, checkin_channel_id, checkout_channel_id, lobbystatus_channel_id, lobbyannounce_channel_id FROM ${table} WHERE id = ? LIMIT 1`;
        const result = await db.executeQuery(sql, [scrimID]);
        return (result.length > 0) ? result[0] : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const getScrim = async({ serverID, checkinID, scrimID }) => {
    if(!serverID && !scrimID) return false;
    try{
        let result, sql;
        if(scrimID){
            sql = `SELECT id, scrim_name, date,  server_id, open FROM ${table} WHERE id = ? LIMIT 1`;
            result = await db.executeQuery(sql, [scrimID]);
        }else if(checkinID){
            sql = `SELECT id, scrim_name, server_id, open FROM ${table} WHERE server_id = ? AND checkin_channel_id = ? LIMIT 1`;
            result = await db.executeQuery(sql, [serverID, checkinID]);
        }else if(serverID){
            sql = `SELECT id, scrim_name, server_id, checkin_channel_id, checkout_channel_id, open FROM ${table} WHERE server_id = ? LIMIT 1`;
            result = await db.executeQuery(sql, [serverID]);
        }
        return (result.length > 0) ? result[0] : false;
    } catch (error) {
        console.log(error);
        return false;
    }
}

module.exports = {
    getScrim,
    getScrimChannel,
    isCheckinChannel,
}