//API configuration/Axios Set Up File

/*
    Axios is a library that makes HTTP requests from the frontend to the backend
    this file creates a configured Axios instance that every component imports and uses to talk to the backend
    same concept as connection.ts on the backend - configured once, exported, used everywhere

    API configuration  = the Axios setup for how those requests are handled (base URL, token, interceptor)
    API calls = the actual requests (get data, save data) - functions that use the set up to talk to your back end 

    BASE URL
    tells Axios where to send the requests from the front-end 
    instead of typing the full URL on every request (http://localhost:3001/api/algos)
    we set the baseURL once in the axios instance - every request then just needs the path (/api/algos)
    like saving someones contact information so you don't have to retype their number every time you want to call

    INTERCEPTOR
    a function that runs automatically before every single Axios request goes out
    you write it once - it handles something for every request so you never have to manually do it
    for this app the interceptor automatically attaches the JWT token to every request's Authorization header
    format: "Authorization: Bearer <token>" - this is what your backend middleware expects to see

    JWT TOKEN - LOCAL STORAGE
    the token is stored in localStorage after the user logs in
    localStorage.getItem('token') reads it back
    localStorage.setItem('token', token) saves it
    localStorage.removeItem('token') clears it on logout

    TOKEN FLOW
    user logs in → backend sends { token, user } → frontend saves token to localStorage
    on every future request → interceptor reads token from localStorage → adds it to Authorization header
    backend middleware reads the header → verifies token → attaches userId to req → controller runs

    IF NO TOKEN
    interceptor always runs - but only adds the header if a token exists
    if no token → header not added → backend middleware returns 401 → user redirected to login

    HTTP HEADERS
    every HTTP request arrives with headers - key value pairs of extra info about the request
    Authorization header specifically carries the JWT token
    req.headers.authorization on the backend reads it
    the Axios interceptor sets it on the frontend
*/



//import Axios library which allows HTTP requests to communicate from the front to back end
import axios from "axios"


//create an axios instance which allows http request from the front-end to communicate with the back-end/server
const axiosInstance = axios.create({
    //this will change later on when you make application public with Railway 
    baseURL: 'http://localhost:3001'
})


/*
    AXIOS INTERCEPTORS

    .interceptors -> Axios built in interceptor system 
    .request -> specifically the request interceptor - runs before requests go from the front-end to the back-end
    .response -> specifically the response interceptor - runs when response come from the back-end to the front-end 
    .use() -> registers a function to run - whatever you pass in runs before every single request on the axios instance
    config -> an object that contains everything about the request being sent 
    config.headers -> the headers object 
    config.headers.Authorization -> adds authorization header to the request before it goes to the back-end 

    request interceptor - a function that runs automatically before every request leaves the frontend - middleman not sender 
    checks localStorage for the JWT token to determine if the user is logged in
    if token exists - attaches it to the Authorization header in the format "Bearer <token>"
    without this you'd have to manually create the Authorization header on every single API call
    the backend middleware reads this header to verify who is making the request
*/



//modifies front-end request before it gets sent to the back-end - does NOT send the request 
//reads JWT from localStorage and attaches it to the Authorization header so the backend knows who is asking
axiosInstance.interceptors.request.use((config) => {
    //read the token from localStorage - see if a token exists for the user making the front-end request 
    const token = localStorage.getItem('token')

    //if token exists — add it to config.headers.Authorization
    //Bearer is a keyword that signals what follows is a token - format your backend expects
    if(token) config.headers.Authorization = `Bearer ${token}`

    //return config - must return config in order for the request to be sent out (to the back-end)
    return config
})


//export the configured axios instance - import it anywhere in the front-end to make API calls to the back-end
//export default removes the need for curly braces on import
export default axiosInstance