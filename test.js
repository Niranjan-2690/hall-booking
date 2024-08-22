const express = require("express");
const httpServer = express();
//const { v4: uuidv4 } = require('uuid');


//Middleware
httpServer.use(express.json())


// Creating room
let rooms = {};
let nextRoomId = 1

httpServer.post("/rooms", (req, res)=>{
    const {room_number, number_of_seats_available, amenities, price_per_hour} = req.body
    if(!room_number || !number_of_seats_available || !amenities || !price_per_hour){
        res.status(404).json({message: "Missing required fields"})
    }

        const room_id = nextRoomId++;
        rooms[room_id] = {
        room_id,
        room_number,
        number_of_seats_available,
        amenities,
        price_per_hour
    }
    return res.status(200).json({...rooms, status:"created", message: "The room has been successfully created"})

})

//Getting all rooms

httpServer.get("/rooms", (req, res)=>{
    console.log(rooms)
    res.json(rooms)
})

//Local server connect
httpServer.listen(3000, "localhost", (err)=>{
    if(err){
        console.log("Error", err)
    }else{
        console.log("Server is connected")
    }
})