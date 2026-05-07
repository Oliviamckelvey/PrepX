//Global Authentication State

/*
    the problem: multiple components across the app need access to the logged in user
    passing user as props through every component is messy and hard to maintain (prop drilling)
    AuthContext solves this - stores auth data in one place and shares it with any component that needs it

    React components are named using PascalCase - component should be named after what they provide 

    A React component if just a function that returns JSX (func that returns something to display)
    const MyComponent = () => {
        return (
            <div>Hello</div>
        )
    }

    React automatically collects all the data you pass in and puts it on an object called props
    The object automatically gets passed to the component function 

    this file holds: user (who is logged in), token (their JWT), login function, logout function
    any component can read this data with useContext(AuthContext) - no props needed

    HOW IT WORKS
    createContext(null)  = creates the channel (empty shell)
    Provider             = the component that holds the data and wraps the whole app
    value                = the actual data being shared with every component inside the Provider
    children             = everything inside the Provider - they all get access to the context data
    useContext           = how any component reads from the context - one line, gets everything in value

    AuthContext = the connection point - a bridge not the data itself
    AuthProvider = fills connection point with data - holds user, token, login, logout
    useContext(AuthContext) = connects to the connection point and reads the data

*/


/*
    useState()

    returns an array of 2 things

    const [val, setVal] = useState(null)
              ↑       ↑
            current   updater function
            value     (React creates this for you)

    useState - stores data that the UI needs to respond to - when state changes React re-renders automatically
    regular variables never trigger re-renders - always use state for data the UI needs to display

    state and the functions that change it always live in the same component
    ask yourself "what are all the ways this state can change?" - each answer becomes a function
    these functions are called event handlers or state updaters - they represent every possible user interaction with the state
    
    for AuthProvider: user/token can change in exactly two ways
    login()  → user logs in  → setUser(userData) and setToken(token) - fills state with real data
    logout() → user logs out → setUser(null) and setToken(null) - clears state back to empty
    
    state values are shared through context so any component can read them
    setter functions (like setUser, setToken) stay private inside the component that owns the state
    instead of exposing setters directly - wrap them in functions (login, logout) and share those
    components can READ state and TRIGGER changes through shared functions - but never SET state directly
    you wrap setters to control how the state is updated - otherwise a user could set the credentials to anything they want (fake who they are)

*/



//import React hooks needed in this file - createContext to create the context, useState for state management, useEffect to restore session on mount
import { createContext, useState, useEffect } from 'react'

//import the configured axios instance - used to call the backend API to restore the user session on page refresh
import axiosInstance from '../api/axios'



//create and export context - the channel that connects the Provider to the components that need the data 
//React creates a Provider property on the object it returns - shares value data with whole app
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)





//create and export a Provider component - holds data and makes it available to users 
export const AuthProvider = (props) => {
    //everything in this function depends on the current user and their token - save data as state so when user data changes React re-renders
    //setter functions are created for us by React
    const [user, setUser] = useState(null)
    const [token, setToken]  = useState(null)

    //create the functions that run in response to state data being altered on the UI - the only way UI changes this data is by logging in or out
    const login = (userData: any, userToken: string) => {
        //update the user data and token using the setter functions
        setUser(userData)
        setToken(userToken)

        //save the updated data in local storage - persists through browser refresh (user wont get logged out on every refresh)
        localStorage.setItem('token', userToken)
    }

    const logout = () => {
        //clear the state (user and token) b/c the react re-renders in response to that data changed and we want the UI to immediately update and reflect that user is logged out
        setUser(null)
        setToken(null)

        //remove the token stored in local storage 
        localStorage.removeItem('token')
    }

    //useEffect is the code that bridges the gap between what's in localStorage and what's in state after a page refresh
    //on refresh localStorage persist but React state disappears - so you need to update React state with localStorage data
    useEffect(() => {
        //define async function inside useEffect - useEffect itself cannot be async
        const restoreState = async () => {
            //wrap in try/catch - if token is expired or invalid the API call will fail
            try {
                //check if a token exists in localStorage - if not skip restoring the session
                if(localStorage.getItem('token')) {
                    //call GET /api/authentication/me - interceptor automatically attaches token to Authorization header
                    const userResponse = await axiosInstance.get('/api/authentication/me')
                    //response.data contains the user object returned by the getMe controller
                    const userData = userResponse.data
                    //update user and token state - react will re-render and the app will know user is logged in
                    setUser(userData)
                    //read token from localStorage and restore it to state
                    setToken(localStorage.getItem('token'))  
                }
            //if API call fails - token is expired or invalid - clear everything and start fresh
            } catch (error) {
                //log the error so developers can see what went wrong
                console.log(error)
                //call logout to clear bad token from localStorage and reset state to null
                logout()
            }
        }
        //call the async function - defining it alone doesn't run it
        restoreState()
    //empty array - run once when component first mounts - don't run again on every state change
    }, [])
        
        

    //remember components return jsx - typically jsx tags should be named exactly the component function name
    //<AuthContext.Provider> - built in React component that makes context data available to everything inside it
    //value={{ user, token, login, logout }} - the data being shared with every component that calls useContext(AuthContext)
    //{children} - renders everything wrapped inside <AuthProvider> in App.tsx - without this nothing would show on screen
    //{} curly braces are how you use/incorporate JavaScript in JSX
    return (
        <AuthContext.Provider value={{user: user, token: token, login: login, logout: logout}}>
            {props.children}
        </AuthContext.Provider>
    )
}


