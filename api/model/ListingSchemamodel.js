    const mongoose = require('mongoose');

    // Create a Mongoose schema for the listing
    const listingSchema = new mongoose.Schema({
      ownerName: { type: String, required: true }, // Make username unique
      structure: String,
      privacyType: String,
      location: String,
      floorplan: {
        guestCount: Number,
        bedCount: Number,
        bathroomCount: Number,
      },
      amenities: [String],
      photos: [Object], // Store file paths or URLs
      title:  { type: String, required: true,unique:true },
      description: String,
      price: Number,
      discounts: [{
        label: String,
        percent: Number,
      }],
      reviews: [
        {
          user: String, // Make this optional
          text: String,
          rating: Number,
        },
      ],
    
      averageRating: Number, 
      bookedUsers: [String],
      bookingDates: [
        {
          startDate: Date,  // Start date of the booking
          endDate: Date,    // End date of the booking
          user: String,     // User who made the booking
        },
      ],
    });

    // Create a model using the schema
    const Listing = mongoose.model('Listing', listingSchema);

    module.exports = Listing;
    