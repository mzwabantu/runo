const router = require('express').Router();
const Category = require('../models/Category');
const Article = require('../models/Article');

// CREATE
router.post('/', async (req, res) => {
    const category = new Category(req.body);

    try {
        const savedCat = await category.save();
        res.render('categories/show', { category : savedCat });
    } catch (err) {
        res.render('categories/new', { 
            category,
            errorMessage: "Error creating category."
         });
    }
});

// GET CREATE VIEW
router.get('/new', async (req, res) => {
    const category = new Category(req.body);
    res.render('categories/new', { category });
});

// GET ALL
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.render('categories/index', { categories });
    } catch (err) {
        res.status(500).json(err)
    }
});


// GET ONE
router.get('/:slug', async (req, res) => {
    try {
        const category = await Category.findOne({slug: req.params.slug});
        const articles = await Article.find({categories: category.id})
                                .populate('userId', '-__v -password -createdAt -updatedAt -email')
                                .populate('categories')
                                .exec();
        res.render('categories/show', { category, articles});
    } catch (err) {
        res.status(500).json(err)
    }
});

module.exports = router;