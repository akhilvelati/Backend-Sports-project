var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const db = require("./database");
var cors = require("cors");
let dbInitalized;
app.use(cors());

app.use(express.json());

app.use(bodyParser.json());

app.post("/login", async function name(req, res) {
  var username = req.body.user;
  console.log(username);
  var password = req.body.password;
  console.log(password);
  var sql = `select userID, user_name from sportsproject.users where user_name="${username}" and password="${password}"`;
  const [rows] = await dbInitalized.execute(sql);
  console.log(rows);

  if (rows.length == 0) {
    return res.send({ messaage: false });
  }
  res.send({
    data: rows,
    messaage: true,
  });
});

//getting all slots
app.get("/slots_list", async function name(req, res) {
  var sql = `select slot_time, availability  from sportsproject.slots_booking`;
  const [abc] = await dbInitalized.execute(sql);
  console.log(abc);
  res.send({ data: abc });
});

app.get("/resources", async function (req, res) {
  var sql = `select resource_name, available_inventory from sportsproject.resource_booking `;
  const [rows] = await dbInitalized.execute(sql);
  if (rows.length > 0) {
    res.send({
      message: "resources shown",
      data: rows,
    });
  }
});

app.get("/resource_booking_list", async function (req, res) {
  var retrieve = `select * from sportsproject.resource_booking_history;`;
  const [resources] = await dbInitalized.execute(retrieve);
  if (resources.length > 0) {
    res.send({
      data: resources,
      message: "resources shown",
    });
  } else {
    //console.log("no bookings");
    res.send({
      message: "no bookings done",
      data: resources,
    });
  }
});

app.post("/slots_booking", async function name(req, res) {
  var ue = true;
  var uec = false;
  var booked = req.body.array;
  var user = req.body.user;
  var id = req.body.id;
  console.log(booked);
  console.log(user);
  console.log(id);

  //checking existence in slot hsitory

  var checkexistence = `select user_name from sportsproject.slot_booking_history where userID = ${id}`;
  const [query1] = await dbInitalized.execute(checkexistence);
  console.log(query1);
  if (query1.length == 0) {
    ue = false;
    var insert = `insert into sportsproject.slot_booking_history 
      (userID, user_name, slot_time)
      values (${id}, "${user}", '${booked}');`;
    const [query2] = await dbInitalized.execute(insert);
    console.log(query2);
    // res.send({ messaage: "booked successfully and inserted correctly" });
  } else {
    var checkexecute = `SELECT CAST( booked_date  AS Date ) 
      from sportsproject.slot_booking_history 
      where DATE(booked_date) = CURDATE() and user_name = "${user}";`;
    const [query3] = await dbInitalized.execute(checkexecute);
    console.log(query3);
    if (query3.length > 0) {
      uec = true;
    } else {
      uec = false;
      var updateUser = `update sportsproject.slot_booking_history 
        set slot_time = '${booked}', booked_date = curdate()
        where userID = ${id};`;
      const [query4] = await dbInitalized.execute(updateUser);
      console.log(query4);
    }
  }

  console.log("coming out of the async functions");
  //updating slot availability
  if ((ue == true && uec == false) || ue == false) {
    var updateSlotBooking = `UPDATE sportsproject.slots_booking
    SET availability = "NO"
    WHERE
    slot_time = '${booked}'`;
    await dbInitalized.execute(updateSlotBooking);
  }
  if (uec == true) {
    res.send({
      messaage:
        "You have already booked a slot today, you cannot book more slot",
    });
  } else if (uec == false && ue == true) {
    res.send({
      messaage: "slot booked and updated successfully",
    });
  }
  // else {
  //   res.send({
  //     messaage: "slot booked successfully",
  //   });
  // }
});
app.post("/resource_booking", async function name(req, res) {
  var booked = req.body.quantity;
  console.log(booked);
  var equipment = req.body.equip;
  console.log(equipment);
  var username = req.body.user;
  console.log(username);
  var id = req.body.id;
  console.log(id);
  // var checkEquipment = `select resource_name from sportsproject.resource_booking_history where resource_name = "${equipment} and userID = ${id};"`;
  // const [checkedResource] = await dbInitalized.execute(checkEquipment);
  // console.log(checkedResource);
  // if (checkedResource.length > 0) {
  //   var update = ``;
  // } else {
  // }
  var sql = `UPDATE sportsproject.resource_booking
    SET resources_booked = resources_booked+'${booked}', available_inventory = available_inventory-'${booked}' 
    WHERE
    resource_name = "${equipment}"`;
  console.log(sql);
  await dbInitalized.execute(sql);

  //inserting into resource_booking_history
  var insertQuery = `insert into sportsproject.resource_booking_history
  (userID, user_name, resource_name, booked_date)
  values (${id}, "${username}", "${equipment}", CURDATE())`;
  const [insertHistory] = await dbInitalized.execute(insertQuery);
  console.log(insertHistory);
});
app.delete("/reset_resource", async function name(req, res) {
  var resetResource = `DELETE FROM sportsproject.resource_booking_history`;
  const [resetHistory] = await dbInitalized.execute(resetResource);
  console.log(resetHistory);
  var alterIncrement = `ALTER table sportsproject.resource_booking_history AUTO_INCREMENT = 1`;
  const [alter] = await dbInitalized.execute(alterIncrement);

  if (resetHistory.length > 0) {
    res.send({
      messaage: "Table reset successful",
    });
  }
});
app.post("/add_item", async function name(req, res) {
  var resource = req.body.name;
  console.log(resource);
  var quantity = req.body.quantity;
  console.log(quantity);
  var ur = false;
  var ir = false;
  var check = `select resource_name from sportsproject.resource_booking where resource_name = "${resource}"`;
  const [checked] = await dbInitalized.execute(check);
  if (checked.length > 0) {
    var update = `update sportsproject.resource_booking set total_inventory = total_inventory+'${quantity}' where resource_name = "${resource}"`;
    const [updated] = await dbInitalized.execute(update);
    ur = true;
  } else {
    var insert = `insert into sportsproject.resource_booking (resource_name,total_inventory,available_inventory,resources_booked) values ("${resource}","${quantity}","${quantity}","0");`;
    const [insertedResource] = await dbInitalized.execute(insert);
    ir = true;
  }
  if (ur == true) {
    res.send({
      messaage: "current inventory updated",
    });
  }
  if (ir == true) {
    res.send({
      messaage: "new resource has been added",
    });
  }
});
app.get("/active_bookings", async function name(req, res) {
  //available ground slots
  var slots = `select count(availability) AS availableSlots from sportsproject.slots_booking where availability = "YES";`;
  const [availableSlots] = await dbInitalized.execute(slots);
  console.log(availableSlots);

  //available resources
  var availableResources = `SELECT SUM(available_inventory) as availableResources,
  SUM(total_inventory) as totalResources FROM sportsproject.resource_booking;`;
  const [resourcesAvailable] = await dbInitalized.execute(availableResources);

  //active resources booked
  var bookedResources = `SELECT SUM(resources_booked) as resourcesBooked, 
   SUM(total_inventory) as totalResources  FROM sportsproject.resource_booking;`;
  const [bookedItems] = await dbInitalized.execute(bookedResources);
  //console.log(bookedItems[0]);

  //active slot booking
  var slotsBooked = `select count(availability) as slotsBooked from sportsproject.slots_booking where availability = "NO";`;
  const [bookedSlots] = await dbInitalized.execute(slotsBooked);

  //total slots
  var totalSlots = `select count(availability) as totalSlots from sportsproject.slots_booking;`;
  const [slotTotal] = await dbInitalized.execute(totalSlots);

  let activeSlotRatio = `${bookedSlots[0].slotsBooked.toString()}/${slotTotal[0].totalSlots.toString()}`;
  // console.log(activeSlotRatio);

  let resourceBookedRatio = `${bookedItems[0].resourcesBooked.toString()}/${bookedItems[0].totalResources.toString()}`;
  // console.log(resourceBookedRatio);

  let availableResourcesRatio = `${resourcesAvailable[0].availableResources.toString()}/${resourcesAvailable[0].totalResources.toString()}`;
  // console.log(availableResourcesRatio);

  let availableSlotRatio = `${availableSlots[0].availableSlots.toString()}/${slotTotal[0].totalSlots.toString()}`;
  // console.log(availableSlotRatio);

  //images
  const imagePath1 = "/images/booking.png";
  const imagePath2 = "/images/stadium.png";
  const imagePath3 = "/images/equip-2.png";
  const imagePath4 = "/images/available-slot.png";
  const countData = [
    {
      count: activeSlotRatio,
      name: "Active Slot",
      image: imagePath1,
    },
    {
      count: resourceBookedRatio,
      name: "Active Resource",
      image: imagePath2,
    },
    {
      count: availableResourcesRatio,
      name: "Available Resource",
      image: imagePath3,
    },
    {
      count: availableSlotRatio,
      name: "Available Slots",
      image: imagePath4,
    },
  ];

  //slot bookings history
  var sh = false;
  var slots = `select * from sportsproject.slot_booking_history`;
  const [slotHistory] = await dbInitalized.execute(slots);
  // console.log(slotHistory);
  if (slotHistory.length > 0) {
    sh = true;
  }
  //resource bookings history
  var resources = `select * from sportsproject.resource_booking_history`;
  const [resourceHistory] = await dbInitalized.execute(resources);
  console.log(countData);
  console.log(slotHistory);
  res.send({
    data: countData,
    slotTable: slotHistory,
    resourceTable: resourceHistory,
    messaage: "all counts sent",
  });
});
var server = app.listen(8801, async function () {
  var host = server.address().address;
  var port = server.address().port;
  dbInitalized = await db();
  // console.log(dbInitalized);
  //   var sql = `select availability from sportsproject.slots_booking where availability  = "YES";`;

  //   await dbInitalized.execute(sql, async function (err, result) {
  //     if (err) {
  //       console.log(err.message);
  //       throw err;
  //     }
  //   });
  //   console.log(sql);
  // console.log("tables shown 1");
  console.log("Example app listening at http://%s:%s", host, port);
});
