//Register Page Component File

/*
    PROCESS - same as LoginPage:
    1. what data changes on this page?  → state variables
    2. what can the user do?            → functions  
    3. what does the user see?          → JSX return

    STATE VARIABLES
    three inputs the user fills in: name, email, password
    one error message that appears/disappears based on what happens

    FUNCTION - handleRegister
    sends name, email, password to POST /api/authentication/register
    on success → call login(user, token) from AuthContext → navigate to hub
    on failure → setError to show message to user

    JSX RETURN
    name input, email input, password input, register button, link to login for existing users
    controlled inputs - value tied to state, onChange updates state on every keystroke
    conditional error rendering - {error ? <p>{error}</p> : null}

    KEY DIFFERENCE FROM LOGIN
    one extra field - name
    calls /api/authentication/register instead of /api/authentication/login
    same pattern otherwise - everything else is identical
*/



//import React hooks needed - useState for form state, useContext to read from AuthContext
import { useState, useContext } from 'react'

//import configured axios instance - used to send registration data to the backend
import axiosInstance from '../api/axios'

//import AuthContext - gives access to the login function to save user and token globally after successful registration
import { AuthContext } from '../context/AuthContext'

//import useNavigate for programmatic redirect after registration, Link for navigating to login page
import { useNavigate, Link } from 'react-router-dom'



const RegisterPage = () => {
    //state variables - what data will the user change on this page (that we want to re-render the UI based on)
    //name, email, password - controlled input state variables - update on every keystroke via onChange
    const [name, setName] = useState('')

    //email input state - starts empty, updates as user types
    const [email, setEmail] = useState('')

    //password input state - starts empty, updates as user types
    const [password, setPassword] = useState('')

    //error message state - null means no error, string means show error message on screen
    const [error, setError] = useState(null)


    //read the login function from AuthContext - calling it saves user and token globally so the whole app knows someone is logged in
    const auth = useContext(AuthContext)



    //extract the login function from AuthContext - login() saves user and token to global state and localStorage
    const login = auth.login

    //get the navigate function - used to redirect to hub page after successful registration
    const navigate = useNavigate()



    //functions - what needs to run in response to what actions the user can perform
    //the only thing a user can do on this page is submit information to create a new user profile
    const handleRegistration = async () => {
        //clear any previous error message before any new attempt
        setError(null)

        try {
            //send name, email, password to register endpoint - backend creates user and returns token and user object
            const response = await axiosInstance.post('/api/authentication/register', { name, email, password})

            //get the user and token from the response data
            const userData = response.data 

            //save user and token globally so whole app knows someone is logged in
            login(userData.user, userData.token)

            //redirect to the user's hubPage upon successful login
            navigate('/')
           
        //runs if axios request to the back-end fails
        } catch (error) {
            //log the error for debugging
            console.log(error)

            //show error message to user - email may already be registered
            setError("Registration Failed. Email may already be in use.")
        }
    }

    /*
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        type - what kind of input (text, email, password)
        value={stateVariable} - ties the input to state - React controls what it shows
        onChange={(e) => setStateVariable(e.target.value)} - updates state on every keystroke
        e is the event, e.target is the input element, e.target.value is what the user typed
    */

    //return JSX component - what the user sees (build the page)
    return (
        <div>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
            <input type='email' value={email} onChange={(e) => setEmail(e.target.value)}/>
            <input type='password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
            <button onClick={handleRegistration}>Register</button>
            <Link to='/login'>Login</Link>
            {error ? <p>{error}</p> : null}
        </div>
  )
}



export default RegisterPage