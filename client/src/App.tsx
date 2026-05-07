//Root Component and Router File

/*
    this file is a blueprint for your front-end

    AuthProvider must wrap everything including the Router
    every page the Router renders needs access to auth data (user, token, login, logout)
    if Router was outside AuthProvider - pages couldn't read the context - no access to who is logged in

    public routes - accessible without being logged in (no token needed)
    /login and /register are public - you need to access these before you have a token

    protected routes - require a valid token to access - unauthenticated users get redirected to /login
    any page that shows personal user data must be protected - algos, behavioral, system design, hub

    Backend router  → routes HTTP requests to controllers - what data should be sent in response
    Frontend router → routes URLs to components that render pages (you define which component renders for which URL) - what page should be shown

    front end will have pages for login, registering, homepage/hub, algos, behavioral, and system design 

    react-router-dom -> for routing in the browser
    BrowserRouter - wraps the whole app and enables routing - watches the URL and tells React Router when it changes
    Routes - container that holds all Route definitions - looks at current URL and finds the matching Route to render
    Route - one entry in the routing map - connects a URL path to the component that should render at that URL
    example: path="/login" element={<LoginPage />} means "when user goes to /login, show the LoginPage component"

    BrowserRouter - a React component that enables the routing system and watches the browser URL address bar
    once in the JSX it automatically listens for URL changes - you never manually trigger it
    without BrowserRouter, Routes and Route have no context to work in - they do nothing
    BrowserRouter enables the system, Routes reads the URL and finds the match, Route defines what URL maps to what component
    they work together - BrowserRouter is the foundation the others need to function

    Route - self closing component that maps one URL to one page component
    needs two props: path (the URL) and element (the component to render at that URL)
    element={<LoginPage />} - what users should see (component) when the navigate to a specific path 
    curly braces because it's JavaScript in JSX - only needed when you're putting JavaScript inside a prop value

*/


//import React components needed for routing in the browser/front-end
import { BrowserRouter, Routes, Route } from 'react-router-dom'

//import the provider that will give auth data to the root element of react application
import { AuthProvider } from './context/AuthContext'

//import applications page components - these are the pages that React Router will render at their respective URLs
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HubPage from './pages/HubPage'
import AlgosPage from './pages/AlgosPage'
import BehavioralPage from './pages/BehavioralPage'
import SystemDesignPage from './pages/SystemDesignPage'




const App = () => {
  //<BrowserRouter> in JSX return starts watching browser URL - when URL changes it tells Routes to find matching Route and render the correct page
  //one Route per page - six pages means six Route tags inside Routes (you determine/create the paths)
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/register' element={<RegisterPage/>}/>
          <Route path='/' element={<HubPage/>}/>
          <Route path='/algos' element={<AlgosPage/>}/>
          <Route path='/behavioral' element={<BehavioralPage/>}/>
          <Route path='/system-design' element={<SystemDesignPage/>}/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App