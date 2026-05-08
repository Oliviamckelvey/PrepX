//

/*

*/


//
import { useState, useEffect, useContext } from 'react'

//
import axiosInstance from '../api/axios'

//
import { AuthContext } from '../context/AuthContext'



const AlgosPage = () => {
    //algos - array of all 75 problems with user progress attached (solved, confidence, notes etc)
    const [algos, setAlgos] = useState([])

    //selectedAlgo - the problem the user clicked on to update progress - null means no problem selected
    const [selectedAlgo, setSelectedAlgo] = useState(null)

    //form state - the progress fields the user can update for the selected problem
    const [solved, setSolved] = useState(false)
    const [confidence, setConfidence] = useState(1)
    const [timeTaken, setTimeTaken] = useState(0)
    const [notes, setNotes] = useState('')

    //read user from AuthContext - needed to know who is logged in
    const authData = useContext(AuthContext)
    const user = authData.user

    //fetch all 75 problems with user progress on mount - all the algos loaded once when user first goes to the page
    //useEffect with [] runs once when the component first appears on screen
    useEffect(() => {
        const fetchAlgos = async () => {
            try {
                //GET /api/algos - interceptor attaches token automatically
                const response = await axiosInstance.get('/api/algos')
                //response.data is the array of 75 problems with progress attached
                setAlgos(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchAlgos()
    }, [])


    //handleSelectAlgo - called when user clicks a problem
    //sets selectedAlgo to the clicked problem and pre-fills the form with existing progress
    const handleSelectAlgo = (algo: any) => {
        setSelectedAlgo(algo)
        //pre-fill form with existing progress - if null use defaults
        setSolved(algo.solved || false)
        setConfidence(algo.confidence || 1)
        setTimeTaken(algo.time_taken_minutes || 0)
        setNotes(algo.notes || '')
    }

    //handleUpdateProgress - called when user clicks save
    //sends updated progress to PATCH /api/algos/:id
    //updates the algos array in state so UI reflects the change immediately
    const handleUpdateProgress = async () => {
        if (!selectedAlgo) return

        try {
            //PATCH /api/algos/:id - send updated progress fields
            const response = await axiosInstance.patch(`/api/algos/${selectedAlgo.id}`, {
                solved,
                confidence,
                time_taken_minutes: timeTaken,
                notes
            })

            //update the algos array - find the updated problem and replace it with the response
            //this updates the UI immediately without needing to refetch all 75 problems
            setAlgos(algos.map((algo: any) => 
                algo.id === selectedAlgo.id ? { ...algo, ...response.data } : algo
            ))

            //clear selected algo - closes the form
            setSelectedAlgo(null)

        } catch (error) {
            console.log(error)
        }
    }

    return (
    <div className="algos-page">
        <div className="algos-header">
        <h1 className="algos-title">GRIND 75</h1>
        <p className="algos-count">{algos.filter((a: any) => a.solved).length} / 75 SOLVED</p>
        </div>

        <div className={`algos-grid ${selectedAlgo ? 'panel-open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {algos.map((algo: any) => (
            <div
                key={algo.id}
                onClick={() => handleSelectAlgo(algo)}
                className={`algo-row ${(selectedAlgo as any)?.id === algo.id ? 'selected' : ''}`}
            >
                <span className="algo-index">{algo.order_index}</span>
                <span className={`algo-title ${algo.solved ? 'solved' : ''}`}>{algo.solved ? '✓ ' : ''}{algo.title}</span>
                <span className={`algo-difficulty difficulty-${algo.difficulty.toLowerCase()}`}>{algo.difficulty.toUpperCase()}</span>
                <span className="algo-category">{algo.category}</span>
                <a href={algo.leetcode_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="algo-link">LC →</a>
            </div>
            ))}
        </div>

        {selectedAlgo && (
            <div className="progress-panel">
                <h2 className="panel-title">{(selectedAlgo).title}</h2>
                <div className="panel-form">
                    <div className="solved-row">
                        <label className="panel-label">Solved</label>
                        <input type="checkbox" checked={solved} onChange={(e) => setSolved(e.target.checked)} style={{ accentColor: '#00ff88', width: '1.2rem', height: '1.2rem' }}/>
                    </div>
                    
                    <div className="panel-field">
                        <label className="panel-label">Confidence: {confidence}/5</label>
                        <input type="range" min={1} max={5} value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} style={{ accentColor: '#00ff88' }}/>
                    </div>

                    <div className="panel-field">
                        <label className="panel-label">Time (Minutes)</label>
                        <input type="number" value={timeTaken} onChange={(e) => setTimeTaken(Number(e.target.value))} className="panel-input"/>
                    </div>

                    <div className="panel-field">
                        <label className="panel-label">Notes</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="panel-textarea"/>
                    </div>
                    
                    <button className="btn-primary" onClick={handleUpdateProgress}>Save Progress</button>
                    <button onClick={() => setSelectedAlgo(null)} style={{ background: 'transparent', border: '1px solid #1e1e3a', color: '#5a5a8a', fontFamily: "'Share Tech Mono', monospace", fontSize: '0.75rem', padding: '0.5rem', cursor: 'pointer', width: '100%' }}>cancel</button>
                </div>
            </div>
        )}
        </div>
    </div>
    ) 
}

export default AlgosPage