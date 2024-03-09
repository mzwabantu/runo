const express = require('express');
const { populate } = require('../models/Article');
const router = express.Router();
const Article = require('../models/Article')
const Category = require('../models/Category')

router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({}).populate('categories')
            .populate('userId', '-__v -password -createdAt -updatedAt -email')
            .limit(8).exec();
        const recentArticles = await Article.find({}).populate('categories').limit(3).exec();
        const editorsPick = await Article.find({}).populate('categories').limit(2).exec();
        const featuredArticle = await Article.find({}).populate('categories').limit(1).exec();
        const categories = await Category.find({});
        const active = req.active;
        
        res.render('index', {
            recentArticles,
            articles,
            featuredArticle,
            editorsPick,
            categories,
            active
        });
    } catch (err) {
        res.status(500).json(err)
    }
   
});


router.get('/about', (req, res) => {
    res.render('pages/about')
})


router.get('/contact-us', (req, res) => {
    res.render('pages/contact')
})

module.exports = router;
