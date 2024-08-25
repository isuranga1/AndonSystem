const express = require("express");
const app = express();
const mongoose = require("mongoose");
const UserModel = require("./models/Users");
const ConsoleIDModel = require("./models/ConsoleIds");
const CallModel = require("./models/Calls");
const RecordModel = require("./models/Records");
const http = require("http"); // this is used for socket.io
const { Server } = require("socket.io");
const { Parser } = require("json2csv");
const fs = require("fs");

const cors = require("cors"); // connects to react
const server = http.createServer(app); // for sockets

//connect esp32 using websockets
var WebSocketServer = require("websocket").server;
const port = 443;
let statarray = {};

const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });

var serverforEsp = http.createServer(function (request, response) {
  console.log(new Date() + " Received request for " + request.url);
  response.writeHead(404);
  response.end();
});
//

app.use(express.json()); // this parses json which gives by frontend to objects used in backend
app.use(cors()); //import the library

const io = new Server(server, {
  // Enables CORS for easy connection with React frontend eg:-(http://localhost:3000)
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//database connection initilaisation
mongoose
  .connect(
    "mongodb+srv://isuranga1:Nevira2001@cluster0.gkszxqj.mongodb.net/andondb?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  ) //Change this to the according database
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

//------------------------- Endpoints for the 1st page--------------------------------------

let recordedcalls = [];

let activecalls = [
  {
    consoleid: 215,
    callhours: 3,
    collmints: 4,
    department: 2,
    call1: "Blue",
    call2: "",
    call3: "",
    oldcall: "",
  },
];

app.get("/getGraph", async (req, res) => {
  // can be demo by thunderclient

  try {
    const graph = [
      { x: 0, y: 8 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 1 },
      { x: 4, y: 3 },
      { x: 5, y: 1 },
      { x: 6, y: 5 },
    ];
    res.json(graph);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: " error graph" });
  }
});

app.get("/getActiveCalls", async (req, res) => {
  // can be demo by thunderclient

  try {
    res.json(activecalls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error active calls " });
  }
});
//-------------Endpoints for the machines(2nd)page----------------------------

// get machine numbers and console ID s

app.get("/getMachines", async (req, res) => {
  // can be demo by thunderclient

  try {
    const machine = await ConsoleIDModel.find({});
    res.json(machine);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching machines" });
  }
});

// post machine numbers and console ID s to the database
app.post("/createMachine", async (req, res) => {
  // can be demo by thunderclient

  const machine = req.body;
  const newMachine = new ConsoleIDModel(machine);
  await newMachine.save();
  res.json(machine);
});

app.post("/deletemachine", async (req, res) => {
  try {
    const machine = req.body;
    const deletedMachine = await ConsoleIDModel.deleteOne({
      machine: machine.machine,
    });
    if (deletedMachine.deletedCount === 1) {
      res.json({ message: "Machine deleted successfully" });
    } else {
      res.status(404).json({ error: "Machine not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//----------------------------Endpoints for the calls(3rd)page--------------------------------------------------------

app.get("/getCalls", async (req, res) => {
  try {
    const call = await CallModel.find({});
    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching machines" });
  }
});

app.post("/createCall", async (req, res) => {
  const call = req.body;
  const newCall = new CallModel(call);
  await newCall.save();
  res.json(call);
});

app.post("/deletecall", async (req, res) => {
  try {
    const call = req.body;
    console.log(call);
    const deletedCall = await CallModel.deleteOne({ Color: call.Color });
    if (deletedCall.deletedCount === 1) {
      res.json({ message: "Call deleted successfully" });
    } else {
      res.status(404).json({ error: "Call not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//---------------------------------Endpoints for the depts(4th)page----------------------------------------

app.get("/getUsers", async (req, res) => {
  try {
    const users = await UserModel.find({});
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

app.post("/createUser", async (req, res) => {
  const user = req.body;
  const newUser = new UserModel(user);
  await newUser.save();
  res.json(user);
});

app.post("/deleteuser", async (req, res) => {
  try {
    const user = req.body;
    const deletedUser = await UserModel.deleteOne({ name: user.name });
    if (deletedUser.deletedCount === 1) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//-------endpoint for records to database---------------------------------------------------------------------------------

// Example function to save a record into the database
const saveRecordToDatabase = async (recordData) => {
  try {
    const newRecord = new RecordModel(recordData);
    await newRecord.save();
    console.log("Record saved successfully:", newRecord);
  } catch (error) {
    console.error("Error saving record:", error);
  }
};

//------------------------------------------------

server.listen(3001, () => {
  //listening for websocket server

  console.log("websocket server is running");
});
app.listen(3002, () => {
  console.log("server runs");
});

//code for esp32

serverforEsp.listen(port, function () {
  console.log(new Date() + " ESPServer is listening on port 443");
});
wsServer = new WebSocketServer({
  httpServer: serverforEsp,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false,
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", (message) => {
    //console.log(`Received: ${message}`);
    //const response = "Hello from Node.js server";
    //console.log(`Sending: ${response}`);
    //ws.send(response);
    if (message.type !== "utf8") {
      console.log("messgae is not utf");
      // console.log('Received Message: ' + message.utf8Data);
      //connection.sendUTF(message.utf8Data); this resend the reseived message, instead of it i will send a custom message. hello from nodejs
      const receivedData = message.utf8Data;
      //const dataArray = JSON.parse(message.utf8Data);
      const dataArray = JSON.parse(message);

      if ("consoleid" in dataArray) {
        let now = new Date();
        (dataArray["callhours"] = String(now.getHours()).padStart(2, "0")),
          (dataArray["collmints"] = String(now.getMinutes()).padStart(2, "0"));
        console.log(dataArray);

        let index = activecalls.findIndex(
          (obj) => obj.consoleid === dataArray["consoleid"]
        );

        if (index !== -1) {
          let array1 = activecalls[index];
          if (
            array1["call1"] != dataArray["call1"] ||
            array1["call2"] != dataArray["call2"] ||
            array1["call3"] != dataArray["call3"]
          ) {
            activecalls[index] = dataArray;
            //io.emit("callUpdate", dataArray);
            //console.log(activecalls);
            array1 = activecalls[index];
            saveRecordToDatabase(array1);

            if (
              array1["call1"] == "" &&
              array1["call2"] == "" &&
              array1["call3"] == ""
            ) {
              activecalls = activecalls.filter(
                (item) => item.consoleid != array1["consoleid"]
              );
            }
          }
        } else {
          if (
            !(
              dataArray["call1"] == "" &&
              dataArray["call2"] == "" &&
              dataArray["call3"] == ""
            )
          ) {
            activecalls.push(dataArray);
            //io.emit("callUpdate", dataArray);
            console.log(activecalls);
          }
        }
      }

      io.emit("callUpdate", activecalls);
      //io.emit("statUpdate", statarray);
      console.log(statarray);
      console.log(activecalls);
      statarray = {
        stat1: "5 hours",
        stat2: activecalls.length,
        stat3: "80%",
      };
      //connection.sendUTF("Received Message");
    } else if (message.type === "binary") {
      //console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      //connection.sendBytes(message.binaryData);
    }
  });
  //
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  io.emit("callUpdate", activecalls);

  io.emit("statUpdate", statarray);
  // Function to emit an event with the integer value
  //function sendArrayToFrontend(sockettype, array) {
  //if (
  // typeof array !== "number" ||
  //!Number.isInteger(array)
  //) {
  //console.error("Invalid argument: Please provide an integer value.");
  //return;
  // }

  // Custom event name
  //}

  // sendArrayToFrontend("callUpdate", activecalls);
  // console.log(activecalls);
  //sendArrayToFrontend("statUpdate", statarray);
  //console.log(statarray);

  // Listen for potential disconnections
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
// endcode for esp 32

//------------------------------download csv

const downloadCollectionAsCSV = async () => {
  try {
    // Fetch all records from the collection
    const records = await RecordModel.find({}).lean();

    // Define the fields for the CSV
    const fields = [
      "consoleid",
      "callhours",
      "collmints",
      "department",
      "call1",
      "call2",
      "call3",
      "oldcall",
    ];

    // Convert JSON to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(records);

    // Save CSV to a file
    const filePath = "yourFile.csv";
    fs.writeFileSync(filePath, csv);

    console.log(`CSV file saved at ${filePath}`);
  } catch (error) {
    console.error("Error exporting collection as CSV:", error);
  } finally {
    //mongoose.connection.close(); // Close the connection once done
  }
};
downloadCollectionAsCSV();
