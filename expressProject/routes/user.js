const express = require('express')
const { db } = require('../models/user')
const router = express.Router()
const userSchema = require('../models/user')
const crypto = require('crypto')
const { csrf, validateFields, loggedIn_Or_Not } = require('../auth')
const tokenSchema = require('../models/token')

router.use(csrf)
router.use(validateFields)
router.use(loggedIn_Or_Not)


router.post('/register', async(req,res)=>{
    const data = req.body //should be reg form
    /* Validation Here */
    //authenticate(data)
    /* Saving to DB */
    try {
        //throw new Error()
        const existingUser$ = await userSchema.find({$or: [{email: data.email},{username: data.user}]})
        if (existingUser$ && Object.keys(existingUser$).length === 0) {
            const obj = {
                email: existingUser$[0].email,
                username: existingUser$[0].user,
                password: existingUser$[0].firstPass,
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

router.post('/login', async(req, res)=>{ //make sure login is only possible if not alr logged in
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
            res.cookie('SESSION_ID', session, {sameSite: 'strict', httpOnly: true, maxAge: 1000*60*60*24, signed: true})
            res.status(200).json({username: foundUser$[0].username})
            
        }
        else if (userQuery && !(userQuery.equals(foundUser$[0]._id))) {
            res.status(403).json({message: "Invalid CSRF"}).end(); return 
        }
        else {
            //now we need to associate this csrf with a userid
            await tokenSchema.findOneAndUpdate({csrf_token: req.headers.h_csrf_token}, {session_token: session, userID: foundUser$[0]._id})
            res.cookie('SESSION_ID', session, {sameSite: 'strict', httpOnly: true, maxAge: 1000*60*60*24, expires: 1000*60*60*24, signed: true})
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


module.exports = router

