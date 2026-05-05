//Auth Routes to Auth Controllers File

/*
    this file contains all routes related to authentication
    a route connects a URL + HTTP method to a controller function
    the controller contains the actual logic - the route just says "when this URL is hit, run this function"

    we create a router because routes need an Express object to attach to
    app lives in index.ts and can't be imported here without causing circular dependencies - express.Router() solves this

    app = the whole server - receives every request - only one exists
    router = a grouped list of related routes - handed to app - one per feature

    an API is how two programs communicate - your backend IS the API sitting between the frontend and the database
    a data endpoint is a URL that returns JSON data instead of a webpage - your backend is a collection of endpoints
    the /api prefix signals these URLs return data not pages - professional convention
    defining a route creates an endpoint - no route means no endpoint means the frontend gets a 404

    both prefix and path are developer decisions - name them after what they do, keep them clear and readable
    every route inside automatically inherits the prefix - you never write the full URL in the routes file
    full URL = prefix + path → /api/auth + /register = /api/auth/register - this is what your frontend calls
*/



//import express library - the router we need to create comes from Express
import express from 'express'

//import the authentication controller functions we need to create a route for 
import { register, login } from '../controllers/authController'





//create an Express router - a portable Express object that holds routes and gets handed to app (server) in index.ts
//export the router directly inline - you will need to import it in index.ts to give your server access to this bundle of authentication routers
export const authRouter = express.Router()



/*
    when creating a route ask yourself ->

    1. what HTTP method? GET = fetching data, POST = creating something, PATCH = updating, DELETE = removing
    2. what path? you decide - name it after what it does, keep it clear (ex. path for the register function -> /register)
    3. what controller function? what actual logic we want to execute when the routes request arrives at the specified url

    syntax -> routerName.httpMethod('path', controllerFunc)

*/

//handles POST requests to /register -> when a user submits the registration form this route runs the register controller function
authRouter.post('/register', register)

//handles POST requests to /login -> when a user logs in with a email and password this route runs the login controller function 
authRouter.post('/login', login)