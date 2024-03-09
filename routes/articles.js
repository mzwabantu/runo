const express = require('express');
const router = express.Router();
const path = require('path');

const Article  = require('../models/Article');
const Category = require('../models/Category');
const isAuth = require("../middleware/is-auth");
const isPermitted = require("../middleware/is-permitted");
const { saveImage, removeImage } = require("../helpers/images");
const marked = require('marked');
const { dompurify } = require('../models/Article');


// CREATE ARTICLE
router.post('/', isAuth, async (req, res) => {
    const newArticle = new Article(req.body);
    newArticle.userId = req.session.userId;

    if(req.file) newArticle.thumbnail = saveImage(req.file.filename);   

    try {
        const categories = await Category.find({});   

        try {            
            const savedArticle = await newArticle.save();
            res.redirect(`/articles/${savedArticle.slug}`);
        } catch (err) {
            if(req.file) {
                removeImage( path.join('images', req.file.filename) );
            }
           
            res.render('articles/new', {
                errorMessage: "Error creating article.",
                article: newArticle,
                categories
            });
        }
    } catch(err) {
        res.render('articles/new', {
            errorMessage: err,
            article: newArticle,
            categories: []
        });
    }    
});


// CREATE ARTICLE VIEW
router.get('/new', isAuth, async (req, res) => {
    const article = new Article(req.body);

    try {
        const categories = await Category.find({});
        res.render('articles/new', { article, categories });
    } catch (error) {
        res.render('articles/new', { 
            article, 
            categories: [],
            errorMessage: "Oops! Something went wrong."
        });
    }    
});


// UPDATE ARTICLE
router.put('/:id', isAuth, isPermitted, async (req, res) => {

    try {
        const article = await Article.findById(req.params.id)
                                    .populate('userId', ' -__v -password -createdAt -updatedAt -email')
                                    .exec();
        
        if( article.userId.id == req.session.userId) {
            try {
                const updatedArticle = await Article.findByIdAndUpdate(req.params.id, {
                    $set: req.body
                }, { new: true});    

                if(req.file != null && req.file.filename != '') {
                    const oldFileName = updatedArticle.thumbnail;

                    updatedArticle.thumbnail = saveImage(req.file.filename); 
                    await updatedArticle.save();
                    
                    if(oldFileName) {
                        removeImage(oldFileName); 
                    }
                }

                if(req.body.body) {
                    updatedArticle.sanitizedHtml = dompurify.sanitize( marked.parse( req.body.body ) )
                    await updatedArticle.save();
                }

                res.redirect(`/articles/${updatedArticle.slug}`);
            } catch (error) {
                res.render('articles/edit', {
                    errorMessage: error, //"Error updating article.",
                    article: article
                });
            }

        } else {
            res.render('articles/show', {
                errorMessage: "You can update only your articles.",
                article: article
            });
        }
        
    } catch (err) {
        res.status(500).json(err);
    }
});


// DELETE ARTICLE
router.delete('/:id', isAuth, isPermitted, async (req, res) => {

    try {
        const article = await Article.findById(req.params.id)
                                .populate('userId', ' -__v -password -createdAt -updatedAt -email')
                                .exec()
        
        if( article.userId.id === req.session.userId) {
            try {
                const fileName = article.thumbnail.split('/').pop();
                removeImage(fileName);                
               await article.delete();    
                res.status(200).redirect('/');
            } catch (error) {
                res.redirect('/');
            }

        } else {
            res.status(401).json("You can delete only your article.");
        }
        
    } catch (err) {
        res.status(500).json(err);
    }
});


// GET UPDATE VIEW
router.get('/:id/edit', isAuth, isPermitted, async (req, res) => {
    try {
        const categories = await Category.find({});
        const article = await Article.findById( req.params.id)
                                    .populate('categories')
                                    .populate('userId', ' -__v -password -createdAt -updatedAt -email')
                                    .exec();
        res.render('articles/edit', {article, categories})
    } catch (err) {
        res.redirect('/');
    }
});


// GET ARTICLE
router.get('/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({slug: req.params.slug})
                                    .populate('categories')
                                    .populate('userId', ' -__v -password -createdAt -updatedAt -email')
                                    .exec();
        const relatedArticles = await Article.find({categories: {$in: article.categories}}).where("_id").ne(article._id).populate('categories').exec();
        const active = req.params.slug;
        res.render('articles/show', {article, active, relatedArticles})
    } catch (err) {
        res.redirect('/');
    }
});


// GET ARTICLES
router.get('/', async (req, res) => {
    const username = req.query.user;
    let articles;

    try {
        let categories = await Category.find({}).sort('name').exec();
        
        if(username) {
            articles = await Article.find()
                            .populate('categories')
                            .populate('userId', ' -__v -password -createdAt -updatedAt -email')
                            .exec();
            articles = articles.filter( article => article.userId.username === username);
        } else {
            articles = await Article.find({})
                            .populate({path: 'categories'})
                            .populate('userId', ' -__v -password -createdAt -updatedAt -email')
                            .sort({createdAt: 'desc'})
                            .exec();
        }

        const activeCategoryNames = findActive(articles, 'categories', 'slug');
        categories = categories.filter( cat => cat.slug === activeCategoryNames.find( c => c === cat.slug) );

        const activeUserNames = [...new Set(articles.map( article => article.userId))];
        const image =  articles[0].thumbnail;

        res.render('articles/index', {
            articles, 
            image,
            query: username,
            categories, 
            users: activeUserNames,
            active: 'articles'})
        
    } catch (err) {
        res.redirect('/');
    }
});


function findActive(arr, nestedArr, prop) {
    const newArr = arr.map( elem => elem[nestedArr])
                        .map( elem => elem.map( el => el[prop])).join(',').split(',');
    return [...new Set(newArr)].sort();
}

module.exports = router;
