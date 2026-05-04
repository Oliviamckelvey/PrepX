//Authentication Controller Functions File

/*
    routes/routers direct requests to controller functions 
    controller folders hold the individual files - each controller defines all the functionality that applies to one feature
    controller files contain a group of functions that deal with the same resource/responsibility

    every controller function is a route handler and every route handler receives the req and res object 
    route handler = function that runs when a route is hit
    every controller is a route handler but not every route handler is a controller

    this controller contains functions relating to the application's authentication needs
    we have three functions (or three things) the back-end is capable of doing for authentication: register, login, getMe
    wrap functionality in try/catch blocks to handle throwing an error if anything unexpected goes wrong 

    it is better practice and keeps data safer to use parametrized queries 
    parametrized queries are where you write SQL structure first and pass the user's values separately
    connectionPool.query() returns a result object w/ a rows property - rows is an array of returned database rows from the query

    JWT - keeps the user logged in and proves identity for every request made by the user
    jwt.sign(payload, secret, options) creates the token, takes your data combines it w/ JWT secret and produces signed token string

    res.json() converts JS object into JSON string that can travel over the internet AND
    sends the parsed object now string as a response to whoever made the request originally 
    res.json only takes one argument so if you want to pass multiple thing you wrap them in an object 
*/



//import the req and res object for access to the Express objects - they hold information we need to run the controller functions
import { Request, Response } from 'express'

//import connection pool - the access point to our database 
import connectionPool from '../db/connection'

//imports the the bcrypt library which is responsible for password hashing
import bcrypt from 'bcrypt'

//import the jsonwebtoken library - used to create and verify JWT tokens
//tokens are given to users on login and sent back with every request made by this user so the server knows who is asking 
import jwt from 'jsonwebtoken'





//register function - export inline so route files can use this function directly
//function is async because it queries/communicates with the database (via the connectionPool) which takes time
export const register = async (req: Request, res: Response) => {
    try {
        //use destructuring to get email, password and name from the req.body - req.body is incoming object of data from the user attempting to register
        const { email, name, password } = req.body

        //check if the email already exists in the database using SQL query - must await the query 
        const queryResult = await connectionPool.query('SELECT * FROM users WHERE email = $1', [email])

        //(cant register more than once) if email exists, throw an error -> send a response signaling an error code to the client 
        //409: signifies conflict - already exists and shouldn't be duplicated
        if(queryResult.rows.length) return res.status(409).json({ error: "Email has already been registered"})


        //otherwise hash the password - user doesn't exist so we can continue with the registration
        const hashedPass = await bcrypt.hash(password, 10)

        //add new user info and the hashed password to the database - use the hashed password not the real one from req.body
        //you must include RETURNING * so the added user row is returned because JWT needs the id of that row 
        const userResult = await connectionPool.query('INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *', [email, hashedPass, name])

        //create a constant to represent the complete newly created user row from the database - including the auto-generated id needed to sign the JWT
        //since we only INSERT one user per registration there will only ever be one row returned - always accessible at index [0]
        const userObject = userResult.rows[0]


        //create JWT- store the return in a constant so it can be returned to the user and used by the front end 
        const token = jwt.sign(
            //payload: { userId } - identifies the user on future requests
            { userId: userObject.id },
            //secret: JWT_SECRET from .env - makes the token impossible to fake
            //! -> non-null assertion operator - TypeScript thinks the value might be undefined but the ! assures TS we know the value exists 
            process.env.JWT_SECRET!,
            //options: expiresIn - how long before the token expires and user must log in again
            { expiresIn: '7d' }
        )


        //send the JWT token and safe user object back to the front-end - always use res.json() when sending data
        res.json({
            //send token: allows the front-end to make authenticated requests on behalf of this user
            token: token,
            //send user object/information: the front-end needs this to display user info and set up the session in Redux - excludes password_hash for security
            user: { 
                id: userObject.id, 
                email: userObject.email, 
                name: userObject.name 
            }
        })
        
    //if any code in the try block throws an error - it is handled by the catch block
    } catch (error) {
        //log the error object so developers can see what went wrong
        console.log(error)
        //set an error status code of 500 which indicates something went wrong on the server's side - res.status()
        //sends the actual response to the client in JSON string format - browser readable - res.json()
        res.status(500).json({ error: 'Internal server error'})
    }
    
}