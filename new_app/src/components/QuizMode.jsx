import { useState, useEffect, useRef, useCallback } from 'react'
import { elements, CATEGORIES } from '../data/elements'
import './QuizMode.css'

const QUIZ_TYPES = [
  { id: 'name-to-symbol', label: 'Name \u2192 Symbol', prompt: (el) => `What is the symbol for ${el.name}?`, answer: (el) => el.symbol },
  { id: 'symbol-to-name', label: 'Symbol \u2192 Name', prompt: (el) => `What element has the symbol ${el.symbol}?`, answer: (el) => el.name },
  { id: 'number-to-name', label: 'Number \u2192 Name', prompt: (el) => `What is element #${el.number}?`, answer: (el) => el.name },
]

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function QuizMode({ onClose }) {
  const [quizType, setQuizType] = useState(null)
  const [queue, setQueue] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [input, setInput] = useState('')
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [feedback, setFeedback] = useState(null) // { correct: bool, answer: string }
  const [finished, setFinished] = useState(false)
  const [history, setHistory] = useState([]) // { element, correct, userAnswer }
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  const startQuiz = useCallback((type) => {
    setQuizType(type)
    setQueue(shuffle(elements))
    setCurrentIndex(0)
    setScore(0)
    setTotal(0)
    setFeedback(null)
    setFinished(false)
    setHistory([])
    setInput('')
  }, [])

  useEffect(() => {
    if (quizType && !feedback && !finished && inputRef.current) {
      inputRef.current.focus()
    }
  }, [quizType, feedback, finished, currentIndex])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const currentElement = queue[currentIndex]
  const activeType = QUIZ_TYPES.find(t => t.id === quizType)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || feedback) return

    const correctAnswer = activeType.answer(currentElement)
    const isCorrect = input.trim().toLowerCase() === correctAnswer.toLowerCase()

    setTotal(prev => prev + 1)
    if (isCorrect) setScore(prev => prev + 1)
    setFeedback({ correct: isCorrect, answer: correctAnswer })
    setHistory(prev => [...prev, {
      element: currentElement,
      correct: isCorrect,
      userAnswer: input.trim(),
    }])

    if (isCorrect) {
      timerRef.current = setTimeout(() => {
        advance()
      }, 1500)
    }
  }

  const advance = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (currentIndex + 1 >= queue.length) {
      setFinished(true)
    } else {
      setCurrentIndex(prev => prev + 1)
      setInput('')
      setFeedback(null)
    }
  }

  const endQuiz = () => {
    setFinished(true)
  }

  const categoryColor = currentElement ? (CATEGORIES[currentElement.category]?.color || '#788090') : '#788090'

  // --- Selection screen ---
  if (!quizType) {
    return (
      <div className="quiz-overlay" onClick={onClose}>
        <div className="quiz-modal" onClick={e => e.stopPropagation()}>
          <button className="quiz-close" onClick={onClose}>&times;</button>
          <div className="quiz-select">
            <h2 className="quiz-title">QUIZ MODE</h2>
            <p className="quiz-subtitle">Test your knowledge of the periodic table</p>
            <div className="quiz-type-grid">
              {QUIZ_TYPES.map(type => (
                <button
                  key={type.id}
                  className="quiz-type-btn"
                  onClick={() => startQuiz(type.id)}
                >
                  <span className="quiz-type-label">{type.label}</span>
                  <span className="quiz-type-desc">
                    {type.id === 'name-to-symbol' && '118 elements, type the symbol'}
                    {type.id === 'symbol-to-name' && '118 elements, type the name'}
                    {type.id === 'number-to-name' && '118 elements, type the name'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Finished screen ---
  if (finished) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0
    const wrongOnes = history.filter(h => !h.correct)

    return (
      <div className="quiz-overlay" onClick={onClose}>
        <div className="quiz-modal quiz-modal--wide" onClick={e => e.stopPropagation()}>
          <button className="quiz-close" onClick={onClose}>&times;</button>
          <div className="quiz-finished">
            <h2 className="quiz-title">RESULTS</h2>
            <div className="quiz-final-score">
              <span className="quiz-final-num">{score}</span>
              <span className="quiz-final-sep">/</span>
              <span className="quiz-final-num">{total}</span>
            </div>
            <div className="quiz-final-pct">{pct}% correct</div>
            <div className="quiz-final-bar-track">
              <div className="quiz-final-bar-fill" style={{ width: `${pct}%` }} />
            </div>

            {wrongOnes.length > 0 && (
              <div className="quiz-wrong-list">
                <h3 className="quiz-wrong-title">MISSED</h3>
                <div className="quiz-wrong-grid">
                  {wrongOnes.map((h, i) => (
                    <div key={i} className="quiz-wrong-item">
                      <span className="quiz-wrong-num">{h.element.number}</span>
                      <span className="quiz-wrong-symbol">{h.element.symbol}</span>
                      <span className="quiz-wrong-name">{h.element.name}</span>
                      <span className="quiz-wrong-yours">You: {h.userAnswer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="quiz-finished-actions">
              <button className="quiz-btn quiz-btn--ghost" onClick={onClose}>Exit</button>
              <button className="quiz-btn quiz-btn--gold" onClick={() => startQuiz(quizType)}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- Active quiz screen ---
  const progress = total / elements.length
  const feedbackClass = feedback ? (feedback.correct ? 'quiz-card--correct' : 'quiz-card--wrong') : ''

  return (
    <div className="quiz-overlay">
      <div className="quiz-modal" onClick={e => e.stopPropagation()}>
        <button className="quiz-close" onClick={onClose}>&times;</button>

        {/* Header */}
        <div className="quiz-header">
          <span className="quiz-mode-label">{activeType.label}</span>
          <span className="quiz-score">{score}/{total} correct</span>
        </div>

        {/* Progress bar */}
        <div className="quiz-progress-track">
          <div
            className="quiz-progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="quiz-progress-text">{total} of {elements.length}</div>

        {/* Card */}
        <div className={`quiz-card ${feedbackClass}`}>
          <div className="quiz-card-number" style={{ color: categoryColor }}>
            #{currentElement.number}
          </div>

          {quizType === 'symbol-to-name' && (
            <div className="quiz-card-big" style={{ color: categoryColor }}>
              {currentElement.symbol}
            </div>
          )}
          {quizType === 'number-to-name' && (
            <div className="quiz-card-big" style={{ color: categoryColor }}>
              {currentElement.number}
            </div>
          )}

          <div className="quiz-card-prompt">
            {activeType.prompt(currentElement)}
          </div>

          <form className="quiz-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="quiz-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your answer..."
              disabled={!!feedback}
              autoComplete="off"
              spellCheck={false}
            />
          </form>

          {feedback && (
            <div className={`quiz-feedback ${feedback.correct ? 'quiz-feedback--correct' : 'quiz-feedback--wrong'}`}>
              {feedback.correct ? (
                <span>Correct!</span>
              ) : (
                <span>Wrong &mdash; the answer is <strong>{feedback.answer}</strong></span>
              )}
            </div>
          )}

          {feedback && !feedback.correct && (
            <button className="quiz-btn quiz-btn--next" onClick={advance}>
              Next
            </button>
          )}
        </div>

        <button className="quiz-btn quiz-btn--end" onClick={endQuiz}>
          End Quiz
        </button>
      </div>
    </div>
  )
}
