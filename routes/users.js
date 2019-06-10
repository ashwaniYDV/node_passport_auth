const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const passport = require('passport')

const { ensureAuthenticated } = require('../config/auth')
const User = require('../models/User')


//Login page
router.get('/login', (req, res) => {
    res.render('login');
})

//Register page
router.get('/register', (req, res) => {
    res.render('register');
})

//Allusers page (protected route)
router.get('/', ensureAuthenticated, (req, res) => {
    User.find({})
        .then((users) => {
            res.render('users', {users: users});
        })
        .catch((err) => {
            console.log(err)
        })
})


//Register handle
router.post('/register', (req, res) => {
    const {name, email, password, password2} = req.body
    let errors = []

    //check required fields
    if(!name || !email || !password || !password2) {
        errors.push({msg: 'Please fill in all fields'})
    }

    //check password match
    if(password !== password2) {
        errors.push({msg: 'Passwords do not match'})
    }

    //check min password length of 6
    if(password.length < 6) {
        errors.push({msg: 'Password should be atleast 6 characters long'})
    }

    if(errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        })
    } else {
        //Validation passed
        User.findOne({ email: email })
            .then((user)=>{
                if(user) {
                    //user already exists
                    errors.push({ msg: 'Email is already registered' })
                    res.render('register', {
                        errors,
                        name,
                        email,
                        password,
                        password2
                    })
                } else {
                    const newUser = new User({
                        name,
                        email,
                        password
                    })

                    //Hash password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err
                            newUser.password=hash
                            console.log(newUser)
                            newUser.save()
                                .then((user) => {
                                    req.flash('success_msg', 'You are now registered and can log in!')
                                    res.redirect('/users/login')
                                })
                                .catch((err) => {
                                    console.log(err)
                                })
                        })
                    })
                    
                }
            })
    }
})


//Login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next)
})


//Logout handle
router.get('/logout', (req, res, next) => {
    //this method comes baked with passport middleware
    req.logout()
    req.flash('success_msg', 'You are logged out')
    res.redirect('/users/login')
})


module.exports = router;