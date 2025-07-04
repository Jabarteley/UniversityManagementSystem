import express from 'express';
import { auth, authorize, AuthRequest } from '../middleware/auth.js';
import BackupService from '../services/backupService.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const backupService = BackupService.getInstance();

// Get backup status
router.get('/status', auth, authorize('admin', 'system-admin'), async (req: AuthRequest, res) => {
  try {
    const status = backupService.getBackupStatus();
    res.json({
      success: true,
      status
    });
  } catch (error) {
    logger.error('Get backup status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Trigger manual backup
router.post('/create', auth, authorize('admin', 'system-admin'), async (req: AuthRequest, res) => {
  try {
    const result = await backupService.performFullBackup();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Backup completed successfully',
        backupId: result.backupId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Backup failed',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Create backup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// List available backups
router.get('/list', auth, authorize('admin', 'system-admin'), async (req: AuthRequest, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json({
      success: true,
      backups
    });
  } catch (error) {
    logger.error('List backups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore from backup
router.post('/restore/:backupId', auth, authorize('system-admin'), async (req: AuthRequest, res) => {
  try {
    const { backupId } = req.params;
    
    const result = await backupService.restoreFromBackup(backupId);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Restore completed successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Restore failed',
        error: result.error
      });
    }
  } catch (error) {
    logger.error('Restore backup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update backup schedule
router.put('/schedule', auth, authorize('system-admin'), async (req: AuthRequest, res) => {
  try {
    const { schedule } = req.body;
    
    if (!schedule) {
      return res.status(400).json({ message: 'Backup schedule is required' });
    }
    
    backupService.updateBackupSchedule(schedule);
    
    res.json({
      success: true,
      message: 'Backup schedule updated successfully',
      schedule
    });
  } catch (error) {
    logger.error('Update backup schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cleanup old backups
router.delete('/cleanup', auth, authorize('admin', 'system-admin'), async (req: AuthRequest, res) => {
  try {
    await backupService.cleanupOldBackups();
    
    res.json({
      success: true,
      message: 'Old backups cleaned up successfully'
    });
  } catch (error) {
    logger.error('Cleanup backups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;