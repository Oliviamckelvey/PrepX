//Login Page Component File 

/*
    PROCESS FOR BUILDING ANY PAGE:
    1. what data changes on this page?  → state variables
    2. what can the user do?            → functions
    3. what does the user see?          → JSX return

    STATE VARIABLES - data the UI needs to react to
    every input field needs state - when user types, state updates, UI re-renders showing what they typed
    without state - input fields stay blank, errors never appear, nothing updates
    ask: "what can the user change on this page that the UI needs to respond to?"

    FUNCTIONS - actions the user can trigger
    for a login page - one main action: submit the form
    the submit function handles everything: call backend, handle success, handle failure
    ask: "what can the user DO on this page?"

    JSX RETURN - what the user sees
    for a login page - a form with email input, password input, submit button, error message
    ask: "what does this page look like?"

    CONTROLLED INPUTS - how forms work in React
    each input has a value tied to state and an onChange that updates state when user types
    value={email} - what the input shows (tied to state)
    onChange={(e) => setEmail(e.target.value)} - updates state every time user types

    useNavigate - React Router hook that lets you redirect programmatically
    after successful login call navigate('/') to redirect user to the hub page
    
    useContext(AuthContext) - read login function from context
    after successful API call - call login(user, token) to save to global state and localStorage

    on the backend you used res.status(401).json({ error: 'Invalid Credentials' }) to send errors back
    on the frontend you don't have res - instead you use state to display errors to the user
    setError('Invalid credentials') - updates error state - React re-renders - error message appears on screen

    CONTROLLED INPUTS - React owns what the input shows through state
    value={email} - email is a state variable - the input always shows whatever is stored in that state
    onChange={(e) => setEmail(e.target.value)} - updates the state variable on every keystroke
    without both working together - the input either shows nothing or freezes when the user types

*/


//import React hooks needed - useState for form state, useContext to read from AuthContext
import { useState, useContext } from 'react'

//import configured axios instance - used to send login credentials to the backend
import axiosInstance from '../api/axios'

//import AuthContext - gives access to the login function to save user and token globally after successful login
import { AuthContext } from '../context/AuthContext'

//import useNavigate - React Router hook that lets you redirect programmatically after successful login
import { useNavigate, Link } from 'react-router-dom'



//Login React component function 
const LoginPage = () => {
    //state variables - what can the user change on this page that the UI needs to react to? 

    //email and password field should change in response to a user typing 
    const [email, setEmail] = useState('')

    const [password, setPassword] = useState('')

    //need an error message to disappear and reappear depending on the users credentials (what they typed)
    const [error, setError] = useState(null)

    //read the login function from AuthContext - calling it saves user and token globally so the whole app knows someone is logged in
    const authData = useContext(AuthContext)

    //extract the login function from AuthContext - login() saves user and token to global state and localStorage
    const loginFunc = authData.login

    //get the navigate function from useNavigate - used to redirect programmatically after successful login
    const navigate = useNavigate()

    //functions - handle everything that has to happen in response to a user performing one of the available actions on this page
    //the user cna do one thing -> login - need a function to handle log in which involves back-end communication and much more
    const handleLogin = async () => {
        //clear any previous error message before any new attempt
        setError(null)

        try {
            //when the user attempts to log in front-end needs to send credentials (http request) to the back end - so it can check them and send a response granting log in or not 
            //post request sends data to the server
            const response = await axiosInstance.post('/api/authentication/login', { email, password })

            //get the data stored on the response object from the axios request - on the object's data property 
            const userData = response.data

            //call login from AuthContext with the user and token from the response - saves to global state and localStorage so whole app knows someone is logged in
            loginFunc(userData.user, userData.token)

            //redirect to the user's hubPage upon successful login
            navigate('/')

        } catch (error) {
            console.log(error)

            //setError - make error message appear on users screen signifying failed log in attempt
            setError("Invalid Credentials")
        }
    }
    //return JSX component - what the user sees (build the page)
    //?? WRITE PSUEDO CODE for the conditional error rendering
return (
  <div className="auth-page">
    <div className="auth-card">
      <h1 className="auth-logo">PrepX</h1>
      <p className="auth-subtitle">Technical Interview Training</p>
      
      <div className="auth-form">
        {error && <div className="auth-error">{error}</div>}
        <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email"/>
        <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
        <button className="btn-primary" onClick={handleLogin}>LOGIN</button>
        <Link to="/register">Register</Link>
      </div>
    </div>
  </div>
)
}

export default LoginPage