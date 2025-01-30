const mongoose = require('mongoose');

// Define the SubCategory schema
const subCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'], // Adding custom error message
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', // This should match the model name you use when you create the Category model
        //Establishes a relationship with the Category model. This allows MongoDB to populate the field with the corresponding Category document when querying.
        required: [true, 'Category ID is required']
    }
},{ timestamps: true });

// Create the SubCategory model
const SubCategory = mongoose.model('SubCategory', subCategorySchema);

module.exports = SubCategory;

