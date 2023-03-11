const express = require('express')
const { db } = require('../models/user')
const router = express.Router()
const userSchema = require('../models/user')
const crypto = require('crypto')
const { csrf, validateFields, loggedIn_Or_Not } = require('../auth')
const tokenSchema = require('../models/token')

router.use(csrf)


router.post('/register', [validateFields, loggedIn_Or_Not], async(req,res)=>{
    const data = req.body //should be reg form
    console.log('hello?')
    /* Validation Here */
    //authenticate(data)
    /* Saving to DB */
    try {
        //throw new Error()
        const existingUser$ = await userSchema.find({$or: [{email: data.email},{username: data.user}]})
        if (existingUser$ && Object.keys(existingUser$).length === 0) {
            
            const obj = {
                email: data.email,
                username: data.user,
                password: data.firstPass,
            }
            const newUser = new userSchema(obj)
            newUser.save()
            res.json("DONE")
        }
        else { //user already exists
            let code
            if (existingUser$.length > 1 || (existingUser$[0].email === data.email && existingUser$[0].username === data.user)) { //means email and username already taken
                code = "110"
            } else if (existingUser$[0].email === data.email) {
                code = "001"
            } else if (existingUser$[0].username === data.user) {
                code = "010"
            } else {
                console.log(data)
                throw new Error({msg: "Unknown Data"})
            }
            res.status(403).json({code:code})
        }
    }
    catch (err) {
        console.log(err)
    }
    
})

router.post('/login', [validateFields, loggedIn_Or_Not] , async(req, res)=>{ //make sure login is only possible if not alr logged in (i.e. multiple ppl logging in)
    const data = req.body
    const foundUser$ = await userSchema.find({username: data.user, password: data.password})
    if (foundUser$ && Object.keys(foundUser$).length === 1) { //send sessionID, authentication Token
        //we know csrf token exists in our token collection
        const result = await tokenSchema.find({csrf_token: req.headers.h_csrf_token})
        if (Object.keys(result).length > 1 || !result) { res.status(403).json({message: "Invalid CSRF"}).end(); return }
        const tokenID = result[0]._id; 
        //check if it already exists to a user -- there's the chance that it belongs to selected user...
        const userQuery = result[0].userID
        let session = crypto.randomBytes(128).toString('hex')
        let exists = await tokenSchema.find({session_token: session}) //change to pull all records when app gets big
        while (Object.keys(exists).length > 0) {
            session = crypto.randomBytes(128).toString('hex')
            exists = await tokenSchema.find({session_token: session})
        }
        if (userQuery && userQuery.equals(foundUser$[0]._id)) { //if the id's match? only match for a day (this could be sketch)
            await tokenSchema.findOneAndUpdate({userID: foundUser$[0]._id, csrf_token: req.headers.h_csrf_token}, {session_token: session})
            res.cookie('SESSION_ID', session, {sameSite: 'strict', httpOnly: true, maxAge: 1000*60*60*6, signed: true})
            res.status(200).json({username: foundUser$[0].username})
            
        }
        else if (userQuery && !(userQuery.equals(foundUser$[0]._id))) {
            res.status(403).json({message: "Invalid CSRF"}).end(); return 
        }
        else {
            //now we need to associate this csrf with a userid
            await tokenSchema.findOneAndUpdate({csrf_token: req.headers.h_csrf_token}, {session_token: session, userID: foundUser$[0]._id})
            res.cookie('SESSION_ID', session, {sameSite: 'strict', httpOnly: true, maxAge: 1000*60*60*6, expires: 1000*60*60*6, signed: true})
            res.status(200).json({username: foundUser$[0].username})
            
        }
         //fix sessionId
         //instead of using authtoken, or cookie, to validate requests coming in, or use an JWT... associate CSRF with user upon login
        //we use the sessionid to determine if its from the right csrf, which is why we link the csrf to a user
        //so if there is a sessionid, we remove this login path, same with register
    }
    else {
        res.status(401).json({code:"01101111011101"})
    }
    
})

router.post('/signOut', async(req, res)=> { //have some other way to clear users (if they don't log out)
    const data = req.body; const session = req.signedCookies.SESSION_ID; const csrf = req.cookies.CSRF_TOKEN
    if (session === undefined) { res.status(401).end(); return }
    const response = await tokenSchema.find({session_token: session, csrf_token: csrf})
    if (Object.keys(response).length === 0 ) { res.status(401).end('Error')}
    const user = await userSchema.find({_id: response[0].userID, username: data.username})
    if (Object.keys(user).length === 0 || response[0].userID === undefined || user[0].username !== data.username) {
        res.status(401).end(); return
    }
    else { //valid user, just remove linked user, and clear cookies on the res back
        await tokenSchema.findOneAndUpdate({session_token: session, csrf_token: csrf}, {$unset: {userID: '', session_token: '', csrf_token: ''}})
        res.clearCookie('CSRF_TOKEN'); res.clearCookie('SESSION_ID'); //H_CSRF_TOKEN should auto be removed maybe??
        let xsrf = crypto.randomBytes(64).toString('hex')
        let exists = await tokenSchema.find({csrf_token: xsrf})
        while (Object.keys(exists).length > 0) {
            xsrf = crypto.randomBytes(64).toString('hex')
            exists = await tokenSchema.find({csrf_token: xsrf})
        }
        const obj = {
            csrf_token: xsrf,
        }
        const newToken = new tokenSchema(obj)
        await newToken.save()
        res.header('Content-Security-Policy', "default-src 'self'; style-src 'self', 'unsafe-inline'") //??
        res.cookie('CSRF_TOKEN', xsrf, {sameSite: 'strict', maxAge: 1000*60*60*6, expires: 1000*60*60*6})
        res.status(200).json({msg: "Signed Out Successfully"})
    }
})


module.exports = router

