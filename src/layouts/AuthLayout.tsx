import { Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

// Icons
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const AuthLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="images/logo.png" alt="Fixa" className="h-8 w-8" />
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Fixa</span>
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex items-center justify-center">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Fixa. Todos os direitos reservados.
            </div>
            <div className="mt-2 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
              Feito com ❤️ para estudantes e autodidatas
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;