import * as attachmentRepository from './attachmentRepository';
import { getDatabase } from './database';

// Mock the database module
jest.mock('./database');

const mockedGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

describe('attachmentRepository', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDb = {
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(),
      getAllAsync: jest.fn(),
    };

    mockedGetDatabase.mockResolvedValue(mockDb);
  });

  describe('addAttachment', () => {
    it('should insert a new attachment into database', async () => {
      const input = {
        taskId: '1',
        uri: 'file:///test/image.jpg',
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 12345,
      };

      await attachmentRepository.addAttachment(input);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO attachments'),
        expect.arrayContaining([
          expect.any(String), // id
          input.taskId,
          input.uri,
          input.fileName,
          input.mimeType,
          input.size,
          expect.any(String), // createdAt
        ])
      );
    });

    it('should return the created attachment with id and timestamp', async () => {
      const input = {
        taskId: '1',
        uri: 'file:///test/image.jpg',
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 12345,
      };

      const result = await attachmentRepository.addAttachment(input);

      expect(result).toMatchObject({
        taskId: input.taskId,
        uri: input.uri,
        fileName: input.fileName,
        mimeType: input.mimeType,
        size: input.size,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });
  });

  describe('getAttachmentsByTask', () => {
    it('should return attachments for a task', async () => {
      const mockRows = [
        {
          id: '1',
          taskId: '1',
          uri: 'file:///test/image1.jpg',
          fileName: 'image1.jpg',
          mimeType: 'image/jpeg',
          size: 1000,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          taskId: '1',
          uri: 'file:///test/image2.jpg',
          fileName: 'image2.jpg',
          mimeType: 'image/jpeg',
          size: 2000,
          createdAt: '2024-01-02T00:00:00.000Z',
        },
      ];

      mockDb.getAllAsync.mockResolvedValue(mockRows);

      const result = await attachmentRepository.getAttachmentsByTask('1');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM attachments WHERE taskId = ?'),
        ['1']
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        taskId: '1',
        uri: 'file:///test/image1.jpg',
      });
    });

    it('should return empty array when no attachments exist', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      const result = await attachmentRepository.getAttachmentsByTask('999');

      expect(result).toEqual([]);
    });

    it('should order attachments by createdAt descending', async () => {
      mockDb.getAllAsync.mockResolvedValue([]);

      await attachmentRepository.getAttachmentsByTask('1');

      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY createdAt DESC'),
        ['1']
      );
    });
  });

  describe('getAttachment', () => {
    it('should return attachment when found', async () => {
      const mockRow = {
        id: '1',
        taskId: '1',
        uri: 'file:///test/image.jpg',
        fileName: 'image.jpg',
        mimeType: 'image/jpeg',
        size: 12345,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      mockDb.getFirstAsync.mockResolvedValue(mockRow);

      const result = await attachmentRepository.getAttachment('1');

      expect(mockDb.getFirstAsync).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM attachments WHERE id = ?'),
        ['1']
      );
      expect(result).toEqual(mockRow);
    });

    it('should return null when attachment not found', async () => {
      mockDb.getFirstAsync.mockResolvedValue(null);

      const result = await attachmentRepository.getAttachment('999');

      expect(result).toBeNull();
    });
  });

  describe('removeAttachment', () => {
    it('should delete attachment by id', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 1 });

      const result = await attachmentRepository.removeAttachment('1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM attachments WHERE id = ?'),
        ['1']
      );
      expect(result).toBe(true);
    });

    it('should return false if attachment not found', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      const result = await attachmentRepository.removeAttachment('999');

      expect(result).toBe(false);
    });
  });

  describe('removeAttachmentsByTask', () => {
    it('should delete all attachments for a task', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 2 });

      const result = await attachmentRepository.removeAttachmentsByTask('1');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM attachments WHERE taskId = ?'),
        ['1']
      );
      expect(result).toBe(2);
    });

    it('should return 0 if no attachments exist', async () => {
      mockDb.runAsync.mockResolvedValue({ changes: 0 });

      const result = await attachmentRepository.removeAttachmentsByTask('999');

      expect(result).toBe(0);
    });
  });
});
