//Route Protection Component File 

/*
    problem: some pages should only be visible to logged in users
    without protection anyone can visit /algos, /behavioral etc - page loads but data fails with 401
    
    ProtectedRoute wraps protected routes in App.tsx - runs before the page renders
    checks AuthContext for a token - if no token redirect to /login, if token exists render the page

    why AuthContext not localStorage:
    AuthContext holds the verified user object - token has already been checked against the backend
    when you login you get a user object and token from the back-end and AuthContext is where you store that info so whole app can access it
    AuthContext is reactive - if user logs out, ProtectedRoute re-renders and redirects immediately
    localStorage just holds a string - no reactivity, no verification

    how it works in App.tsx:
    <Route path='/algos' element={<ProtectedRoute><AlgosPage /></ProtectedRoute>} />
    ProtectedRoute runs first → checks token → redirects or renders children

    children - whatever page component is wrapped inside ProtectedRoute

    Navigate - React Router component that redirects to a different URL
    Used to redirect a user who isn't authorized - if not logged in this sends them to login page which is how access to certain routes is denied

*/


//import the ability to read from any context - the user data we made available to every component with having tp pass via props
import { useContext } from 'react'

//import our specific context which holds our current user data object and their token - useContext needs this to know where to read from 
import { AuthContext } from '../context/AuthContext'

//import ability to redirect user back the to login in page if they're not logged - prevents access to routes we want to protect
import { Navigate } from 'react-router-dom'



const ProtectedRoute = (props) => {
    //verify that a user is logged in in order for them to access specific pages/routes 
    //use the token because its more efficient - we are checking to see IF someone is logged in, specific user data is not relevant
    const authData = useContext(AuthContext)

    //read token from AuthContext - exists if user is logged in, null if not
    const token = authData.token
    //read loading from AuthContext - true while session is being restored on page refresh, false when done
    const loading = authData.loading

    //while session is restoring - show loading instead of redirecting - prevents premature redirect before token is restored
    if(loading) return <div>Loading...</div>

    //if the user token does NOT exist the user is redirected to the log in page
    if(!token) return <Navigate to ='/login'/>
    
    //token exists - user is logged in - render the protected page    
    return props.children
}

export default ProtectedRoute
