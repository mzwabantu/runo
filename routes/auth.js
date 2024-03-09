const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');


// REGISTER
router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);

        const existingUser = await User.findOne({ email: req.body.email, });

        if (existingUser) {
            req.session.error = "User already exists";
            return res.redirect("/auth");
        }

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPass,
        });       

        const user = await newUser.save();
        res.redirect('/auth')
    } catch(err) {
        return res.redirect('/auth');
    }
});


// LOGIN
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({username: req.body.username});

        if(!user) {
            req.session.error = "No such user found!"
            return res.redirect('/auth');
        }        

        const validated = await bcrypt.compare(req.body.password, user.password);
        if(!validated) {
            req.session.error = "Invalid credentials!"
            return res.redirect('/auth');
        }

        req.session.isAuth = true;
        req.session.username = user.username;
        req.session.userId = user.id;
        req.session.profilePic = user.profilePic;
        res.redirect(`/users/${user.id}`);

    } catch (err) {
        req.session.error = "Error logging in!"
        return res.redirect('/auth');
    }
})


//  LOGOUT
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect("/auth");
    });
})

// VIEW
router.get('/', (req, res) => {
    const user = new User(req.body)
    const error = req.session.error;
    delete req.session.error;

    res.render('auth/auth', { layout: 'auth/auth', errorMessage: error, user });
});

module.exports = router;