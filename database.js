const mysql = require("mysql2/promise");
const bluebird = require('bluebird');

async function main() {
  const pool = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "rama1234%",
    database: "sportsproject",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    Promise: bluebird
  });
  // const [rows, fields] = await pool.execute('select slot_time, availability  from sportsproject.slots_booking');
  // console.log(rows);
  return await pool;
}


module.exports = main;

