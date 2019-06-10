const express = require('express')
const expressEjsLAyouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

//Setup app
const app = express()

//passport config
require('./config/passport')(passport)

//DB config
const {MongoURI} = require('./config/keys')
//Connect to Mongodb
mongoose.connect(MongoURI, {useNewUrlParser: true})
    .then(()=>{
        console.log('MongoDB connected!')
    })
    .catch((err)=>{
        console.log(err)
    })

//Setup middleware
    // EJS
    app.use(expressEjsLAyouts)
    app.set('view engine', 'ejs')

    // Bodyparser(It is now part of express)
    app.use(express.urlencoded({ extended: false }))

    //Express Session
    app.use(session({
        secret: 'secretShit',
        resave: true,
        saveUninitialized: true
      }))

    //passport middleware
    app.use(passport.initialize());
    app.use(passport.session());

    //Connect flash (flash requires session middleware)
    app.use(flash())

    //Global Vars
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        next()
    })

// Routes
app.use('/', require('./routes/index'))
app.use('/users', require('./routes/users'))

//Server stuff
const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log(`Server listening to port ${PORT}`)
})