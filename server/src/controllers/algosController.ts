//Algos Feature's Controller Functions File

/*
    a controller contains functions that interact with the database for a specific feature
    every controller function does one of two things: GET data from the database and send it to the frontend, or SAVE data from the frontend to the database

    for the algo feature we need data from both the algo and user_algo table in the same place
    LEFT JOIN combines two tables - give me ALL rows from the left table (algos) and attach matching rows from the right table (user_algos)
    if no matching row exists in the right table - PostgreSQL fills those columns with NULL instead of removing the row
   
    primary key = unique identifier for each row in a table (always the id column)
    foreign key = a column that points to the primary key of another table - this is how tables are connected and how JOIN knows which rows to match

    WHERE is a filter that runs after the join to narrow down the data to only the desired rows
    ON condition vs WHERE - user filter goes in ON not WHERE because WHERE runs after the join and filters out NULL rows (problems with no progress)
    
    ON keeps all 75 problems in the result and fills in progress where it exists - NULL where it doesn't
    WHERE would remove every problem the user hasn't touched yet - for a new user that means an empty page
    putting user_id in ON means "only attach progress rows that belong to this user" - other problems still appear with NULL

    upsert - insert a new row OR update an existing one in a single query using INSERT ON CONFLICT DO UPDATE
    used in updateProgress because we don't know if a user_algos row already exists for this user + problem combination

    req.params.id - when a route has /:id in the path the id value from the URL is accessible via req.params.id
    example: PATCH /api/algos/3 → req.params.id = "3" - this tells the controller which specific problem to update

    SELECT queries always return data - no need for RETURNING *
    INSERT, UPDATE, DELETE queries don't return data by default - add RETURNING * to get the affected row back
    we need RETURNING * here so we can send the updated progress row back to the frontend
*/



//Request and Response must be imported in every controller - without them the function has no way to read incoming data or send anything back
//req carries everything coming in (req.body, req.params, req.userId) - res is how you send the response back to the frontend
import { Request, Response } from 'express'

//import the connection pool - our back-end/server's access point to the database
import connectionPool from '../db/connection'

//import the interfaces file to make TypeScript aware of the declare global extension that adds userId property to the Express Request type
//without this import TypeScript doesn't know req.userId exists and throws an error
import '../interfaces/dbInterfaces'



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


//these controller function are async because they query/communicate with the database (via the connectionPool) which takes time



//there are 2 things the algos feature needs to do in regards to interacting with data 

// getAlgos       → reads data from the database (GET)
// updateProgress → saves data to the database (PATCH)




//a controller function that requests/populates the grind75 algos in the user's profile
export const getAlgos = async ( req: Request, res: Response ) => {
    try {
        //store the use userId (stored on the req object passed to us by middleware)
        const userId = req.userId

        //use the userId to load the user's progress data along with all grind75 algos - LEFT JOIN
        //save the result of the query -> an object that contains the data for grind75 algos with user progress attached (on rows property)
        //only select columns the frontend needs to display - skip user_algos.id, user_id, and algo_id (internal linking columns not needed by the frontend)
        //ON algos.id = user_algos.algo_id - connect the two tables where the algo's primary key matches the foreign key in user_algos
        //AND user_algos.user_id = $1 - only attach progress rows that belong to this specific user - other users' progress never appears
        const queryResult = await connectionPool.query(
            `SELECT 
                algos.id, 
                algos.title, 
                algos.difficulty, 
                algos.category, 
                algos.leetcode_url, 
                algos.order_index, 
                user_algos.solved, 
                user_algos.confidence, 
                user_algos.time_taken_minutes, 
                user_algos.notes 
            FROM algos 
            LEFT JOIN user_algos 
                ON algos.id = user_algos.algo_id 
                AND user_algos.user_id = $1 
            ORDER BY algos.order_index`, 
            [userId]
        )

        //store the actual data (all the rows of algo data) sent back on the object returned from the SQL db query 
        const algoData = queryResult.rows

        //send all 75 algos with their progress attached back the user
        res.json(algoData)

    } catch (error) {
        //console the error object so developers can see what went wrong
        console.log(error)

        //send an error response to the client signifying that there was a sever error
        res.status(500).json({ error: "Internal Server Error" })
    }

}





/*
    req.params contains dynamic values captured from the URL path
    when the route is PATCH /:id and someone hits PATCH /api/algos/3 - Express captures "3" and puts it on req.params.id
    req.params.id tells the controller which specific algo to update - without it we wouldn't know which problem to save progress for
    note: req.params.id comes back as a string not a number - may need to convert with Number(req.params.id) or parseInt()

    req.userId -> the user making the update request 
    req.params.id -> the id of the specific algo being updated
    req.body -> that user progress data that we are updating the database with 

    ON CONFLICT (user_id, algo_id) - if a row already exists for this user + problem combination, don't throw an error - update it instead
    DO UPDATE SET - replace the existing values with the new ones being submitted
    EXCLUDED.column - refers to the new value we tried to insert - used to set the updated value (fixes the conflict that arises when trying to update)
    RETURNING * - return the full updated row after the insert or update so we can send it back to the frontend

    //ON CONFLICT requires a UNIQUE constraint on the conflict columns so PostgreSQL knows what "already exists" means
    //user_algos needs UNIQUE (user_id, algo_id) - one user should only ever have ONE progress row per problem
    //if this constraint is missing PostgreSQL throws an error - add it with: ALTER TABLE user_algos ADD CONSTRAINT user_algos_unique UNIQUE (user_id, algo_id)
*/



//a controller function that allows the user to update algo related progress data (done with PATCH)
export const updateProgress = async ( req: Request, res: Response ) => {
    try {
        //get the userId from req - attached by auth middleware, identifies which user is updating their algo progress
        const userId = req.userId
        
        //get the algoId from req.params.id - captures which specific problem the user is updating from the URL
        const algoId = Number(req.params.id)
        
        //get the progress fields from req.body - the four values the user is saving for this problem
        //solved, confidence, time_taken_minutes, notes
        const { solved, confidence, time_taken_minutes, notes } = req.body

        //set up the connection pool and query the database to find the algo matching the algo id and update it
        const queryResult = await connectionPool.query(`
            INSERT INTO user_algos (user_id, algo_id, solved, confidence, time_taken_minutes, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id, algo_id)
            DO UPDATE SET 
                solved = EXCLUDED.solved,
                confidence = EXCLUDED.confidence,
                time_taken_minutes = EXCLUDED.time_taken_minutes,
                notes = EXCLUDED.notes
            RETURNING *`, 
            [userId, algoId, solved, confidence, time_taken_minutes, notes]
        )

        //store returned data (single row of updated algo data) - the query returns an object & relevant data stored on the rows property 
        const updatedAlgo = queryResult.rows[0]

        //send the update algo back to the client
        res.json(updatedAlgo)

    } catch(error) {
        //log the error object so developers can see what went wrong
        console.log(error)

        //set the status and send an error response to the client indicating what went wrong 
        res.status(500).json({ error: "Internal Server Error" })

    }
}