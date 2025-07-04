import Fuse from 'fuse.js';
import Document from '../models/Document.js';
import Student from '../models/Student.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';

export interface SearchResult {
  type: 'document' | 'student' | 'staff' | 'user';
  item: any;
  score: number;
  matches?: any[];
}

export class SearchService {
  private static instance: SearchService;
  private documentIndex: Fuse<any> | null = null;
  private studentIndex: Fuse<any> | null = null;
  private staffIndex: Fuse<any> | null = null;
  private userIndex: Fuse<any> | null = null;

  private constructor() {}

  public static getInstance(): SearchService {
    if (!SearchService.instance) {
      SearchService.instance = new SearchService();
    }
    return SearchService.instance;
  }

  // Initialize search indexes
  async initializeIndexes(): Promise<void> {
    try {
      await Promise.all([
        this.initializeDocumentIndex(),
        this.initializeStudentIndex(),
        this.initializeStaffIndex(),
        this.initializeUserIndex()
      ]);
    } catch (error) {
      console.error('Error initializing search indexes:', error);
    }
  }

  // Initialize document search index
  private async initializeDocumentIndex(): Promise<void> {
    try {
      const documents = await Document.find({ isActive: true, isArchived: false })
        .populate('uploadedBy', 'profile')
        .lean();

      const fuseOptions = {
        keys: [
          { name: 'title', weight: 0.3 },
          { name: 'description', weight: 0.2 },
          { name: 'searchableText', weight: 0.2 },
          { name: 'tags', weight: 0.15 },
          { name: 'category', weight: 0.1 },
          { name: 'subcategory', weight: 0.05 }
        ],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2
      };

      this.documentIndex = new Fuse(documents, fuseOptions);
    } catch (error) {
      console.error('Error initializing document index:', error);
    }
  }

  // Initialize student search index
  private async initializeStudentIndex(): Promise<void> {
    try {
      const students = await Student.find({ isActive: true })
        .populate('userId', 'profile email')
        .lean();

      const fuseOptions = {
        keys: [
          { name: 'registrationNumber', weight: 0.3 },
          { name: 'userId.profile.firstName', weight: 0.2 },
          { name: 'userId.profile.lastName', weight: 0.2 },
          { name: 'userId.email', weight: 0.15 },
          { name: 'academicInfo.faculty', weight: 0.1 },
          { name: 'academicInfo.department', weight: 0.05 }
        ],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true
      };

      this.studentIndex = new Fuse(students, fuseOptions);
    } catch (error) {
      console.error('Error initializing student index:', error);
    }
  }

  // Initialize staff search index
  private async initializeStaffIndex(): Promise<void> {
    try {
      const staff = await Staff.find({ isActive: true })
        .populate('userId', 'profile email')
        .lean();

      const fuseOptions = {
        keys: [
          { name: 'staffId', weight: 0.3 },
          { name: 'userId.profile.firstName', weight: 0.2 },
          { name: 'userId.profile.lastName', weight: 0.2 },
          { name: 'userId.email', weight: 0.15 },
          { name: 'employmentInfo.department', weight: 0.1 },
          { name: 'employmentInfo.position', weight: 0.05 }
        ],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true
      };

      this.staffIndex = new Fuse(staff, fuseOptions);
    } catch (error) {
      console.error('Error initializing staff index:', error);
    }
  }

  // Initialize user search index
  private async initializeUserIndex(): Promise<void> {
    try {
      const users = await User.find({ isActive: true })
        .select('-password')
        .lean();

      const fuseOptions = {
        keys: [
          { name: 'username', weight: 0.3 },
          { name: 'email', weight: 0.3 },
          { name: 'profile.firstName', weight: 0.2 },
          { name: 'profile.lastName', weight: 0.2 }
        ],
        threshold: 0.4,
        includeScore: true,
        includeMatches: true
      };

      this.userIndex = new Fuse(users, fuseOptions);
    } catch (error) {
      console.error('Error initializing user index:', error);
    }
  }

  // Global search across all entities
  async globalSearch(query: string, options: {
    types?: ('document' | 'student' | 'staff' | 'user')[];
    limit?: number;
    userId?: string;
    accessLevel?: string[];
  } = {}): Promise<SearchResult[]> {
    const { types = ['document', 'student', 'staff', 'user'], limit = 50 } = options;
    const results: SearchResult[] = [];

    try {
      // Search documents
      if (types.includes('document') && this.documentIndex) {
        const documentResults = this.documentIndex.search(query, { limit: Math.ceil(limit / types.length) });
        results.push(...documentResults.map(result => ({
          type: 'document' as const,
          item: result.item,
          score: result.score || 0,
          matches: result.matches
        })));
      }

      // Search students
      if (types.includes('student') && this.studentIndex) {
        const studentResults = this.studentIndex.search(query, { limit: Math.ceil(limit / types.length) });
        results.push(...studentResults.map(result => ({
          type: 'student' as const,
          item: result.item,
          score: result.score || 0,
          matches: result.matches
        })));
      }

      // Search staff
      if (types.includes('staff') && this.staffIndex) {
        const staffResults = this.staffIndex.search(query, { limit: Math.ceil(limit / types.length) });
        results.push(...staffResults.map(result => ({
          type: 'staff' as const,
          item: result.item,
          score: result.score || 0,
          matches: result.matches
        })));
      }

      // Search users
      if (types.includes('user') && this.userIndex) {
        const userResults = this.userIndex.search(query, { limit: Math.ceil(limit / types.length) });
        results.push(...userResults.map(result => ({
          type: 'user' as const,
          item: result.item,
          score: result.score || 0,
          matches: result.matches
        })));
      }

      // Sort by relevance score and apply limit
      return results
        .sort((a, b) => a.score - b.score)
        .slice(0, limit);

    } catch (error) {
      console.error('Error performing global search:', error);
      return [];
    }
  }

  // Search documents with advanced filters
  async searchDocuments(query: string, filters: {
    category?: string;
    subcategory?: string;
    accessLevel?: string[];
    dateRange?: { start: Date; end: Date };
    tags?: string[];
    uploadedBy?: string;
    limit?: number;
  } = {}): Promise<SearchResult[]> {
    try {
      if (!this.documentIndex) {
        await this.initializeDocumentIndex();
      }

      if (!this.documentIndex) {
        return [];
      }

      let results = this.documentIndex.search(query, { limit: filters.limit || 50 });

      // Apply additional filters
      if (filters.category || filters.subcategory || filters.accessLevel || filters.dateRange || filters.tags || filters.uploadedBy) {
        results = results.filter(result => {
          const doc = result.item;

          if (filters.category && doc.category !== filters.category) return false;
          if (filters.subcategory && doc.subcategory !== filters.subcategory) return false;
          if (filters.accessLevel && !filters.accessLevel.includes(doc.accessLevel)) return false;
          if (filters.uploadedBy && doc.uploadedBy.toString() !== filters.uploadedBy) return false;

          if (filters.dateRange) {
            const docDate = new Date(doc.createdAt);
            if (docDate < filters.dateRange.start || docDate > filters.dateRange.end) return false;
          }

          if (filters.tags && filters.tags.length > 0) {
            const hasMatchingTag = filters.tags.some(tag => 
              doc.tags.some((docTag: string) => docTag.toLowerCase().includes(tag.toLowerCase()))
            );
            if (!hasMatchingTag) return false;
          }

          return true;
        });
      }

      return results.map(result => ({
        type: 'document' as const,
        item: result.item,
        score: result.score || 0,
        matches: result.matches
      }));

    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }

  // Refresh search indexes
  async refreshIndexes(): Promise<void> {
    try {
      await this.initializeIndexes();
    } catch (error) {
      console.error('Error refreshing search indexes:', error);
    }
  }

  // Get search suggestions
  async getSearchSuggestions(query: string, type: 'document' | 'student' | 'staff' | 'user'): Promise<string[]> {
    try {
      const results = await this.globalSearch(query, { types: [type], limit: 10 });
      
      const suggestions = new Set<string>();
      
      results.forEach(result => {
        if (result.matches) {
          result.matches.forEach((match: any) => {
            if (match.value && typeof match.value === 'string') {
              // Extract words that contain the query
              const words = match.value.split(/\s+/);
              words.forEach(word => {
                if (word.toLowerCase().includes(query.toLowerCase()) && word.length > query.length) {
                  suggestions.add(word);
                }
              });
            }
          });
        }
      });

      return Array.from(suggestions).slice(0, 5);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  // Get popular search terms
  async getPopularSearchTerms(): Promise<{ term: string; count: number }[]> {
    // This would typically be stored in a separate collection
    // For now, return some common terms
    return [
      { term: 'transcript', count: 150 },
      { term: 'certificate', count: 120 },
      { term: 'assignment', count: 100 },
      { term: 'thesis', count: 80 },
      { term: 'report', count: 75 }
    ];
  }
}

export default SearchService;