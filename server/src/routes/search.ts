import express from 'express';
import { auth, AuthRequest } from '../middleware/auth.js';
import SearchService from '../services/searchService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const searchService = SearchService.getInstance();

// Global search across all entities
router.get('/global', auth, async (req: AuthRequest, res) => {
  try {
    const { q, types, limit = 20 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const searchTypes = types ? (types as string).split(',') : ['document', 'student', 'staff', 'user'];
    
    const results = await searchService.globalSearch(q as string, {
      types: searchTypes as any,
      limit: parseInt(limit as string),
      userId: req.user?._id.toString()
    });

    res.json({
      success: true,
      query: q,
      totalResults: results.length,
      results: results.map(result => ({
        type: result.type,
        item: result.item,
        score: result.score,
        matches: result.matches
      }))
    });
  } catch (error) {
    logger.error('Global search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search suggestions
router.get('/suggestions', auth, async (req: AuthRequest, res) => {
  try {
    const { q, type = 'document' } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const suggestions = await searchService.getSearchSuggestions(
      q as string, 
      type as 'document' | 'student' | 'staff' | 'user'
    );

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    logger.error('Search suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Popular search terms
router.get('/popular', auth, async (req: AuthRequest, res) => {
  try {
    const popularTerms = await searchService.getPopularSearchTerms();

    res.json({
      success: true,
      popularTerms
    });
  } catch (error) {
    logger.error('Popular search terms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Advanced document search
router.post('/documents/advanced', auth, async (req: AuthRequest, res) => {
  try {
    const {
      query,
      category,
      subcategory,
      accessLevel,
      dateRange,
      tags,
      uploadedBy,
      limit = 50
    } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const results = await searchService.searchDocuments(query, {
      category,
      subcategory,
      accessLevel: accessLevel ? [accessLevel] : undefined,
      dateRange: dateRange ? {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end)
      } : undefined,
      tags,
      uploadedBy,
      limit
    });

    res.json({
      success: true,
      query,
      totalResults: results.length,
      results: results.map(result => ({
        document: result.item,
        score: result.score,
        matches: result.matches
      }))
    });
  } catch (error) {
    logger.error('Advanced document search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh search indexes
router.post('/refresh-indexes', auth, async (req: AuthRequest, res) => {
  try {
    // Only admins can refresh indexes
    if (req.user?.role !== 'admin' && req.user?.role !== 'system-admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await searchService.refreshIndexes();

    res.json({
      success: true,
      message: 'Search indexes refreshed successfully'
    });
  } catch (error) {
    logger.error('Refresh search indexes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;