const express = require('express')
const userSchema = require('./models/user')
const identifierSchema = require('./models/token')


async function csrf(req, res, next) { //checks if there is a csrf token
    if (req.headers.h_csrf_token && req.headers.h_csrf_token == req.cookies.CSRF_TOKEN) {
        //validate CSRF Token
        //how? QUERY db for csrf token -- just check it is a valid csrf token (separate collection), csrf that belongs to user can be done later
        /* implement later  */
        const result = await identifierSchema.find({csrf_token: req.headers.h_csrf_token})
        if (result == undefined || Object.keys(result).length === 0) {
            res.status(400).json({msg: "Unidentified CSRF Token"}).end()
        }
        else {
            next()
        }
        
    }
    else {
        res.status(400).end() //stops route from progressing
    }
}

async function validateFields(req, res, next) {
    const email = req.body.email; const username = req.body.user; const password = req.body.password; const firstPass = req.body.firstPass; const secondPass = req.body.secondPass
    let codes = hasWhiteSpace([email, password, firstPass, secondPass, username], [])
    if (Object.keys(req.body).length === 4) {
        if (!email || ! username || !secondPass || !firstPass) { res.status(400).json({msg: "Invalid Input"}).end(); return}
        if (username.length < 6) { codes.push("1101") }
        else if ( username.length > 16) { codes.push("1100")}
        if (firstPass.length < 8 ) { codes.push("1001") }
        else if (firstPass.length > 32) { codes.push("1000")}
        if (secondPass.length < 8 ) { codes.push("2001") }
        else if (secondPass.length > 32) { codes.push("2000")}
        if (firstPass != secondPass) { codes.push("3000")}
        if (email.indexOf("@") === -1 || email.indexOf(".") === -1) { codes.push("1111")}
        if (codes.length !== 0) { res.status(400).json({codes: codes}).end(); return }
    }
    else if (Object.keys(req.body).length === 2) {
        if (!username || !password) { res.status(400).json({msg:"Invalid Input"}).end(); return}
        if (username.length < 6) { codes.push("1101") }
        else if ( username.length > 16) { codes.push("1100")}
        if (password.length < 8 ) { codes.push("1001") }
        else if (password.length > 32) { codes.push("1000")}
        if (codes.length !== 0) { res.status(400).json({codes: codes}).end(); return }
    }
    else {
        res.status(400).end(); return
    }
    next()
}

function hasWhiteSpace(array, codes) { //expand a bit
    for (let i = 0; i < array.length; i++) {
        if (array[i] !== undefined && /\s/.test(array[i])) {
            switch (i) {
                case 0: { codes.push("e0000"); break }
                case 1: { codes.push("p0000"); break }
                case 2: { codes.push("f0000"); break }
                case 3: { codes.push("s0000"); break }
                case 4: { codes.push("u0000"); break }
            }
        }
    }
    return codes
}


async function loggedIn_Or_Not(req, res, next) {
    if (req.signedCookies.SESSION_ID !== undefined) {
        const response = await identifierSchema.find({session_token: req.signedCookies.SESSION_ID})
        if (response && Object.keys(response).length > 1) {res.status(504).end(); return }
        if (response && Object.keys(response).length === 1) {
            if (response[0].userID !== undefined) { //associated user, so authenticated session token
                res.status(400).json({msg: "Already Logged In"}); return
            }
            next()
        }
        else {
            res.status(504).end(); return
        }
    }
    else {
       next() 
    }
    
}

async function loggedOut_Or_Not(req, res, next) {
    if (req.signedCookies.SESSION_ID !== undefined) {
        const response = await identifierSchema.find({session_token: req.signedCookies.SESSION_ID})
        if (response && Object.keys(response).length < 1) {res.status(504).end(); return }
        if (response && Object.keys(response).length === 1) {
            if (response[0].userID === undefined) { //associated user, so authenticated session token
                res.status(400).json({msg: "Not Logged In"}); return
            }
            next()
        }
        else {
            res.status(504).end(); return
        }
    }
    else {
       return
    }
    
}



module.exports = { csrf, validateFields, loggedIn_Or_Not, loggedOut_Or_Not } 