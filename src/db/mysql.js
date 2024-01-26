const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function createImpTable(){
  const sql = `CREATE TABLE IF NOT EXISTS team_loot_spots (
      captain_id VARCHAR(255),
      map VARCHAR(255),
      message_id VARCHAR(255),
      spot_name VARCHAR(255),
      spot_index INT
    )`;
  const connection = await pool.getConnection();
  await connection.query(sql);
}

async function addLootSpotColumn(){
  const sql = 'DESCRIBE team_loot_spots'
  const connection = await pool.getConnection();
  const [columns] = await connection.execute(sql);
  const channelMsgColumn = columns.some((column) => column.Field === 'channel_message_id');
  if (!channelMsgColumn) {
    await connection.execute('ALTER TABLE team_loot_spots ADD COLUMN channel_message_id VARCHAR(255)');
    console.log('Added "channel_message_id" column successfully.');
  }
  const teamColumn = columns.some((column) => column.Field === 'team_role_id');
  if (!teamColumn) {
    await connection.execute('ALTER TABLE team_loot_spots ADD COLUMN team_role_id VARCHAR(255)');
    console.log('Added "team_role_id" column successfully.');
  }
}

async function addTeamColumn(){
  const sql = 'DESCRIBE teams'
  const connection = await pool.getConnection();
  const [columns] = await connection.execute(sql);
  const teamColumn = columns.some((column) => column.Field === 'team_role_id');
  if (!teamColumn) {
    await connection.execute('ALTER TABLE teams ADD COLUMN team_role_id VARCHAR(255)');
    console.log('Added "team_role_id" column successfully.');
  }
  const teamChannelColumn = columns.some((column) => column.Field === 'channel_id');
  if (!teamChannelColumn) {
    await connection.execute('ALTER TABLE teams ADD COLUMN channel_id VARCHAR(255)');
    console.log('Added "channel_id" column successfully.');
  }
}

pool.getConnection()
.then(connection => {
  console.log('Connected to the database pool');
  connection.release();
})
.catch(error => console.error('Error connecting to the database pool:', error));

try {
  createImpTable();
  addLootSpotColumn();
  addTeamColumn();
} catch (error) {
  console.error('Error:', error.message);
}

module.exports = {
    pool: pool,
    executeQuery: async (sql, values = []) => {
      const connection = await pool.getConnection();
      try {
        const [rows, fields] = await connection.execute(sql, values);
        return rows;
      } finally {
        connection.release();
      }
    },
};