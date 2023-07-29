var mysql = require("mysql2");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rama1234%",
  database: "sportsproject",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
// console.log('before connection');
connection.on("connection", function name(connection) {
  console.log("connection established");
  connection.on("error", function (err) {
    console.log("db error");
  });
  connection.on("close", function (err) {
    console.log("db closed");
  });
});

var sql = `insert into sportsproject.resource_booking (resource_ID,resource_name,total_inventory,available_inventory,resources_booked) values (2,"asd",12,1,2)`;
connection.query(sql, function (err, result) {
  if (err) {
    console.log(err.message);
    throw err;
  }
  console.log("record inserted");
  // req.flash("success", "Data added successfully!");
  // res.redirect("/");
});
// console.log('after connection');
