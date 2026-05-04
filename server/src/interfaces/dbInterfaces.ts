/*
    define TypeScript interfaces for each table the application interacts  
    don't sensitive information that shouldn't be exposed

    the interface property names must match the names from the postgreSQL database tables, exactly
    the data coming from the data base will be an object with those exact column names
    the TS must be the same as the returned object in order to check your code properly 

    application's back-end is written in TypeScript 
    when the algo controller queries the database and gets rows back - 
    TypeScript needs to know the shape of the data it is working with in order to catch mistake for you 
*/





//turns the file into a module -> needed in order for TS to use declare global on line 25
//must be at the top of file so TS reads it first and turns the file into a module
export {}

//allows middleware to attach a userID to the request object 
//without middleware being able to set req.userId controller wouldn't know who is making the request
//declaring globally lets every file in the back end know req.userId is valid
declare global {
  namespace Express {
    interface Request {
      userId?: number
    }
  }
}




//describes the shape of a user object returned from the users table (excluding the password_hash)
interface User {
    id: number
    email: string
    name: string
}


//describes the shape of a single algo object returned from the algos table
interface Algo {
    id: number
    title: string
    difficulty: string
    category: string
    leetcode_url: string
    order_index: number
}


//describes the shape of a behavioral question from the behavioral_questions table
interface BehavioralQuestion {
    id: number
    question: string
    category: string
}


//describes the shape of system design topic returned from the system_design_topics table
//practice_question and resource_url are nullable — we haven't given the db table this information yet
interface SystemDesignTopic {
    id: number
    title: string
    description: string
    category: string
    practice_question: string | null
    resource_url: string | null
}


//describes the shape of a users progress on a single algo from the user_algos tables
//confidence, time_taken_minutes and notes are nullable — user may not have filled them in yet 
interface UserAlgo {
    id: number
    user_id: number
    algo_id: number
    solved: boolean
    confidence: number | null
    time_taken_minutes: number | null
    notes: string | null
}


//describes the shape of a users STAR approach to answering a behavioral question
//all four STAR properties are nullable - the user may not have filled them out yet 
interface UserBehavioralAnswer {
    id: number
    user_id: number
    question_id: number
    situation: string | null
    task: string | null
    action: string | null
    result: string | null
}


//describes the shape of a user's personal notes in response to a system design topic question
//notes are nullable - the user make not have answered/taken notes on the topic yet 
interface SystemDesignNote {
    id: number
    user_id: number
    topic_id: number
    notes: string | null
}




