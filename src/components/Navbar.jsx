import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ searchTerm, setSearchTerm, contentType, setContentType }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleContentType = (type) => {
    setContentType(type);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const dropdownItems = [
    { type: "movie", label: "🎬 Movies" },
    { type: "tv", label: "📺 TV Shows" },
    { type: "both", label: "🎞️ Both" },
  ];

  return (
    <nav className="bg-dark-100/80 backdrop-blur-md text-white sticky top-0 z-50 shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center justify-center gap-3"
        >
          <img src="/icon-logo.png" alt="MovieFlixx Logo" className="w-auto h-6 sm:h-8"/>
          <span className="text-2xl sm:text-3xl font-bold text-gradient tracking-wide">MovieFlixx</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="text-md font-medium hover:text-light-100 transition"
          >
            Home
          </Link>
          <Link
            to="/liked"
            className="text-md font-medium hover:text-light-100 transition"
          >
            Favorites
          </Link>

          {/* Search */}
          <div className="relative w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movies or shows..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-light-100/5 text-sm text-gray-100 placeholder-light-200 outline-none border border-light-100/10 focus:ring-2 focus:ring-violet-700 transition"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-light-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-red-400 text-sm transition"
              >
                clear
              </button>
            )}
          </div>

          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer bg-light-100/5 px-4 py-2 text-sm rounded-full hover:bg-violet-700 transition"
            >
              {contentType === "movie"
                ? "🎬 Movies"
                : contentType === "tv"
                ? "📺 TV Shows"
                : "🎞️ Both"}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 left-[-25px] mt-5 w-40 bg-dark-100/80 backdrop-blur-md rounded shadow-lg z-50 nav-dropdown transition-all duration-200 ease-out">
                {dropdownItems.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleContentType(item.type)}
                    className={`cursor-pointer w-full text-left px-4 py-2 text-sm hover:bg-violet-700 transition ${
                      contentType === item.type
                        ? "text-violet-400"
                        : "text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="cursor-pointer relative w-8 h-8 flex items-center justify-center group focus:outline-none"
          >
            <span
              className={`absolute h-0.5 w-6 bg-gray-300 rounded transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
              }`}
            />
            <span
              className={`absolute h-0.5 w-6 bg-gray-300 rounded transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute h-0.5 w-6 bg-gray-300 rounded transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3">
          <Link
            to="/"
            className="pl-4 block text-sm font-medium hover:text-light-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/liked"
            className="pl-4 block text-sm font-medium hover:text-light-200"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Favorites
          </Link>

          {/* Dropdown Items */}
          <div className="space-y-2">
            {dropdownItems.map((item) => (
              <button
                key={item.type}
                onClick={() => handleContentType(item.type)}
                className={`block w-full text-left px-4 py-2 rounded-full text-sm transition ${
                  contentType === item.type
                    ? "bg-violet-700 text-white"
                    : "bg-light-100/5 text-gray-200 hover:bg-violet-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-light-100/5 text-sm text-gray-100 placeholder-light-200 border border-light-100/10 focus:outline-none focus:ring-2 focus:ring-violet-700 transition"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-light-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-red-400 text-sm transition"
              >
                clear
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
