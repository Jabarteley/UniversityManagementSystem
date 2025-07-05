import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Users, GraduationCap, UserCheck, X, Clock } from 'lucide-react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface SearchResult {
  type: 'document' | 'student' | 'staff' | 'user';
  item: any;
  score: number;
  matches?: any[];
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['document', 'student', 'staff', 'user']);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { data: searchResults, isLoading } = useQuery(
    ['globalSearch', query],
    async () => {
      if (!query.trim()) return { results: [] };
      
      const response = await apiClient.get(`/search/global?q=${encodeURIComponent(query)}&types=${selectedTypes.join(',')}&limit=20`);
      return response.data;
    },
    {
      enabled: query.length > 2,
      staleTime: 30000
    }
  );

  const { data: suggestions } = useQuery(
    ['searchSuggestions', query],
    async () => {
      if (!query.trim() || query.length < 2) return { suggestions: [] };
      
      const response = await apiClient.get(`/search/suggestions?q=${encodeURIComponent(query)}&type=document`);
      return response.data;
    },
    {
      enabled: query.length >= 2,
      staleTime: 60000
    }
  );

  const { data: popularTerms } = useQuery(
    'popularSearchTerms',
    async () => {
      const response = await apiClient.get('/search/popular');
      return response.data;
    },
    {
      staleTime: 300000 // 5 minutes
    }
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    
    // Add to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'document':
        navigate(`/documents/${result.item._id}`);
        break;
      case 'student':
        navigate(`/personnel/students/${result.item._id}`);
        break;
      case 'staff':
        navigate(`/personnel/staff/${result.item._id}`);
        break;
      case 'user':
        navigate(`/users/${result.item._id}`);
        break;
    }
    onClose();
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'document': return FileText;
      case 'student': return GraduationCap;
      case 'staff': return UserCheck;
      case 'user': return Users;
      default: return FileText;
    }
  };

  const getResultTitle = (result: SearchResult) => {
    switch (result.type) {
      case 'document':
        return result.item.title;
      case 'student':
        return `${result.item.userId?.profile?.firstName} ${result.item.userId?.profile?.lastName}`;
      case 'staff':
        return `${result.item.userId?.profile?.firstName} ${result.item.userId?.profile?.lastName}`;
      case 'user':
        return `${result.item.profile?.firstName} ${result.item.profile?.lastName}` || result.item.username;
      default:
        return 'Unknown';
    }
  };

  const getResultSubtitle = (result: SearchResult) => {
    switch (result.type) {
      case 'document':
        return `${result.item.category} • ${result.item.uploadedBy?.profile?.firstName} ${result.item.uploadedBy?.profile?.lastName}`;
      case 'student':
        return `${result.item.registrationNumber} • ${result.item.academicInfo?.department}`;
      case 'staff':
        return `${result.item.staffId} • ${result.item.employmentInfo?.position}`;
      case 'user':
        return `${result.item.role} • ${result.item.email}`;
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
      >
        {/* Search Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search documents, students, staff, users..."
              className="flex-1 text-lg outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search Type Filters */}
          <div className="flex space-x-2 mt-3">
            {[
              { id: 'document', label: 'Documents', icon: FileText },
              { id: 'student', label: 'Students', icon: GraduationCap },
              { id: 'staff', label: 'Staff', icon: UserCheck },
              { id: 'user', label: 'Users', icon: Users }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  if (selectedTypes.includes(id)) {
                    setSelectedTypes(prev => prev.filter(t => t !== id));
                  } else {
                    setSelectedTypes(prev => [...prev, id]);
                  }
                }}
                className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedTypes.includes(id)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-3 w-3 mr-1" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {isLoading && query.length > 2 && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {searchResults?.results && searchResults.results.length > 0 && (
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-500 px-2 py-1">
                Search Results ({searchResults.totalResults})
              </h3>
              {searchResults.results.map((result: SearchResult, index: number) => {
                const Icon = getResultIcon(result.type);
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {getResultTitle(result)}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {getResultSubtitle(result)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">
                        {result.type}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Suggestions */}
          {suggestions?.suggestions && suggestions.suggestions.length > 0 && query.length >= 2 && (
            <div className="p-2 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 px-2 py-1">Suggestions</h3>
              {suggestions.suggestions.map((suggestion: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleSearch(suggestion)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2">
              <h3 className="text-sm font-medium text-gray-500 px-2 py-1 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Recent Searches
              </h3>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700"
                >
                  {search}
                </button>
              ))}
            </div>
          )}

          {/* Popular Terms */}
          {!query && popularTerms?.popularTerms && (
            <div className="p-2 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 px-2 py-1">Popular Searches</h3>
              <div className="flex flex-wrap gap-2 p-2">
                {popularTerms.popularTerms.map((term: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term.term)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {term.term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchResults && searchResults.results.length === 0 && query.length > 2 && !isLoading && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">
                Try different keywords or check your spelling
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GlobalSearch;