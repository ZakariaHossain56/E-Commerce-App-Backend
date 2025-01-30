const mongoose = require('mongoose');   //A Node.js library for interacting with MongoDB.

const categorySchema = new mongoose.Schema({    //creates a schema
    name: { type: String, required: true },
    image: { type: String, required: true }
}, { timestamps: true });   //Automatically adds createdAt and updatedAt fields to the schema.

module.exports = mongoose.model('Category', categorySchema);    //Compiles the schema into a model named Category
//-----> Makes the Category model available for import in other files