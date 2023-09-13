

const express = require('express');
require('dotenv').config();

const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const multer = require('multer');
const path = require('path'); // Add path module
const fs = require('fs');

const jwt = require('jsonwebtoken');
const User = require('./model/userModel');
const Listing = require('./model/ListingSchemamodel')
const Reservation=require('./model/ReservationSchema')

const app = express();
const PORT = 5000;



mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


app.use(express.json()); // Middleware to parse JSON in request body
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(cors({ credentials: true, origin: 'https://airbnbcloneby-shantanu.netlify.app' }));

app.use(cookieParser());
app.use(session({
  secret: 'mkmvorenbtop',
  resave: false,
  saveUninitialized: true
}));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    console.log("photosUploading")
  },
});

const photosMiddleWare = multer(storage);




// Register route
app.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const newUser = await User.create({ username, password, email });
        console.log('New user created:', newUser);
        res.send('User registered successfully');
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('An error occurred during registration');
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            req.session.username = user.username; // Store the username in the session
            const token = jwt.sign({ email: user.email, id: user._id }, process.env.secretkey, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
            res.json({ message: 'Logged in successfully',username:user.username });
        } else {
            console.log('User not found');
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('An error occurred during login');
    }
});

// Profile route
app.get('/profile', (req, res) => {
    const username = req.session.username;
    if (username) {
        res.json({ username: username });
    } else {
        res.status(401).send('Not logged in');
    }
});



app.post('/logout', (req, res) => {
    // Invalidate the session or revoke the token here
    // For example, if you are using express-session:
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        res.status(500).json({ message: 'Logout failed' });
      } else {
        res.clearCookie('token'); // Clear the token cookie
        res.json({ message: 'Logout successful' });
      }
    });
  });

 

  app.post('/allListing',async(req,res)=>{
    
    ownerName=req.body.userName
    console.log(ownerName.userName,"req.ody")
    try {
      const listings = await Listing.find({ownerName:ownerName.userName})
      res.json(listings);
      
    } catch (error) {
      console.error('Error listings not available:', error);
      res.status(500).json({ error: 'An error occurred while geting listings' });
    }

  })

  app.post('/listing', photosMiddleWare.array('photos'), async (req, res) => {
    console.log(req.files,"req.files")
    console.log(req.body,"req.body")
    
    

    const uploadedFiles = [];
    const newlistings = []; // Store created listings
  
    try {
      for (let i = 0; i < req.files.length; i++) {
        const { path, originalname, mimetype } = req.files[i];
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath);
        uploadedFiles.push(newPath.replace('uploads/', ''));
  
        // Create a new listing using the Listing model
     
      }
      let listingData = JSON.parse(req.body.listing);
      console.log(listingData,"listigdata")
      listingData={...listingData,photos:uploadedFiles}
      const newListing = await Listing.create(listingData);
      newlistings.push(newListing); // Add the created listing to the array
  
      console.log('New listings created:', newlistings);
    } catch (error) {
      console.error('Error creating listings:', error);
      return res.status(500).json({ error: 'An error occurred while creating the listings' });
    }
  
    // Send a response after the loop has completed
    res.status(201).json({ message: 'Listings created successfully', listings: newlistings });
  });
  
  app.post('/Listing/delete',async(req,res)=>{
    try {
      let listing_title=req.body.title
      console.log(listing_title,"title" )
      const deleteResult = await Listing.deleteOne({title:listing_title});
      res.status(201).json({message:"Listing deleted succesfully"})
      console.log(deleteResult.deletedCount);
      
    } catch (error) {
      
    }
  })

  app.put('/listings/:id', photosMiddleWare.array('photos'), async (req, res) => {
    console.log(req.body,"ahciuahc",req.files)
    const listingId=req.params.id 
    const listingData = JSON.parse(req.body.listing);
    const { title, description, amenities, price, location } = listingData;

    const uploadedFiles = [];
  
    try {
      // Find the listing by ID
      const listing = await Listing.findById(listingId);
      
  
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }
  
      // Update the listing properties
      listing.title = title;
      listing.description = description;
      listing.amenities = amenities;
      listing.price = price;
      listing.location = location;
  
      // Handle uploaded files if needed (similar to your existing code)
  
      // Save the updated listing
      const updatedListing = await listing.save();
  
      res.status(200).json({ message: 'Listing updated successfully', listing: updatedListing });
    } catch (error) {
      console.error('Error updating listing:', error);
      res.status(500).json({ error: 'An error occurred while updating the listing' });
    }
  });
  

  app.post('/filter', async (req, res) => {
    try {
      const filterName = req.body.filterName; // Assuming you are sending a filterName in the request body
      console.log(filterName)
      if (filterName === 'Amazing-View') {
        const keywords = ['amazing', 'stunning', 'breathtaking','nature',"lake","sea","mountain","valley","view"]; // Add more keywords as needed
        const keywordPattern = keywords.join('|');
  
        const featureItems = await Listing.find({ description: { $regex: keywordPattern, $options: 'i' } });
        console.log('Filtered items:', featureItems);
        // Using .find() instead of .findOne() to get all matching items
        
        res.json(featureItems);
      } else if(filterName=="New"  ){
        const featureItems = await Listing.find().sort({ _id: -1 })
        res.json(featureItems);


      }else if(["Beach-Front","Lake-Front","Pool"].includes(filterName)){
        if(filterName=="Pool"){
          const featureItems = await Listing.find({ description: { $regex: filterName, $options: 'i' } });
          console.log('Filtered items:', featureItems);
          res.json(featureItems);
        }else if(filterName=="Beach-Front"){
          const featureItems = await Listing.find({ amenities: { $in: ["Beach Access"] } });
          console.log('Filtered items:', featureItems);
          res.json(featureItems);

        }else{
          const featureItems = await Listing.find({ amenities: { $in: ["Lake Access"] } });
          console.log('Filtered items:', featureItems);
          res.json(featureItems);

        }


      }
      else {
        const featureItems1 = await Listing.find({ structure: filterName}); // Using .find() instead of .findOne() to get all matching items
        const featureItems2 = await Listing.find({ amenities: [filterName]}); // Using .find() instead of .findOne() to get all matching items
        console.log(featureItems2);
        res.json([...featureItems1,...featureItems2]); 
        // Handle other cases here
      }
     // Sending the filtered items as a JSON response
    } catch (error) {
      console.error('Error filtering items:', error);
      res.status(500).json({ error: 'An error occurred while filtering items' });
    }
  });

  app.post("/Reserve", async (req, res) => {
    try {
      const Reservation_data = req.body;
      
      console.log(Reservation_data, "Reservation Data"); // Add this line
      const listing = await Listing.findById(Reservation_data.listingId);
      console.log(Reservation_data.user,"Booked by")
      listing.bookedUsers.push(Reservation_data.user)


      const newBooking = {
        startDate: Reservation_data.startDate,
        endDate: Reservation_data.endDate,
        user: Reservation_data.user,
      };
  
      // Push the new booking to the bookings array
      listing.bookingDates.push(newBooking);
      await listing.save();
      console.log(listing,"listing")
      const Reservation_Book = await Reservation.create(Reservation_data);
      res.json({ message: 'Reservation successful', Reservation_Book: Reservation_Book });
    } catch (error) {
      return res.status(500).json({ error: 'please enter all details' });
    }
  });

  

  app.post("/search", async (req, res) => {
    try {
        const searchQuery = req.body.location; // Get the location from the request body
        
        // Using regex to search for listings with a location containing the search query
        const searchResult = await Listing.find({
            location: { $regex: searchQuery, $options: 'i' } // $options: 'i' makes the search case-insensitive
        });

        res.json(searchResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post("/Trips", async (req, res) => {
  try {
      const user = req.body;
      const allTrips = await Reservation.find(user);
      if (allTrips.length === 0) {
        return res.status(404).json({ message: "No bookings found for this owner." });
      }
  
      const enrichedTrips = await Promise.all(
        allTrips.map(async (Trip) => {
          const listing = await Listing.findOne({ title: Trip.listing });
          console.log(listing)
  
          return {
            ...Trip._doc,
            listing: listing,
          };
        })
      );
  
      // Logging combined information for all bookings
      console.log(enrichedTrips);
  
      // Sending the response including enriched bookings information
      res.json(enrichedTrips);
  } catch (error) {
      console.error("Error fetching trips:", error);
      res.status(500).json({ error: "An error occurred while fetching trips." });
  }
});


app.post('/Trip/delete',async(req,res)=>{
  try {
    let tripPlaceId=req.body
    console.log(tripPlaceId,"title" )
    const deleteResult = await Reservation.deleteOne(tripPlaceId);
    res.status(201).json({message:"Listing deleted succesfully"})
    console.log(deleteResult.deletedCount);
    
  } catch (error) {
    res.status(404).json({message:"Listing deleted unsuccesfully"})
    
  }
})

app.post("/Bookings", async (req, res) => {
  try {
    const owner = req.body; // Assuming you're extracting owner information from the request body

    // Fetch all bookings for the given owner
    const allBookings = await Reservation.find( owner );

    if (allBookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this owner." });
    }

    const enrichedBookings = await Promise.all(
      allBookings.map(async (booking) => {
        const listing = await Listing.findOne({ title: booking.listing });
        console.log(listing)

        return {
          ...booking._doc,
          listing: listing,
        };
      })
    );

    // Logging combined information for all bookings
    console.log(enrichedBookings);

    // Sending the response including enriched bookings information
    res.json(enrichedBookings);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ error: "An error occurred while fetching trips." });
  }
});



app.post('/Booking/delete',async(req,res)=>{
  try {
    let BookingId=req.body
    console.log(BookingId,"title" )
    const deleteResult = await Reservation.deleteOne(BookingId);
 
    res.status(201).json()
    console.log(deleteResult.deletedCount);
    
  } catch (error) {
    res.status(404).json({message:"Listing deleted unsuccesfully"})
    
  }
})

app.get('/listings/:id/reviews', async (req, res) => {
  try {
      const listingId = req.params.id;
      console.log("listingid:",listingId)

      // Replace this with your database query logic to fetch reviews for the given listingId
      const listing = await Listing.findById(listingId);
      let Rating = 0;
      for (let i of listing.reviews) {
        Rating += i.rating;
      }
      console.log("division by :",listing.reviews.length)
      const averageRating = Rating / listing.reviews.length;
      console.log(listing,"getListing")
      listing.averageRating = averageRating||0;
      await listing.save();

      // Return the fetched reviews in the response
      res.json(listing.reviews);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Backend code
app.post('/listings/:id/reviews', async (req, res) => {
  const listingId = req.params.id;
  const reviewData = req.body;
  console.log(reviewData, "reviewData");

  try {
    const listing = await Listing.findById(listingId);
    let Rating = 0;
    for (let i of listing.reviews) {
      Rating += i.rating;
    }
    console.log("division by :",listing.reviews.length)
    const averageRating = Rating / listing.reviews.length; // Corrected average calculation

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    listing.reviews.push(reviewData);
    listing.averageRating = averageRating||0;
    await listing.save();

    res.status(201).json(listing.reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});





app.delete('/listings/:id/reviews/:reviewId', async (req, res) => {
  const listingId = req.params.id;
  const reviewId = req.params.reviewId;
  
  try {
    // Use Mongoose to find the listing by ID
    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Use Mongoose to find the index of the review by its ID
    const reviewIndex = listing.reviews.findIndex((review) => review._id.toString() === reviewId);

    if (reviewIndex === -1) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Remove the review/comment
    const deletedReview = listing.reviews.splice(reviewIndex, 1)[0];

    // Recalculate the average rating for the listing
    if (listing.reviews.length === 0) {
      listing.averageRating = 0;
    } else {
      const totalRatings = listing.reviews.reduce((sum, review) => sum + review.rating, 0);
      listing.averageRating = totalRatings / listing.reviews.length;
    }

    // Save the updated listing to the database
    await listing.save();

    res.json({ message: 'Review deleted successfully', deletedReview });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});






  

    
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});



 