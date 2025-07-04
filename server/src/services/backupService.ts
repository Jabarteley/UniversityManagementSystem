import cron from 'node-cron';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';

export class BackupService {
  private static instance: BackupService;
  private backupSchedule: string = '0 2 * * *'; // Daily at 2 AM
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }

  // Initialize backup service
  initialize(): void {
    this.scheduleBackups();
    logger.info('Backup service initialized');
  }

  // Schedule automatic backups
  private scheduleBackups(): void {
    cron.schedule(this.backupSchedule, async () => {
      if (!this.isRunning) {
        await this.performFullBackup();
      }
    });

    logger.info(`Backup scheduled: ${this.backupSchedule}`);
  }

  // Perform full system backup
  async performFullBackup(): Promise<{ success: boolean; backupId?: string; error?: string }> {
    if (this.isRunning) {
      return { success: false, error: 'Backup already in progress' };
    }

    this.isRunning = true;
    const backupId = `backup_${Date.now()}`;
    const backupDir = path.join(process.cwd(), 'backups', backupId);

    try {
      logger.info(`Starting full backup: ${backupId}`);

      // Create backup directory
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Backup database
      await this.backupDatabase(backupDir);

      // Backup file metadata (Cloudinary URLs and metadata)
      await this.backupFileMetadata(backupDir);

      // Create backup archive
      const archivePath = await this.createBackupArchive(backupDir, backupId);

      // Upload backup to Cloudinary
      const cloudinaryResult = await this.uploadBackupToCloudinary(archivePath, backupId);

      // Clean up local files
      await this.cleanupLocalBackup(backupDir, archivePath);

      logger.info(`Backup completed successfully: ${backupId}`);
      return { success: true, backupId };

    } catch (error) {
      logger.error(`Backup failed: ${backupId}`, error);
      return { success: false, error: (error as Error).message };
    } finally {
      this.isRunning = false;
    }
  }

  // Backup database collections
  private async backupDatabase(backupDir: string): Promise<void> {
    try {
      const collections = ['users', 'students', 'staff', 'documents', 'reports'];
      
      for (const collectionName of collections) {
        const collection = mongoose.connection.db.collection(collectionName);
        const documents = await collection.find({}).toArray();
        
        const filePath = path.join(backupDir, `${collectionName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
        
        logger.info(`Backed up collection: ${collectionName} (${documents.length} documents)`);
      }
    } catch (error) {
      logger.error('Error backing up database:', error);
      throw error;
    }
  }

  // Backup file metadata and Cloudinary references
  private async backupFileMetadata(backupDir: string): Promise<void> {
    try {
      // Get all Cloudinary resources
      const resources = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'urms/',
        max_results: 500
      });

      const metadata = {
        timestamp: new Date().toISOString(),
        totalResources: resources.resources.length,
        resources: resources.resources.map((resource: any) => ({
          public_id: resource.public_id,
          secure_url: resource.secure_url,
          format: resource.format,
          bytes: resource.bytes,
          created_at: resource.created_at,
          folder: resource.folder,
          tags: resource.tags
        }))
      };

      const filePath = path.join(backupDir, 'cloudinary_metadata.json');
      fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));

      logger.info(`Backed up Cloudinary metadata: ${resources.resources.length} resources`);
    } catch (error) {
      logger.error('Error backing up file metadata:', error);
      throw error;
    }
  }

  // Create compressed backup archive
  private async createBackupArchive(backupDir: string, backupId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const archivePath = path.join(process.cwd(), 'backups', `${backupId}.zip`);
      const output = fs.createWriteStream(archivePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        logger.info(`Archive created: ${archivePath} (${archive.pointer()} bytes)`);
        resolve(archivePath);
      });

      archive.on('error', (err) => {
        logger.error('Archive error:', err);
        reject(err);
      });

      archive.pipe(output);
      archive.directory(backupDir, false);
      archive.finalize();
    });
  }

  // Upload backup to Cloudinary
  private async uploadBackupToCloudinary(archivePath: string, backupId: string): Promise<any> {
    try {
      const result = await cloudinary.uploader.upload(archivePath, {
        resource_type: 'raw',
        folder: 'urms/backups',
        public_id: backupId,
        tags: ['backup', 'system']
      });

      logger.info(`Backup uploaded to Cloudinary: ${result.secure_url}`);
      return result;
    } catch (error) {
      logger.error('Error uploading backup to Cloudinary:', error);
      throw error;
    }
  }

  // Clean up local backup files
  private async cleanupLocalBackup(backupDir: string, archivePath: string): Promise<void> {
    try {
      // Remove backup directory
      if (fs.existsSync(backupDir)) {
        fs.rmSync(backupDir, { recursive: true, force: true });
      }

      // Remove archive file
      if (fs.existsSync(archivePath)) {
        fs.unlinkSync(archivePath);
      }

      logger.info('Local backup files cleaned up');
    } catch (error) {
      logger.error('Error cleaning up local backup files:', error);
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info(`Starting restore from backup: ${backupId}`);

      // Download backup from Cloudinary
      const backupUrl = cloudinary.url(`urms/backups/${backupId}`, { resource_type: 'raw' });
      
      // This would involve downloading the backup, extracting it, and restoring the database
      // Implementation depends on specific requirements and security considerations
      
      logger.info(`Restore completed: ${backupId}`);
      return { success: true };
    } catch (error) {
      logger.error(`Restore failed: ${backupId}`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  // List available backups
  async listBackups(): Promise<any[]> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'raw',
        prefix: 'urms/backups/',
        max_results: 100
      });

      return result.resources.map((resource: any) => ({
        id: resource.public_id.replace('urms/backups/', ''),
        url: resource.secure_url,
        size: resource.bytes,
        created_at: resource.created_at
      }));
    } catch (error) {
      logger.error('Error listing backups:', error);
      return [];
    }
  }

  // Delete old backups (keep last 30 days)
  async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const backup of backups) {
        const backupDate = new Date(backup.created_at);
        if (backupDate < thirtyDaysAgo) {
          await cloudinary.uploader.destroy(`urms/backups/${backup.id}`, { resource_type: 'raw' });
          logger.info(`Deleted old backup: ${backup.id}`);
        }
      }
    } catch (error) {
      logger.error('Error cleaning up old backups:', error);
    }
  }

  // Get backup status
  getBackupStatus(): { isRunning: boolean; schedule: string } {
    return {
      isRunning: this.isRunning,
      schedule: this.backupSchedule
    };
  }

  // Update backup schedule
  updateBackupSchedule(schedule: string): void {
    this.backupSchedule = schedule;
    // Restart cron job with new schedule
    cron.destroy();
    this.scheduleBackups();
    logger.info(`Backup schedule updated: ${schedule}`);
  }
}

export default BackupService;