module.exports = {
    //middleware
    ensureAuthenticated: (req, res, next) => {
        //req.isAuthenticated comes baked with passport
        if(req.isAuthenticated()) {
            return next()
        }
        req.flash('error_msg', 'Please log in to view this resource')
        res.redirect('/users/login')
    }
}