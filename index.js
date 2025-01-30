const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
//loading environment variables from a .env file into the Node.js application using the dotenv package.
const dotenv = require('dotenv');
dotenv.config();

const app = express();
//?Middle ware
app.use(cors({ origin: '*' }))  //enables CORS (Cross-Origin Resource Sharing) for the application, 
                                //allowing requests from any origin ('*')
app.use(bodyParser.json());     //makes the parsed data available in req.body


//? setting static folder path
app.use('/image/products', express.static('public/products'));  //If there’s an image file located at 
                                            //public/products/example.jpg, it can be accessed via the URL:
                                            //http://yourdomain.com/image/products/example.jpg
app.use('/image/category', express.static('public/category'));
app.use('/image/poster', express.static('public/posters'));


const URL = process.env.MONGO_URL;
mongoose.connect(URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));



// Routes
app.use('/categories', require('./routes/category'));   //Any request that starts with /categories will be
                                                        //handled by the router defined in ./routes/category
app.use('/subCategories', require('./routes/subCategory'));
app.use('/brands', require('./routes/brand'));
app.use('/variantTypes', require('./routes/variantType'));
app.use('/variants', require('./routes/variant'));
app.use('/products', require('./routes/product'));
app.use('/couponCodes', require('./routes/couponCode'));
app.use('/posters', require('./routes/poster'));
app.use('/users', require('./routes/user'));
app.use('/orders', require('./routes/order'));
app.use('/payment', require('./routes/payment'));
app.use('/notification', require('./routes/notification'));


// Example route using asyncHandler directly in app.js
app.get('/', asyncHandler(async (req, res) => {
    res.json({ success: true, message: 'API working successfully', data: null });
}));

// Global error handler
app.use((error, req, res, next) => {
    res.status(500).json({ success: false, message: error.message, data: null });
});


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});


 