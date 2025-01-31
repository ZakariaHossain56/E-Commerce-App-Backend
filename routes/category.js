const express = require('express');
const router = express.Router();
const Category = require('../model/category');
const SubCategory = require('../model/subCategory');
const Product = require('../model/product');
const { uploadCategory } = require('../uploadFile');
const multer = require('multer');   //for handling file uploads
const asyncHandler = require('express-async-handler');

// Get all categories
router.get('/', asyncHandler(async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ success: true, message: "Categories retrieved successfully.", data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Get a category by ID
router.get('/:id', asyncHandler(async (req, res) => {
    try {
        const categoryID = req.params.id;
        const category = await Category.findById(categoryID);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        res.json({ success: true, message: "Category retrieved successfully.", data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));


//get the image
router.get('/image/:imageName', asyncHandler(async (req, res) => {
    try {
        const imageName = req.params.imageName;
        const imagePath = path.join(__dirname, '../public/category', imageName);

        // Check if the image exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ success: false, message: "Image not found." });
        }
        
        // Send the image file
        res.sendFile(imagePath);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));

// Create a new category with image upload
router.post('/', asyncHandler(async (req, res) => { //The asyncHandler wrapper ensures that errors in async operations are handled properly without crashing the server.
    try {
        uploadCategory.single('img')(req, res, async function (err) {   //This is a middleware created using multer that processes a single file upload. The uploaded file is expected to have the field name img
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    err.message = 'File size is too large. Maximum filesize is 5MB.';
                }
                console.log(`Add category: ${err}`);
                return res.json({ success: false, message: err });
            } else if (err) {
                console.log(`Add category: ${err}`);
                return res.json({ success: false, message: err });
            }
            const { name } = req.body;  //Retrieves the name of the category from the request body
            let imageUrl = 'no_url';
            if (req.file) { //Checks if a file was uploaded. If present, constructs the file URL using the uploaded file's filename
                imageUrl = `https://e-commerce-app-backend-three.vercel.app/image/category/${req.file.filename}`;
            }
            console.log('url ', req.file)

            if (!name) {    //Ensures the name field is provided. If not, it sends a 400 Bad Request response.
                return res.status(400).json({ success: false, message: "Name is required." });
            }

            try {
                const newCategory = new Category({  //creates a new category
                    name: name,
                    image: imageUrl
                });
                await newCategory.save();   //store the document in the database
                res.json({ success: true, message: "Category created successfully.", data: null });
            } catch (error) {
                console.error("Error creating category:", error);
                res.status(500).json({ success: false, message: error.message });
            }

        });

    } catch (err) {
        console.log(`Error creating category: ${err.message}`);
        return res.status(500).json({ success: false, message: err.message });
    }
}));

// Update a category
router.put('/:id', asyncHandler(async (req, res) => {
    try {
        const categoryID = req.params.id;
        uploadCategory.single('img')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    err.message = 'File size is too large. Maximum filesize is 5MB.';
                }
                console.log(`Update category: ${err.message}`);
                return res.json({ success: false, message: err.message });
            } else if (err) {
                console.log(`Update category: ${err.message}`);
                return res.json({ success: false, message: err.message });
            }

            const { name } = req.body;
            let image = req.body.image;

            if (req.file) {
                image = `https://e-commerce-app-backend-three.vercel.app/image/category/${req.file.filename}`;
            }

            if (!name || !image) {
                return res.status(400).json({ success: false, message: "Name and image are required." });
            }

            try {
                const updatedCategory = await Category.findByIdAndUpdate(categoryID, { name: name, image: image }, { new: true });
                if (!updatedCategory) {
                    return res.status(404).json({ success: false, message: "Category not found." });
                }
                res.json({ success: true, message: "Category updated successfully.", data: null });
            } catch (error) {
                res.status(500).json({ success: false, message: error.message });
            }

        });

    } catch (err) {
        console.log(`Error updating category: ${err.message}`);
        return res.status(500).json({ success: false, message: err.message });
    }
}));

// Delete a category
router.delete('/:id', asyncHandler(async (req, res) => {
    try {
        const categoryID = req.params.id;

        // Check if any subcategories reference this category
        const subcategories = await SubCategory.find({ categoryId: categoryID });
        if (subcategories.length > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete category. Subcategories are referencing it." });
        }

        // Check if any products reference this category
        const products = await Product.find({ proCategoryId: categoryID });
        if (products.length > 0) {
            return res.status(400).json({ success: false, message: "Cannot delete category. Products are referencing it." });
        }

        // If no subcategories or products are referencing the category, proceed with deletion
        const category = await Category.findByIdAndDelete(categoryID);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found." });
        }
        res.json({ success: true, message: "Category deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}));






module.exports = router;
