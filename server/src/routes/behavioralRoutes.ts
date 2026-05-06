//

/*

*/




//import Express library - what allows use to create a router
import express from 'express'

//import the controller functions from the matching controller file
import { getBehavioralQuestions, updateBehavioralResponses } from '../controllers/behavioralController'

//import authentication middleware - every route needs this to verify JWT token
import { authMiddleware } from '../middleware/authMiddleware'






//create a router that will hand all behavioral related routes to your server/back-end - export it to mount on server
export const behavioralRouter = express.Router()

//handles GET requests to /api/behavioral → runs getBehavioralQuestions which returns all 29 questions with the logged in user's answers attached
behavioralRouter.get('/', authMiddleware, getBehavioralQuestions)

//handles PATCH requests to /api/behavioral/:id → runs updateBehavioralResponses which saves the user's STAR answer to one specific question
behavioralRouter.patch('/:id', authMiddleware, updateBehavioralResponses)

