//Behavioral Feature's Controller Functions File

/*
    a controller contains functions that interact with the database for a specific feature
    every controller function does one of two things: GET data from the database and send it to the frontend, or SAVE data from the frontend to the database

    Request and Response must be imported in every controller - without them the function has no way to read incoming data or send anything back
    req carries everything coming in (req.body, req.params, req.userId) - res is how you send the response back to the frontend

    req.params captures dynamic values from the URL path defined with :id in the route
    when the route is PATCH /:id and someone hits PATCH /api/behavioral/5 - Express captures "5" and puts it on req.params.id
    this tells the controller which specific behavioral question the user is saving an answer for
    req.params.id always comes back as a string - may need to convert with Number() or parseInt() if used as a number

    ON CONFLICT (user_id, question_id) - if a row already exists for this user + question combination, update instead of insert
    the two linking columns together identify a unique row - one user should only have ONE answer per question
    DO UPDATE SET - only update the STAR data columns (situation, task, action, result) - never update the linking columns (user_id, question_id)
    EXCLUDED.columnName - refers to the new value that was just tried to be inserted - use it to set the updated value
    must add UNIQUE constraint first: ALTER TABLE user_behavioral_answers ADD CONSTRAINT behavioral_unique UNIQUE (user_id, question_id)
*/



//import the request and response objects from the Express library - need to be passed to controller functions
import { Request, Response } from 'express'

//import the connection pool which is serves as the access point to the database
import connectionPool from '../db/connection'




/*
    when building a controller file ->

    STEP 1 - DECIDE WHAT FUNCTIONS YOU NEED
    ask "what does this feature need to do with data?"
    showing data → GET function
    saving data  → PATCH or POST function

    STEP 2 - FOR EACH FUNCTION ASK THREE QUESTIONS
    what comes IN?  → req.body, req.params, req.userId
    what do you DO? → what SQL query runs?
    what goes OUT?  → what does res.json() send back?

    STEP 3 - STRUCTURE
    async function → try/catch → query → respond
    catch block always returns 500
    all routes protected → req.userId always available from middleware

*/



/*
    LEFT JOIN PATTERN ->

    SELECT [columns you want]
    FROM [main table]
    LEFT JOIN [second table] ON [how they connect]
    ORDER BY [which column to sort by]

*/




//function that requests/gets the data related to the behavioral feature of the application - loads page with data for user
export const getBehavioralQuestions = async (req: Request, res: Response) => {
    try {
        //what comes in?
        //its a get request so the only thing coming in is the userId from the request - store the information
        const userId = req.userId

        //what do you do in response - SQL query?
        //use the userId to load the users behavioral response data AND the behavioral questions - store response
        const queryResult = await connectionPool.query(`
            SELECT 
                behavioral_questions.id,
                behavioral_questions.question,
                behavioral_questions.category,
                user_behavioral_answers.situation,
                user_behavioral_answers.task,
                user_behavioral_answers.action,
                user_behavioral_answers.result
            FROM behavioral_questions
            LEFT JOIN user_behavioral_answers 
                ON behavioral_questions.id = user_behavioral_answers.question_id
                AND user_behavioral_answers.user_id = $1
            ORDER BY behavioral_questions.id`,
            [userId]
        )

        //the query returns an object with the data on the rows property - store all the data from rows
        const behavioralData = queryResult.rows //entire array of rows - all behavioral questions and answer data

        //what do we send back to the user?
        //send the user a response using .json() - the response should be all the behavioral questions with the user's response data attached
        res.json(behavioralData)

    } catch(error) {
        console.log(error)

        res.status(500).json({ error: "Internal Server Error" })
    }
}




/*
    UPSERT PATTERN ->

        INSERT needs user_id and question_id (linking columns) + the four STAR fields (data columns)
        without user_id and question_id the database wouldn't know whose answer it is or which question it belongs to

    INSERT INTO [table] (column1, column2, column3...)
    VALUES ($1, $2, $3...)
    ON CONFLICT (linking_column1, linking_column2)
    DO UPDATE SET
        data_column1 = EXCLUDED.data_column1,
        data_column2 = EXCLUDED.data_column2
    RETURNING *
    
    linking columns = the two columns that identify a unique row (user_id + question_id)
    data columns = the actual data being saved (never update linking columns)
    EXCLUDED = the new values that were just tried to be inserted
    RETURNING * = send back the updated row so we can send it to the frontend

    before testing the upsert you must add a UNIQUE constraint to user_behavioral_answers
    ON CONFLICT requires a UNIQUE constraint on (user_id, question_id) so PostgreSQL knows what "already exists" means
    run in psql: ALTER TABLE user_behavioral_answers ADD CONSTRAINT behavioral_unique UNIQUE (user_id, question_id)

*/

//function that updates stored data/responses to the behavioral questions when user alters it on the front-end
export const updateBehavioralResponses = async (req: Request, res: Response) => {
    try {
        //what comes in?
        //that data coming in on the request is response to data in the users behavioral answers - req.body
        const { situation, task, action, result } = req.body
        //store the id of the user making the request - req.userId 
        const userId = req.userId
        //the portion of the dynamic route (which behavioral question being updated) is captured and stored on req.params.id
        const questionId = Number(req.params.id)

        //what do you do in response - SQL query?
        //find the behavioral question with the matching id of the one being changed and update/upsert it - set up connection pool 
        const queryResult = await connectionPool.query(`
            INSERT INTO user_behavioral_answers (user_id, question_id, situation, task, action, result)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, question_id)
            DO UPDATE SET
                situation = EXCLUDED.situation,
                task = EXCLUDED.task,
                action = EXCLUDED.action,
                result = EXCLUDED.result
            RETURNING *`,
            [userId, questionId, situation, task, action, result]
        )        
        //the query returns an object and relevant data is stored on the rows property - store the row that was updated
        const updatedBehavioralAnswers = queryResult.rows[0] //you only want to return one row - first and only thing in row array

        //what do we send back to the user?
        //send the updated behavioral answers back to the user - res.json()
        res.json(updatedBehavioralAnswers)


    } catch(error) {
        console.log(error)

        res.status(500).json({ error: "Internal Server Error" })
    }
}