//

/*
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


//import Express library so you can pass teh req and res object the the controller functions
//mandatory because req carries everything coming in (req.body, req.params, req.userId) - res is how you send the response back to the frontend
import { Request, Response } from 'express'

//import the connection pool which act as our access point to the database
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


//function that requests/get/send system design data and user's responses 
export const getSystemDesignData = async (req: Request, res: Response) => {
    try {
        //what data comes in on the request?  
        //the only incoming data we care about is the person making the request -> req.userId
        const userId = req.userId

        //what do you do in response - SQL query?
        const queryResult = await connectionPool.query(`
            SELECT 
                system_design_topics.id,
                system_design_topics.title,
                system_design_topics.description,
                system_design_topics.category,
                system_design_topics.practice_question,
                system_design_topics.resource_url,
                user_system_design_notes.notes
            FROM system_design_topics
            LEFT JOIN user_system_design_notes
                ON system_design_topics.id = user_system_design_notes.topic_id
                AND user_system_design_notes.user_id = $1`,
            [userId]
        )

        const systemDesignData = queryResult.rows

        //what do we send back to the user?
        res.json(systemDesignData)

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
    run in psql: ALTER TABLE user_system_design_notes ADD CONSTRAINT behavioral_unique UNIQUE (user_id, topic_id)

*/


//function that updates a user's response to a specific system design question 
export const updateSystemDesignResponse = async (req: Request, res: Response) => {
    try {
        //what data comes in on the request?
        //the data coming in on the request is response to data to the system design question - req.body
        const { notes } = req.body
        //we always care about the person making the request for authentication purposes 
        const userId = req.userId
        //and in the case of a patch (which this function is) we need to capture the value for the dynamic path to know the specific system design response being altered
        const topicId = Number(req.params.id)

        //what do you do in response - SQL query?
        //looks/queries through the system design response table to locate the specific system design notes the user is trying to change 
        const queryResult = await connectionPool.query(`
            INSERT INTO user_system_design_notes (user_id, topic_id, notes)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, topic_id)
            DO UPDATE SET
                notes = EXCLUDED.notes
            RETURNING *
            `,
            [userId, topicId, notes]
        )

        //the query return an object with he relevant data on the row property - return all system design questions and responses
        const updatedSystemDesignNotes = queryResult.rows[0]

        //what do we send back to the user?
        //send the updated system design answers a response to the user 
        res.json(updatedSystemDesignNotes)

    } catch(error) {
        console.log(error)

        res.status(500).json({ error: "Internal Server Error" })
    }
}