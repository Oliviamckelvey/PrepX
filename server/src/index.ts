//Server Manager File

/*
    create the server, make the new server accessible on a specified port,
    and decide what the server is capable of doing/processing via the routes you define

    must parse incoming data from the front end to make it readable in the back-end -> express.json()
    & must implement cors in the application to allow front to back end communication -> cors()

    app.listen executes one time when the server starts - the connection pool should be tested here 
    without a reliable connection to the database the application won't function 

    its best to test connection pool immediately and throw an error if we weren't able to access the database
    if connection to the database fails, shut down the server entirely 
*/




//import express library - so we can code the server in Express
import express from "express"

//import the connection pool 
import connectionPool from "./db/connection"

//import the cors library - what allows communication between front-end and back-end
import cors from 'cors'



//create the server object - use express to build an "app" that will control the back-end
const app = express()



//tell express to parse incoming JSON request objects - the conversion turns the data sent from the front-end into some readable to the back-end
app.use(express.json())

//runs cross-origin resource sharing in the application - allowing the front and back end to communicate with one another despite being on different ports
app.use(cors())



//create a test route to see if the server is working -> can receive a request and respond (remove once real routes are added)
app.get("/", (req, res) => {
    //send a success message to the client signifying the server is running properly 
    res.send("Server is a Success")
})


//start the server and keep it running/listening to a specified port
app.listen(3001, async () => {
    //try block
    try {
        //console log a success message in the terminal (for the developer)
        console.log("Server Started Successfully")

        //test if the connection the the the pool (our access to PostgreSQL) is successful
        await connectionPool.query('SELECT COUNT(*) FROM algos')

        //log a success message if the query to the connection pool worked 
        console.log("Server is connected to PostgreSQL DB")

    //catch block - runs if anything in the try block throws an error 
    //error -> the error passed to the catch block comes from the error object thrown by the failed try block
    } catch (error){
        //if the query failed console log the error object passed into the catch block
        console.error('Failed to connect to database:', error)

        //if the connection to the database failed then shut down the server
        process.exit(1)
    }
})
    
