import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, FlaskConical } from 'lucide-react'


export function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close mobile menu on navigation
  const handleLinkClick = () => setOpen(false)

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            onClick={handleLinkClick}
          >
            <FlaskConical className="w-5 h-5 text-blue-600" aria-hidden="true" />
            DesignLab
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6" aria-label="Main navigation">
            <Link
              to="/problems"
              className={`text-sm font-medium transition-colors ${
                location.pathname.startsWith('/problems')
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Problems
            </Link>
            <Link
              to="/history"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/history'
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              History
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="sm:hidden btn-ghost"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(v => !v)}
          >
            {open ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-menu" className="sm:hidden border-t border-gray-100 bg-white">
          <nav className="flex flex-col px-4 py-2" aria-label="Mobile navigation">
            <Link
              to="/problems"
              onClick={handleLinkClick}
              className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                location.pathname.startsWith('/problems')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Problems
            </Link>
            <Link
              to="/history"
              onClick={handleLinkClick}
              className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                location.pathname === '/history'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              History
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
