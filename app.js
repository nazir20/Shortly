const express = require('express');
const ejs = require('ejs');
const mongoose = require('mongoose');
require('dotenv').config();
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const homeRoutes = require('./routes/home');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');


/** * * * * * * * * * * ** * * *@initial app setups  * * * * * * * * * * * * * * */
const app = express();
app.use(express.urlencoded({extended:false}));
app.set('view engine', 'ejs');
app.use(express.static('public'));




/** * * * * * * * * * * * * * *@session * * * * * * * * * * */
app.use(session({
    secret: "keyboard",
    resave: true,
    saveUninitialized: true,
}));




/** * * * * * * * * * * * * * * * * * *@passport config * * * * * * * * * * * * * * */
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());



/** * * * * * * * * * * * *@GLOBAL variables * * * * * * * * * * * */
app.use(flash());
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.flash_error = req.flash('error');
    res.locals.url_success = req.flash('url_success');
    next();
})





/** * * * * * * * * * * * * * * *@routs * * * * * * * * * * * * * * * * * * * */
app.use('/', homeRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.all('*', (req, res)=>{
    res.status(404).render('404', {title: '404 Error'});
})



/** * * * * * * * * * * * * *@PORT * * * * * * * * * * * * */
const PORT  = 8000 || process.env.PORT;

const start = async ()=>{
    try{
        /** * * * * * * * * * * * * * *@db * * * * * * * * * * * * *  */
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI).then(()=>{
            console.log('Connected to db');
        }).catch((e)=>{
            console.log('Could not connect to db. Error: ' + e);
        })
        app.listen(PORT, ()=>{
            console.log(`The app is running on port ${PORT}`);
        });
    }catch(e){
        console.log(e);
    }
}

start();