import { useState, useEffect, useContext } from 'react'
import axiosInstance from '../api/axios'
import { AuthContext } from '../context/AuthContext'

//SystemDesignPage - displays all 15 system design topics with user notes
//on mount: fetches all topics with user notes from GET /api/system-design
//user can add/update notes on each topic via PATCH /api/system-design/:id

const SystemDesignPage = () => {
    //topics - array of all 15 system design topics with user notes attached
    const [topics, setTopics] = useState([])

    //selectedTopic - the topic the user clicked on - null means no topic selected, panel hidden
    const [selectedTopic, setSelectedTopic] = useState(null)

    //notes - the notes field the user can update for the selected topic
    const [notes, setNotes] = useState('')

    //read user from AuthContext
    const authData = useContext(AuthContext)
    const user = authData.user

    //fetch all 15 topics with user notes on mount - runs once when page first loads
    useEffect(() => {
        const fetchTopics = async () => {
            try {
                //GET /api/system-design - interceptor attaches token automatically
                const response = await axiosInstance.get('/api/system-design')
                //store the array of topics with notes attached in state
                setTopics(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchTopics()
    }, [])

    //handleSelectTopic - runs when user clicks a topic
    //saves the clicked topic to state and pre-fills the notes field
    const handleSelectTopic = (topic: any) => {
        setSelectedTopic(topic)
        setNotes(topic.notes || '')
    }

    //handleSaveNotes - runs when user clicks save
    //sends updated notes to PATCH /api/system-design/:id and updates state
    const handleSaveNotes = async () => {
        if (!selectedTopic) return
        try {
            //send updated notes to backend - upsert inserts or updates the notes row
            const response = await axiosInstance.patch(`/api/system-design/${(selectedTopic as any).id}`, {
                notes
            })

            //update the topics array - find the updated topic and merge with response data
            setTopics(topics.map((topic: any) =>
                topic.id === (selectedTopic as any).id ? { ...topic, ...response.data } : topic
            ))

            //close the panel
            setSelectedTopic(null)

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="sd-page">

            <div className="sd-header">
                <h1 className="sd-title">SYSTEM DESIGN</h1>
                <p className="sd-count">
                    {topics.filter((t: any) => t.notes).length} / {topics.length} TOPICS WITH NOTES
                </p>
            </div>

            <div className={`sd-grid ${selectedTopic ? 'panel-open' : ''}`}>

                {/* list of topics */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {topics.map((topic: any) => (
                        <div
                            key={topic.id}
                            onClick={() => handleSelectTopic(topic)}
                            className={`sd-row ${(selectedTopic as any)?.id === topic.id ? 'selected' : ''}`}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ color: '#5a5a8a', fontSize: '0.7rem', minWidth: '1.5rem' }}>{topic.id}.</span>
                                <div>
                                    <p className={`sd-topic-title ${topic.notes ? 'noted' : ''}`}>
                                        {topic.notes ? '✓ ' : ''}{topic.title}
                                    </p>
                                    <p className="sd-topic-desc">{topic.description}</p>
                                </div>
                            </div>
                            <span className="sd-category">{topic.category}</span>
                        </div>
                    ))}
                </div>

                {/* panel - only shows when a topic is selected */}
                {selectedTopic && (
                    <div className="progress-panel">
                        <h2 className="panel-title">{(selectedTopic as any).title}</h2>

                        {/* practice question */}
                        {(selectedTopic as any).practice_question && (
                            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#0a0a0f', border: '1px solid #1e1e3a' }}>
                                <p style={{ color: '#5a5a8a', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Practice question</p>
                                <p style={{ color: '#e0e0ff', fontSize: '0.8rem', lineHeight: '1.5' }}>{(selectedTopic as any).practice_question}</p>
                            </div>
                        )}

                        {/* resource link */}
                        {(selectedTopic as any).resource_url && (
                            <a
                                href={(selectedTopic as any).resource_url}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'block', color: '#00d4ff', fontSize: '0.75rem', marginBottom: '1.25rem', textDecoration: 'none', letterSpacing: '0.05em' }}
                            >
                                → read resource
                            </a>
                        )}

                        <div className="panel-form">
                            <div className="panel-field">
                                <label className="panel-label">Your notes</label>
                                <textarea
                                    className="panel-textarea"
                                    rows={8}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Write your notes on this topic..."
                                />
                            </div>

                            <button className="btn-primary" onClick={handleSaveNotes}>Save Notes</button>
                            <button
                                onClick={() => setSelectedTopic(null)}
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

export default SystemDesignPage