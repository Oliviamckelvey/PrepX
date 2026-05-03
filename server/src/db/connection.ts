//server-database connection file

/*
    reads database credentials from .env file 
    use them to open and maintain a set of ready-to-use connections
    for PostgeSQL database to the back-end (server)
*/


//takes information about the database from .env and makes it useable for the connection string
import dotenv from 'dotenv'
//need this to connect to PostgresSQL
import { Pool } from 'pg'

//loads all .env values into process.env - including the database_url which is need for the Pool
dotenv.config()

//create Pool connection using the database_url from .env file that we put in process.env
const connectionPool = new Pool({
    connectionString: process.env.DATABASE_URL
})

//export the pool so other files can import it - any files who want to communicate with the database
export default connectionPool