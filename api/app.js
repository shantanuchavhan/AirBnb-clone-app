const express = require('express');
require('dotenv').config();

const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const routes = require('./Routes/applicationRoutes')
const app = express();
const PORT = 5000;

console.log(process.env.MONGODB_URI)


mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})
.then(() => {
  console.log("Connected to MongoDB"); // Log a message after successful connection
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error); // Log an error if the connection fails
});


mongoose.connect(process.env.MONGODB_URI,{
  useUnifiedTopology:true,
  useNewUrlParser:true
}).then(()=> console.log("DataBase Connected")).catch((err)=>{
  console.log(err);
})



app.use(express.json()); // Middleware to parse JSON in request body
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(cors({ credentials: true, origin: 'https://64fed3d5860af040388682ca--incandescent-twilight-a7ef13.netlify.app' }));

app.use(cookieParser());
app.use(session({
  secret: 'mkmvorenbtop',
  resave: false,
  saveUninitialized: true
}));
app.use('/api', routes);


// Register route







  

    
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});



