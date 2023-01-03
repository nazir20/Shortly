const UserModel = require('../../models/User');
const Url = require('../../models/Url');
const bcrypt = require('bcryptjs');




const getDashboard = (req, res)=>{
    let allInfo = {
        totalUsers: 0,
        totalUrls: 0,
        totalClicks: 0
    }
    UserModel.find({role:"normal_user"}, (err, foundedUsers)=>{
        if(err){
            console.log(err);
        }else{
            if(foundedUsers.length >0){
                allInfo.totalUsers = foundedUsers.length;
                Url.find({}, (err, foundedUrls)=>{
                    if(err){
                        console.log(err);
                    }else{
                        if(foundedUrls.length > 0){
                            let clicksSum = 0;
                            foundedUrls.forEach((url)=>{
                                clicksSum += url.click_count;
                            });
                            //
                            allInfo.totalUrls = foundedUrls.length;
                            allInfo.totalClicks = clicksSum;
                            res.render('admin/dashboard', {username:req.user.fullName, userInfo: req.user, generalInfo:allInfo});
                        }
                    }
                });
            }
        }
    });
}

const getProfile = (req, res)=>{
    res.render('admin/profile', {username:req.user.fullName, userInfo: req.user});
}

const editProfile = (req, res)=>{
    res.render('admin/edit_profile', {username:req.user.fullName, userInfo: req.user});
}

const editProfilePost = (req, res)=>{
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
                    res.redirect('/admin/profile');
                }
            });
        });
    });
}

const viewUsers = (req, res)=>{
    UserModel.find({role:"normal_user"}, (err, foundedUsers)=>{
        if(err){
            console.log(err);
        }else{
            if(foundedUsers.length > 0){
                res.render('admin/view_users', {users: foundedUsers, username:req.user.fullName}); 
            }else{
                res.render('admin/view_users', {users: [], username:req.user.fullName}); 
            }
        }
    });
}


const viewUserInfo = (req, res)=>{
    let user_id = req.params.user_id;
    UserModel.findOne({_id: user_id}, (err, user)=>{
        if(err){
            console.log(err);
        }else{
            if(user){
                Url.find({$and:[{userId: user._id}]}, (err, foundedUrls)=>{
                    if(err){
                        console.log(err);
                    }else{
                        if(foundedUrls.length > 0){
                            res.render('admin/view-user-info', {username: req.user.fullName, user: user, url:foundedUrls}); 
                        }else{
                            res.render('admin/view-user-info', {username: req.user.fullName, user:user, url:[]});
                        }
                    }
                });
            }else{
                res.render('admin/view-user-info', {username: req.user.fullName, message:"No user found!"});
            }
        }
    });
}

const linkAnalytics = (req, res)=>{
    let urlInfo = {
        totalUrls: 0,
        totalClicks: 0
    }
    Url.find({}, (err, foundedUrls)=>{
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
                    res.render('admin/link-analytics', {url_info:urlInfo, username:req.user.fullName, mostClickedUrl: {
                        original_url:'No Link Clicked Yet!',
                        shortened_url: 'Null',
                        click_count: 0,
                        valid_until: ''
                    }});
                }else{
                    res.render('admin/link-analytics', {url_info:urlInfo, mostClickedUrl: mostClickedUrl, username:req.user.fullName}); 
                }

            }else{
                res.render('admin/link-analytics', {url_info:urlInfo,username:req.user.fullName, mostClickedUrl: {
                    original_url:'No Url Created Yet!',
                    shortened_url: 'Null',
                    click_count: 0,
                    valid_until: ''
                }}); 
            }  
        }
    });
}


const deleteUser = (req, res)=>{
    let user_id = req.params.user_id;
    UserModel.deleteOne({_id: user_id}, (err)=>{
        if(err){
            req.flash('error_msg',"An error happened! The user could'nt be deleted! Try again!");
            res.redirect(`/admin/view/user/${user_id}`);
        }else{
            req.flash('success_msg',"The user has been successfully deleted!");
            res.redirect('/admin/view-users');
        }
    });
}


const logoutAdmin = (req, res)=>{
    req.logout((err)=>{
        if(err) throw err;
        else{
            req.flash('success_msg',"You are successfully logged out");
            res.redirect('/login?logout=success');
        }
    });
}


module.exports = {getDashboard, getProfile, editProfile, editProfilePost, logoutAdmin, viewUsers, viewUserInfo, deleteUser, linkAnalytics};