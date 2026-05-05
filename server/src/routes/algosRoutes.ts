//Algo Routes to Algo Controller File

/*
    back-end routes are the URLs your server exposes for a specific feature
    building the grind75 back-end routes = building the API endpoints that your front-end will call interact with grind75 (algo) data

    for each group of related routes (like this file) we create a router which hands the routes to the server
    to build the routes ask yourself what does the front-end need to be able to do with the algo module/feature

    REST (Representational State Transfer) - a standard way of structuring API routes around resources not actions
    in REST a resource is the thing you're working with (algos, behavioral questions, system design topics)
    routes are named after the resource not the function - /api/algos not /api/getAlgos
    HTTP method describes the action, URL describes the resource:
    GET /api/algos → fetch all algos | PATCH /api/algos/:id → update one specific algo

*/




//import the Express library - give us the ability to make a router 
import express from 'express'

//import the algo controller functions from the file they currently live in 
import { getAlgos, updateProgress } from '../controllers/algosController'

//import the authentication middleware function that verifies JWT token upon every user request
import { authMiddleware } from "../middleware/authMiddleware"





//create an Express router - a portable Express object that holds routes and gets handed to app (server) in index.ts
//export the router directly inline - you will need to import it in index.ts to give your server access to this bundle of algo related routers
export const algosRouter = express.Router()



/*
    when creating a route ask yourself ->

    1. what HTTP method? GET = fetching data, POST = creating something, PATCH = updating, DELETE = removing
    2. what path? you decide - name it after what it does, keep it clear (ex. path for the register function -> /register)
    3. what controller function? what actual logic we want to execute when the routes request arrives at the specified url

    syntax -> routerName.httpMethod('path', controllerFunc)

*/


//these routes follow REST resource-based routing - both routes target the same /api/algos resource
//GET / gets the whole collection, PATCH /:id targets one specific item - the /api/algos prefix is added by app.use() in index.ts



//handles GET requests to /api/algos → runs getAlgos which returns all 75 problems with the logged in user's progress attached
algosRouter.get('/', authMiddleware, getAlgos)

//handles PATCH requests to /api/algos/:id → runs updateProgress which saves the user's progress on one specific algorithm
algosRouter.patch('/:id', authMiddleware, updateProgress)