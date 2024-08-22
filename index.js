const express = require("express")
const httpServer = express()

//Middleware
httpServer.use(express.json())

let rooms = []
let bookedrooms = []


// Creating a Rooms

httpServer.post("/creatingroom", (req, res) => {
    const room = req.body; // Extracting room data from the request body

    // Validate the room object
    if (!room || Object.keys(room).length === 0) {
        return res.status(400).json({message: "Missing some fields"}); // Return on validation error
    }

    rooms.push(room);
    res.status(201).json({ 
        message: "Room created successfully",
        data: rooms
    });
});

// Booking a room
httpServer.post("/roombooking", (req, res) => {
    const { roomId, customer_name, date, start_time, end_time } = req.body;

    // Validate booking request
    if (!roomId || !customer_name || !date || !start_time || !end_time) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const roomToBook = rooms.find(room => room.id === roomId && room.status !== "Booked");

    if (!roomToBook) {
        return res.status(404).json({ message: "Room not found or already booked." });
    }

    const currentDate = new Date();
    const startTime = new Date(`${date}T${start_time}`);
    const endTime = new Date(`${date}T${end_time}`);

    if (startTime < currentDate || endTime <= startTime) {
        return res.status(400).json({ message: "Invalid booking times." });
    }

    // Check for overlapping bookings
    const isOverlapping = bookedrooms.some(booking => 
        booking.roomId === roomId &&
        ((startTime < new Date(`${booking.date}T${booking.end_time}`)) &&
        (endTime > new Date(`${booking.date}T${booking.start_time}`)))
    );

    if (isOverlapping) {
        return res.status(400).json({ message: "The room is already booked for the selected time." });
    }

    const roomBooking = {
        roomId, 
        customer_name, 
        date, 
        start_time, 
        end_time
    };

    bookedrooms.push(roomBooking);
    roomToBook.status = "Booked"; // Update the room status

    res.status(201).json({ // Use 201 Created status
        message: "Room booked successfully",
        data: roomBooking
    });
});

//Getting rooms with booked data

httpServer.get("/creatingroom", (req, res) => {
    // Create a map to store booked room details
    const bookedRoomDetails = bookedrooms.map(booking => {
        // Find the room corresponding to the booking
        const room = rooms.find(room => room.id === booking.roomId);
        return {
            room_number: room.room_number,
            status: room.status,
            customer_name: booking.customer_name,
            date: booking.date,
            start_time: booking.start_time,
            end_time: booking.end_time
        };
    });

    if (bookedRoomDetails.length === 0) {
        return res.status(404).json({ message: "No rooms are currently booked." });
    }

    res.status(200).json({
        message: "Rooms fetched successfully",
        data: bookedRoomDetails
    });
});

// Getting customers with booked data

httpServer.get("/bookedcustomers", (req, res)=>{
    const bookedcustomers = bookedrooms.map(booking => {
        // Find the room corresponding to the booking
        const room = rooms.find(room => room.id === booking.roomId);
        return {
            customer_name: booking.customer_name,
            room_number: room.room_number,
            date: booking.date,
            start_time: booking.start_time,
            end_time: booking.end_time
        };
    });

    if (bookedcustomers.length === 0) {
        return res.status(404).json({ message: "No customers are currently booked." });
    }

    res.status(200).json({
        message: "customers names fetched successfully",
        data: bookedcustomers
    });
});

//How many times customers booked
httpServer.get("/bookedcustomers/:customername", (req, res)=>{
    const {customername} = req.params

    if(!customername || customername.trim()===""){
        return res.status(400).json({
            message: "Customer name is required",
        });
    }

    const customerBookings = bookedrooms.filter(booking=>booking.customer_name === customername)
    const count = customerBookings.length

    if (count === 0) {
        return res.status(404).json({
            message: `No bookings found for ${customername}`,
        });
    }

    const bookingDetails = customerBookings.map(booking => {
        const room = rooms.find(room => room.id === booking.roomId);
        return {
            customer_name: booking.customer_name,
            room_number: room.room_number,
            date: booking.date,
            start_time: booking.start_time,
            end_time: booking.end_time
        };
    });
    
    res.status(200).json({
        message: `${customername} has booked ${count} times`,
        data: bookingDetails
    })
})

httpServer.listen(3000, "0.0.0.0", (err)=>{
    if(err){
        console.log("Error", err)
    }else{
        console.log("Server connected")
    }
})