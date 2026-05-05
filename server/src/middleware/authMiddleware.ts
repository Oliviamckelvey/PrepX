//Authentication Middleware/Token Verification File

/*
    middleware is a function that runs between the route and the controller
    it receives req, res, and next - calling next() passes control to the controller, not calling it stops the request entirely

    a protected route requires a valid JWT token to access - used for any route that returns personal user data
    protected = the user must be signed in (have a valid token) to access this route

    HTTP requests arrive with headers - key value pairs that carry extra info about the request 
    the Authorization header is one of those labels - it carries the JWT token the frontend sends on every protected request
    the Authorization header value looks like "Bearer <token>" - two parts separated by a space
    middleware splits that string and takes just the token part (everything after "Bearer ") to verify

    auth middleware is the gatekeeper for all protected routes - it runs before the controller on every protected request
    it reads the JWT token from the Authorization header, verifies it, and extracts the userId from the payload
    if valid → attaches userId to req.userId and calls next() - the controller runs and handles the request
    if missing or invalid → returns 401 Unauthorized and never calls next() - the controller never runs

    jwt.verify(token, secret) checks if the token is genuine by validating the signature against JWT_SECRET
    if valid it returns the decoded payload { userId, iat, exp } - if invalid it throws an error caught by the catch block
    unlike jwt.sign() - jwt.verify() is synchronous and does not need to be awaited
*/



//import Express library - give us access to the Request and Response objects, and the NextFunction which passes control to the next function in the chain
import { Request, Response, NextFunction } from 'express'

//import jsonwebtoken - used to verify the JWT token (sent in the Authorization header on every protected request)
//jwt.verify() decodes and validates the token using JWT_SECRET - if the token is genuine it returns the payload object (contains the userId)
import jwt from 'jsonwebtoken'



//auth middleware - runs between the route and controller on every protected request
//verifies the JWT token from the Authorization header - if valid attaches userId to req so the controller knows who is asking
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        //read and store the Authorization header from req.headers 
        const authHeader = req.headers.authorization
        
        //if the authentication header does NOT exist this signifies the user has no token - return a response error to the client 
        if(!authHeader) return res.status(401).json({ error: 'Unauthorized' })

        //extract the token by isolating it with .split() and store the value
        const token = authHeader.split(' ')[1]

        //verify the token - if token is valid jwt.verify(token, secret) returns the payload (object that contains the user's id)
        //use non-null assertion to guarantee there will be a value here
        const payload = jwt.verify(token, process.env.JWT_SECRET!)

        //your controller function needs to know whose data to fetch but it has no direct access to the JWT token 
        //the only way to pass information between controller and middleware is the req object - pull out userId and put it on the req object
        //(payload as any) - TypeScript doesn't know the exact shape of the decoded payload so we use "as any" to tell TS to trust us
        //decoded = converted from encoded JWT string back into a readable JavaScript object
        req.userId = (payload as any).userId

        //pass control from the middleware to the controller function (or next function in the chain)
        next()

    //catch block runs if jwt.verify() fails - either the token is invalid, expired, or missing
    } catch (error) {
        //log the error object so developers can see what went wrong
        console.error(error)

        //return 401 Unauthorized - the token was not valid so the user can NOT access this protected route
        res.status(401).json({ error: 'Unauthorized' })
    }
}