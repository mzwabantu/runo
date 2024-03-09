if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require('multer');
const path = require('path');

// Middleware
const isAuth = require("./middleware/is-auth");

// Import Routes
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const articleRouter = require('./routes/articles');
const categoryRouter = require('./routes/categories');

// Mongo Session
const store = new MongoDBStore({
    uri: process.env.DATABASE_URL,
    collection: "sessions",
});

// Set-up
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.set("layout', 'auth/auth", false);
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({limit: '10mb', extended: false}))
app.use(express.json())
app.use(methodOverride('_method'))

// Use Session
app.use(
    session({
      secret: process.env.SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
    })
); 

app.use((req, res, next) => {    
    res.locals.isAuth = req.session.isAuth ? true : false;
    res.locals.userId = req.session.userId ? req.session.userId : null;
    res.locals.username = req.session.username ? req.session.username : null;
    res.locals.profilePic = req.session.profilePic ? req.session.profilePic : null;
    next();
});


// Database
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
// mongoose.connect(process.env.DATABASE_URL, {useNewURLParser: true});
// const db = mongoose.connection;
// db.on('error', error => console.error(error));
// db.once('open', () => console.log('Connected to Mongoose'));

const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.DATABASE_URL);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
}

// Images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join('public',  'images') )
    }, filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname )
    }
});

const upload = multer({storage: storage});


// app.listen(process.env.PORT);

// Routes
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/users', isAuth, upload.single("profilePic"), userRouter);
app.use('/articles', upload.single("thumbnail"), articleRouter);
app.use('/categories', categoryRouter);


  //Connect to the database before listening
  connectDB().then(() => {
      app.listen(process.env.PORT || 3000, () => {
          console.log("listening for requests");
      })
  })
