const express = require('express')
const userSchema = require('./models/user')


async function csrf(req, res, next) { //checks if there is a csrf token
    //console.log(req.headers.h_csrf_token)
    if (req.headers.h_csrf_token && req.headers.h_csrf_token == req.cookies.CSRF_TOKEN) {
        //validate CSRF Token
        //how? QUERY db for csrf token -- just check it is a valid csrf token (separate collection), csrf that belongs to user can be done later
        /* implement later  */
        console.log(5)
        next()
    }
    else {
        res.status(400).end() //stops route from progressing
    }
}

module.exports = { csrf } 