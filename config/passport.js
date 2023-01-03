const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');



module.exports = function(passport) {
    passport.use(
      new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
       // match user
       User.findOne({email:email}, (err, user)=>{
        if(err){
            console.log(err);
        }else{
            if(!user){
                return done(null, false, {message:`The email ${email} is not registered!`});
            }else{
                // match the password
                bcrypt.compare(password, user.password, (err, isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        return done(null, user);
                    }else{
                        return done(null, false, {message:"Password is incorrect"});
                    }
                });
            }
        }
       })
      })
    );

    // serializing user
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialize user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
          done(err, user);
        });
    });
}