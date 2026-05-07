
//
import { useContext } from 'react'

//
import { useNavigate } from 'react-router-dom'

//
import { AuthContext } from '../context/AuthContext'


//
const HubPage = () => {
//get navigate function from React Router - used to redirect to module pages when cards are clicked
    const navigate = useNavigate()
    
    //read auth data from AuthContext - need user for welcome message and logout function
    const authData = useContext(AuthContext)
    
    //extract user object - used to display welcome message with their name
    const user = authData.user
    
    //extract logout function - clears user and token from state and localStorage
    const logout = authData.logout

    //handleLogout - calls logout to clear auth data then redirects to login page
    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="hub-page">

            <div className="hub-header">
                <div>
                    <h1 className="hub-logo">PrepX</h1>
                    <p className="hub-welcome">// Welcome back, {user?.name || 'coder'} //</p>
                </div>
                <button className="hub-logout" onClick={handleLogout}>Logout</button>
            </div>

            <div className="hub-tagline">
                <p>SELECT YOUR TRAINING MODULE</p>
            </div>

            <div className="hub-modules">

                <div className="hub-card" onClick={() => navigate('/algos')}>
                    <span className="hub-card-number">01</span>
                    <div className="hub-card-content">
                        <h2 className="hub-card-title">GRIND 75</h2>
                        <p className="hub-card-desc">75 essential algorithms. Track your progress, confidence, and the time it takes to solve an algorithm.</p>
                    </div>
                    <span className="hub-card-arrow">→</span>
                </div>

                <div className="hub-card hub-card-cyan" onClick={() => navigate('/behavioral')}>
                    <span className="hub-card-number">02</span>
                    <div className="hub-card-content">
                        <h2 className="hub-card-title">BEHAVIORAL</h2>
                        <p className="hub-card-desc">Master the STAR method. Prepare answers to the most common interview questions.</p>
                    </div>
                    <span className="hub-card-arrow">→</span>
                </div>

                <div className="hub-card hub-card-purple" onClick={() => navigate('/system-design')}>
                    <span className="hub-card-number">03</span>
                    <div className="hub-card-content">
                        <h2 className="hub-card-title">SYSTEM DESIGN</h2>
                        <p className="hub-card-desc">Learn to design scalable systems. Practice with real interview topics and take notes.</p>
                    </div>
                    <span className="hub-card-arrow">→</span>
                </div>

            </div>

        </div>
    )
}

export default HubPage
