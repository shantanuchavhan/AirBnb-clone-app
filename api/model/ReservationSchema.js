const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: { type:String,required: true }, // Reference to the user who made the reservation
    owner: { type:String, required: true }, // Reference to the owner of the listing
    listing: { type: String, required: true }, // Reference to the listing being reserved
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    guestCount:{type:Number},
    ReservationAmount:{type:Number,required: true}
    // Add more fields as needed
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;
