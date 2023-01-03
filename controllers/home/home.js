const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated} = require('../../config/auth');
const Url = require('../../models/Url');

const getHomePage = (req, res)=>{
    res.render('home', {title:'Home Page'});
}

const getDashboard = (req, res)=>{
    if(req.user.role === 'normal_user'){
        req.flash('success_msg',"You are successfully logged in");
        res.redirect('/user/dashboard?user-login=success');
    }else{
        req.flash('success_msg',"You are successfully logged in");
        res.redirect('/admin/dashboard?admin-login=success');
    }
}



/** * * * * * * * * * * * * * * *@login * * * * * * * * * * * * * * * * * * */
const getLoginPage = (req, res)=>{
    res.render('login', {title:'Login Page'});

}

const loginUser = (req, res, next)=>{
    const {email, password} = req.body;
    let errors = [];
    // check empty fields
    if(!email || !password){
        errors.push({message: "Please fill all fields"});
    }
    if(errors.length>0){
        res.render('login', {title:'Login Page',errors, email, password});
    }else{
        passport.authenticate('local',{
            successRedirect: '/dashboard',
            failureRedirect: '/login',
            failureFlash: true,
            successFlash: true
        })(req, res, next);
    }
}






/** * * * * * * * * * * * * * * *@signup * * * * * * * * * * * * * * * * * * */

const getSignupPage = (req, res)=>{
    res.render('signup', {title:'Signup Page'});
}
const signupUser = (req, res)=>{
    const {fullName, email , password, confirm_password} = req.body;
    let errors = [];

    // check if fields are empty
    if(!fullName || !email || !password || !confirm_password){
        errors.push({message: "Please fill all fields"});
    }

    // check password length min:6
    if(password.length < 6){
        errors.push({message:'Password should contain at least 6 characters!'});
    }

    // check if password and confirm password are the same
    if(password != confirm_password){
        errors.push({message:'Password do not match!'});
    }

    if(errors.length > 0){
        res.render('signup', {title:'Signup Page', errors, fullName, email, password, confirm_password});
    }else{
        User.findOne({email: email}, (err, user)=>{
            if(err){
                console.log(err);
            }else{
                // user exists
                if(user){
                    errors.push({message: `${email} is already registered!`});
                    res.render('signup', {title:'Signup Page',errors, fullName, email, password});
                }else{
                    const newUser = User({
                        fullName, email, password
                    });
                    // hash password
                    bcrypt.genSalt(10, (err, salt)=>{
                        bcrypt.hash(newUser.password, salt, (err, hashedPassword)=>{
                            if(err) throw err;
                            // set password to hashed password
                            newUser.password = hashedPassword;
                            newUser.save((err)=>{
                                if(err){
                                    console.log(err);
                                }else{
                                    req.flash('success_msg',`${fullName} you are successfully registered and can login now!`);
                                    res.redirect('/login');
                                }
                            })
                        });
                    });
                }
            }
        });
    }
}

/** * * * * * * * * * @shortened_url * * * * * * * * * * * * * * * * * * */
const redirectToOriginalUrl = (req, res)=>{
    let url_id = req.params.url_id;
    Url.findOne({url_id: url_id}, (err, foundUrlId)=>{
        if(err) throw err;
        else{
            if(foundUrlId){
                if(url_id === foundUrlId.url_id){
                    const now = new Date();
                    const urlValidation = foundUrlId.valid_until;
                    const url_validation_date = new Date(urlValidation);
                    if (now.getTime() > url_validation_date.getTime())
                        res.send("The link is not valid anymore...");
                    else{
                        foundUrlId.click_count += 1;
                        Url.updateOne({_id: foundUrlId._id},{click_count: foundUrlId.click_count}, (e)=>{
                            if(e){
                                console.log(e);
                            }
                        })
                        res.redirect(foundUrlId.original_url);
                    }
                }
            }else{
                res.render('404', {title: "404 Error"});
            }
        }
    })

}

module.exports = {getHomePage, getLoginPage, getSignupPage, signupUser, loginUser, getDashboard, redirectToOriginalUrl};