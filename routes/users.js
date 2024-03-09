const router = require('express').Router();
const User = require('../models/User');
const Article = require('../models/Article');
const bcrypt = require('bcrypt');

const isAuth = require("../middleware/is-auth");
const { saveImage, removeImage } = require("../helpers/images");


// UPDATE
router.put('/:id',  async (req, res) => {
    if( req.params.id === req.session.userId) {       
        try {
            const updatedUser = await User.findById(req.params.id);            

            if(req.file != null && req.file.filename != '') {
                const oldFileName = updatedUser.profilePic;
                updatedUser.profilePic = saveImage(req.file.filename);                
                
                if(oldFileName) removeImage(oldFileName); 
            }

            if(req.body.password) {
                const salt = await bcrypt.genSalt(10);
                const newPass = await bcrypt.hash(req.body.password, salt);
                updatedUser.password = newPass;  
            } else {
                updatedUser.password = updatedUser.password;
            }
            updatedUser.name = req.body.name ? req.body.name: updatedUser.name;
            updatedUser.title = req.body.title ? req.body.title: updatedUser.title;
            updatedUser.email = req.body.email ? req.body.email: updatedUser.email;

            await updatedUser.save();
            res.redirect(`/users/${updatedUser.id}`);
        } catch(err) {
            req.session.error = "Something went wrong!"
            res.redirect(`/users/${req.params.id}`);
        }
    } else {
        res.redirect('/')
    }
});


// UPDATE VIEW
router.get('/:id', isAuth,  async (req, res) => {
    const error = req.session.error;
    delete req.session.error;

    try {
        const user = await User.findById(req.params.id);
        
        if( user.username === req.session.username) {
            res.render('users/edit', {user, errorMessage: error} )
        } else {
            res.redirect('/')
        }        
    } catch(err) {
        res.redirect('/');
    }
});


// DELETE
router.delete('/:id', async (req, res) => {
    if( req.session.userId === req.params.id) {
        try {
            const user = await User.findById(req.params.id);

            try {
                const articles = await Article.find({userId: user.id});
                articles.forEach( article => {
                    if( article.thumbnail) removeImage(article.thumbnail);
                });

                if(user.profilePic) removeImage(user.profilePic);

                await Article.deleteMany({userId: user.id})
                await user.remove();

                req.session.destroy((err) => {
                    if (err) throw err;
                    res.redirect("/auth");
                });
            } catch(err) {
                res.status(500).json(err);
            }
        } catch (error) {
            res.status(404).json("User not found");
        }        
    } else {
        res.status(401).json("You can delete only your account.")
    }
});


module.exports = router;