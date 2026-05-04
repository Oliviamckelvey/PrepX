//server manager file

/*
    create the server, make the new server accessible on a specified port,
    and decide what the server is capable of doing/processing via the routes you define
*/



//import the connection pool 
import connectionPool from "./db/connection"


//import express library - so we can code the server in Express
import express from "express"

//create the server object - use express to build an "app" that will control the back-end
const app = express()

//create a test route to see if the server is working -> can receive a request and respond
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
        console.log(error)
    }
})
    
