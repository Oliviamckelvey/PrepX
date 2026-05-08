//

/*
    useEffect - runs code at a specific moment in the component's life, not tied to user interaction
    useEffect(() => { ... }, []) - the [] means run once when the component first mounts, never again
    used here to fetch all behavioral questions from the backend when the page first loads
    without useEffect the fetch would run on every re-render - every keystroke, every state change - causing chaos
    useState stores the data, useEffect fetches it - they work together

    when two objects are merged and share the same key - the second object's value overwrites the first
    { age: 20, ...{ age: 25 } } = { age: 25 } - the second age wins because it comes last
    this is how we update one question in the array - merge old question with new response data
    new STAR answer values overwrite the old ones because response.data comes second in the merge

*/





//
import { useState, useContext, useEffect } from 'react'

//
import axiosInstance from '../api/axios'

//
import { AuthContext } from '../context/AuthContext'


const BehavioralPage = () => {
//behavioralQ - array of all 29 behavioral questions with user STAR answers attached - fetched from backend on mount
    const [behavioralQ, setBehavioralQ] = useState([])

    //selectedQ - the specific question the user clicked on - null means no question selected, panel hidden
    const [selectedQ, setSelectedQ] = useState(null)

    //the four pieces of data the user can change on the page (we want to re-render the UI when any of these are changed)
    const [situation, setSituation] = useState('')
    const [task, setTask] = useState('')
    const [action, setAction] = useState('')
    const [result, setResult] = useState('')

    //read auth data from AuthContext to identify the user making the request so we can populate the correct response data (done with a LEFT JOIN in the back-end)
    //we use useEffect do do something once when the components first render - like loading the behavioral questions only need to do this once bc they never change
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                //make a request to the backend for the behavioral response relevant to the user - use axiosInstance
                const response = await axiosInstance.get('/api/behavioral')

                //store the array of 29 behavioral questions with user answers attached in state - React re-renders and displays them
                setBehavioralQ(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        //call the async function - defining it alone doesn't run it
        fetchQuestions()
    }, [])

    //handleSelectQuestion - runs when user clicks a question - sets selectedQ to that question and pre-fills STAR form fields with existing answers
    const handleSelectQuestion = (question) => {
        //save the clicked question to state - panel reads from selectedQ to know which question to display
        setSelectedQ(question)

        //load the current response data for each of the user's STAR input fields - empty string if user has not yet saved a response
        setSituation(question.situation || '')
        setTask(question.task || '')
        setAction(question.action || '')
        setResult(question.result || '')

    }

    //handleSaveAnswer - runs when user clicks save - sends updated STAR answer to PATCH /api/behavioral/:id and updates state
    const handleNewResponse = async () => {
        try {
            //send updated STAR fields to backend - upsert inserts or updates the answer row for this use
            const response = await axiosInstance.patch(`/api/behavioral/${selectedQ.id}`, {
                //the four STAR fields from state - what the user typed in the form
                situation: situation,
                task: task,
                action: action,
                result: result 
            })

            //update the behavioralQ array in state - find the updated question and merge old data with new response data
            //second object overwrites first where keys overlap - new STAR answers replace old ones
            setBehavioralQ(behavioralQ.map((question) => 
                //if the question we are currently iterating over is the question we just updated our response 2 -> replace it - otherwise return existing data unchanged
                question.id === selectedQ.id ? {...question, ...response.data} : question)
            )

            //clear selectedQ - closes the panel and signals to the user that their answer was saved
            setSelectedQ(null)

        } catch (error) {
            console.log(error)
        }
    }

    /*  
         
    */

    /* 
        panel - only shows when a question is selected 
        selectedQ && - panel only renders when a question is clicked - null means hidden, question object means visible
        selectedQ as any).question - displays the question text at the top of the panel
        four text areas - one per STAR field - controlled inputs tied to state, onChange updates state on every keystroke
        Save button - calls handleNewResponse which sends PATCH request and updates state 
        Cancel button - sets selectedQ to null which closes the panel without saving
    */

    return (
        <div className="behavioral-page">

            {/* header */}
            <div className="behavioral-header">
                <h1 className="behavioral-title">BEHAVIORAL</h1>
                <p className="behavioral-count">
                    {behavioralQ.filter((q: any) => q.situation).length} / {behavioralQ.length} ANSWERED
                </p>
            </div>

            <div className={`behavioral-grid ${selectedQ ? 'panel-open' : ''}`}>

                {/* list of questions 
                    render/create a clickable div for every behavioral question in the array 
                    loop through all 29 questions - for each question render a clickable div showing the question text and category
                    key={question.id} - React needs a unique key on each mapped item to track changes
                    onClick passes the clicked question to handleSelectQuestion - sets selectedQ and pre-fills STAR fields
                */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {/* loop through all 29 questions - for each question render a clickable row */}
                    {behavioralQ.map((question: any) => (
                        <div
                            key={question.id}
                            onClick={() => handleSelectQuestion(question)}
                            className={`behavioral-row ${(selectedQ as any)?.id === question.id ? 'selected' : ''}`}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: '#5a5a8a', fontSize: '0.7rem', minWidth: '1.5rem' }}>{question.id}.</span>
                                <p className={`behavioral-question ${question.situation ? 'answered' : ''}`}>
                                    {question.situation ? '✓ ' : ''}{question.question}
                                </p>
                            </div>
                            <span className="behavioral-category">{question.category}</span>
                        </div>
                    ))}
                </div>

                {/* panel - only shows when a question is selected 
                    selectedQ && - panel only renders when a question is clicked - null means hidden, question object means visible
                    selectedQ as any).question - displays the question text at the top of the panel
                    four text areas - one per STAR field - controlled inputs tied to state, onChange updates state on every keystroke
                    Save button - calls handleNewResponse which sends PATCH request and updates state 
                    Cancel button - sets selectedQ to null which closes the panel without saving
                */}
                {selectedQ && (
                    <div className="progress-panel">
                        <h2 className="panel-title">{(selectedQ as any).question}</h2>

                        <div className="panel-form">

                            <div className="panel-field">
                                <label className="panel-label">Situation</label>
                                <textarea
                                    className="panel-textarea"
                                    rows={3}
                                    value={situation}
                                    onChange={(e) => setSituation(e.target.value)}
                                    placeholder="Describe the situation..."
                                />
                            </div>

                            <div className="panel-field">
                                <label className="panel-label">Task</label>
                                <textarea
                                    className="panel-textarea"
                                    rows={3}
                                    value={task}
                                    onChange={(e) => setTask(e.target.value)}
                                    placeholder="What was your task or responsibility..."
                                />
                            </div>

                            <div className="panel-field">
                                <label className="panel-label">Action</label>
                                <textarea
                                    className="panel-textarea"
                                    rows={3}
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    placeholder="What actions did you take..."
                                />
                            </div>

                            <div className="panel-field">
                                <label className="panel-label">Result</label>
                                <textarea
                                    className="panel-textarea"
                                    rows={3}
                                    value={result}
                                    onChange={(e) => setResult(e.target.value)}
                                    placeholder="What was the outcome..."
                                />
                            </div>

                            <button className="btn-primary" onClick={handleNewResponse}>Save Answer</button>
                            <button
                                onClick={() => setSelectedQ(null)}
                                style={{ background: 'transparent', border: '1px solid #1e1e3a', color: '#5a5a8a', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.75rem', padding: '0.5rem', cursor: 'pointer', width: '100%' }}
                            >
                                cancel
                            </button>

                        </div>
                    </div>
                )}

            </div>
        </div>
    )

}

export default BehavioralPage