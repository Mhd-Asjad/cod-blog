import { Search, Filter, ChevronDown } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import useApi from "../components/useApi";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";
import { setSortBy as sliceSortBy } from "../store/FilterSlice";
import { useDispatch, useSelector } from "react-redux";

const sortOptions = [
  { value: "newest", label: "Newest", emoji: "🆕" },
  { value: "oldest", label: "Oldest", emoji: "📜" },
  { value: "most_liked", label: "Most Liked", emoji: "❤️" },
  { value: "least_liked", label: "Least Liked", emoji: "💔" },
];

const SortFilter = () => {

  const [isOpen, setIsOpen] = useState(false);
  const sortBy = useSelector((state) => state.filter.sortBy);
  const currentOption = sortOptions.find((opt) => opt.value === sortBy);
  const dispatch = useDispatch();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition focus:outline-none"
        title="Sort Filter"
      >
        <Filter size={18} />
        <ChevronDown className="ml-1 h-4 w-4" />
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
          <Dialog.Panel className="w-full max-w-xs sm:max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg">
            <Dialog.Title className="text-lg font-bold text-gray-800 dark:text-white mb-4">
              Select Sort Option
            </Dialog.Title>
            <div className="space-y-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    dispatch(sliceSortBy(option.value));
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    sortBy === option.value
                      ? "font-semibold text-purple-600 dark:text-purple-400"
                      : "text-gray-800 dark:text-white"
                  }`}
                >
                  {option.emoji} {option.label}
                </button>
              ))}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

const DynamicSearch = ({ className = "" }) => {
  const api = useApi();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const sortBy = useSelector((state) => state.filter.sortBy);
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);

  function debounce(func, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }

  const debouncedSearch = useRef(
    debounce(async (q) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      try {
        const response = await api.get(`posts/search/?q=${q}&sort=${sortBy}`);
        setResults(response.data);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      }
    }, 300)
  ).current;

  useEffect(() => {
    debouncedSearch(query);
    setShowDropdown(true);
  }, [query, sortBy, debouncedSearch]);

  const handleKeyDown = (e) => {
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev === 0 ? results.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        setQuery(results[highlightedIndex].title);
        setShowDropdown(false);
        setHighlightedIndex(-1);
        navigate(`/post/${results[highlightedIndex].id}`);
      }
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto font-montserrat ${className}`}>
      <div className="relative flex items-center gap-2 px-2 sm:px-0">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            className="w-full px-10 py-2 rounded-full border border-gray-400 dark:border-gray-600 dark:bg-gray-800 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-white focus:outline-none dark:focus:ring-1 dark:focus:ring-purple-400 font-montserrat tracking-wider"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={handleKeyDown}
          />
          <Search
            className="absolute top-2.5 left-3 text-gray-500 dark:text-white"
            size={18}
          />
        </div>

        <SortFilter sortBy={sortBy} />
      </div>

      {showDropdown && query && (
        <ul
          className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {results.length > 0 ? (
            results.map((item, idx) => (
              <li
                key={item.id}
                onMouseDown={() => {
                  setQuery(item.title);
                  setShowDropdown(false);
                  setHighlightedIndex(-1);
                  navigate(`/post/${item.id}`);
                }}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  highlightedIndex === idx ? "bg-gray-200 dark:bg-gray-700" : ""
                } text-black dark:text-white`}
              >
                <span className="font-semibold">
                  {item.title.length > 24
                    ? item.title.slice(0, 24) + "..."
                    : item.title}
                </span>{" "}
                <span className="text-xs text-gray-500 ml-1">
                  by {item.author_username}
                </span>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500 dark:text-gray-400">
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default DynamicSearch;
