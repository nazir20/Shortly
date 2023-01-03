const UserModel = require('../../models/User');
const bcrypt = require('bcryptjs');
const {nanoid} = require('nanoid');
const BASE = 'http://localhost:8000/';
const Url = require('../../models/Url');



const forgotPassword = (req, res)=>{
    res.render('forgot-password', {title:'Forgot Password'});
}

const getDashboard = (req, res)=>{
    let urlInfo = {
        totalUrls: 0,
        totalClicks: 0
    }
    Url.find({$and:[{userId: req.user._id}]}, (err, foundedUrls)=>{
        if(err){
            console.log(err);
        }else{
            if(foundedUrls.length > 0){
                urlInfo.totalUrls = foundedUrls.length;
                //
                let totalClicks = 0;
                foundedUrls.forEach((url)=>{
                    totalClicks += url.click_count;
                });
                //
                urlInfo.totalClicks = totalClicks;
                res.render('user/dashboard', {title:'User Dashboard', userInfo: req.user, urls:urlInfo, username:req.user.fullName}); 

            }else{
                res.render('user/dashboard', {title:'User Dashboard', userInfo: req.user, urls:urlInfo, username:req.user.fullName}); 
            }  
        }
    });
}

const getUserProfile = (req, res)=>{
    res.render('user/profile', {title:'User Profile', userInfo: req.user, username:req.user.fullName});
}

const editUserProfile = (req, res)=>{
    res.render('user/edit_profile', {title:'Edit Profile', userInfo: req.user, username:req.user.fullName});
}

const editUserProfilePost = (req, res)=>{
    // hash password
    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(req.body.password, salt, (err, hashedPassword)=>{
            if(err) throw err;
            // set password to hashed password
            UserModel.updateOne({_id: req.user.id}, {fullName:req.body.fullName, password: hashedPassword}, (err)=>{
                if(err){
                    console.log(err);
                }else{
                    req.flash('success_msg',`Your information has been successfully updated!`);
                    res.redirect('/user/profile');
                }
            });
        });
    });
}

const getAllUrls = (req, res)=>{
    Url.find({$and:[{userId: req.user._id}]}, (err, foundedUrls)=>{
        if(err){
            console.log(err);
        }else{
            if(foundedUrls.length > 0){
                res.render('user/urls', {title: "User's All Urls", urls: foundedUrls, username:req.user.fullName}); 
            }else{
                res.render('user/urls', {title: "User's All Urls", urls: [], username:req.user.fullName}); 
            }
        }
    });
}

const getFavoriteLinks = (req, res)=>{
    Url.find({$and:[{userId: req.user._id}]}, (err, foundedUrls)=>{
        if(err){
            console.log(err);
        }else{
            if(foundedUrls.length > 0){
                let favorite_urls = [];
                if(foundedUrls.length >0){
                    foundedUrls.forEach((url)=>{
                        if(url.is_favorite === true){
                            favorite_urls.push(url);
                        }
                    });
                    res.render('user/favorite_urls', {title: "User's Favorite Urls", urls: favorite_urls, username:req.user.fullName}); 
                }
            }else{
                res.render('user/favorite_urls', {title: "User's Favorite Urls", urls: [], username:req.user.fullName});
            }
        }
    });
}

const handleFavoriteLink = (req, res)=>{
    let url_id = req.body.url_id;
    Url.findOne({_id:url_id}, (err, foundedUrl)=>{
        if(err){
            console.log(err);
        }else{
            if(foundedUrl){
                let is_favorite = foundedUrl.is_favorite;
                if(is_favorite === true){
                    Url.findOneAndUpdate({_id:foundedUrl._id}, {is_favorite: false}, (err)=>{
                        if(err){
                            req.flash('error_msg','An error happened! Please try again!');
                            res.redirect('/user/all-urls?error=true');
                        }else{
                            req.flash('success_msg',"The shortened link successfully removed from favorite link's list.");
                            res.redirect('/user/all-urls?link-remove-from-favorites=success');
                        }
                    })
                }else{
                    Url.findOneAndUpdate({_id:url_id}, {is_favorite: true}, (err)=>{
                        if(err){
                            req.flash('error_msg','An error happened! Please try again!');
                            res.redirect('/user/all-urls?error=true');
                        }else{
                            req.flash('success_msg',"The shortened link successfully added to favorite link's list");
                            res.redirect('/user/all-urls');
                        }
                    })
                }
            }else{
                console.log('Url not Found!');
            }
        }
    })
}

const getAnalytics = (req, res)=>{
    let urlInfo = {
        totalUrls: 0,
        totalClicks: 0
    }
    Url.find({$and:[{userId: req.user._id}]}, (err, foundedUrls)=>{
        if(err){
            console.log(err);
        }else{
            if(foundedUrls.length > 0){
                urlInfo.totalUrls = foundedUrls.length;
                //
                let totalClicks = 0;
                foundedUrls.forEach((url)=>{
                    totalClicks += url.click_count;
                });
                //
                urlInfo.totalClicks = totalClicks;

                // finding the most clicked url by user
                let mostClickedUrl = foundedUrls.reduce((max, current) => max.click_count > current.click_count ? max : current);
                if(mostClickedUrl.click_count === 0){
                    res.render('user/analytics', {url_info:urlInfo, username:req.user.fullName, mostClickedUrl: {
                        original_url:'No Link Clicked Yet!',
                        shortened_url: 'Null',
                        click_count: 0,
                        valid_until: ''
                    }});
                }else{
                    res.render('user/analytics', {url_info:urlInfo, mostClickedUrl: mostClickedUrl, username:req.user.fullName}); 
                }

            }else{
                res.render('user/analytics', {url_info:urlInfo,username:req.user.fullName, mostClickedUrl: {
                    original_url:'No Url Created Yet!',
                    shortened_url: 'Null',
                    click_count: 0,
                    valid_until: ''
                }}); 
            }  
        }
    });
}


const shortenUrl = (req, res)=>{
    const original_url = req.body.original_url;
    const validate_date = new Date(req.body.validate_date);
    const now = new Date();
    let isLink_valid = true;

    // check link validate date selected by user
    if(validate_date !=''){
        if(validate_date.getTime() < now.getTime()){
            isLink_valid = false;
        }
    }

    if(!isLink_valid){
        req.flash('error_msg',"Please select a valid validation date for your link!");
        res.redirect('/user/dashboard?error=invalid-date');
    }else{
        const url_id = nanoid(10);
        const shortenedUrl = BASE + url_id;
        const newShortenedUrl = new Url({
            userId: req.user._id,
            original_url: original_url,
            url_id:url_id,
            shortened_url: shortenedUrl,
            valid_until: validate_date
        });
        newShortenedUrl.save((err)=>{
            if(err){
                console.log(err);
            }else{
                req.flash('url_success',`${shortenedUrl}`);
                res.redirect('/user/dashboard?url-shortened=success');
            }
        })
    }

}

const exportUrls = (req, res)=>{
    res.render('user/export_urls', {username:req.user.fullName});
}

const exportUrlsAsPdf = (req, res)=>{
    // displaying the pdf
}

const logoutUser = (req, res)=>{
    req.logout((err)=>{
        if(err) throw err;
        else{
            req.flash('success_msg',"You are successfully logged out");
            res.redirect('/login?logout=success');
        }
    });
}

module.exports = {forgotPassword, getDashboard, getUserProfile, logoutUser, editUserProfile, editUserProfilePost, shortenUrl, getAllUrls, handleFavoriteLink, getFavoriteLinks, getAnalytics, exportUrls, exportUrlsAsPdf};