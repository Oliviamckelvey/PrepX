//import express library 
import express from "express"

//create the server object - use express to build an "app" that will control the back-end
const app = express()

//create a test route to see if the server is working -> can receive a request and respond
app.get("/", (req, res) => {
    //send a success message to the client signifying the server is running properly 
    res.send("Server is a Success")
})


//start the server and keep it running/listening to a specified port
app.listen(3001, () => {
    //console log a success message in the terminal (for the developer)
    console.log("Server Started Successfully")
})
    
