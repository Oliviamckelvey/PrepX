//

/*

*/



//import express to create the router
import express from 'express'

//import related controller functions
import { getSystemDesignData, updateSystemDesignResponse } from '../controllers/systemDesignController'

//import authentication middleware - every route needs this to verify JWT token
import { authMiddleware } from '../middleware/authMiddleware'



//create a router to deliver system design routes to the server
export const systemDesignRouter = express.Router()


systemDesignRouter.get('/', authMiddleware, getSystemDesignData)

systemDesignRouter.patch('/:id', authMiddleware, updateSystemDesignResponse)