import './SearchBar.css'

export default function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="search">
      <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="text"
        placeholder="Search by name, symbol, or number..."
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        spellCheck={false}
      />
      {searchTerm && (
        <button className="search-clear" onClick={() => onSearchChange('')}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
