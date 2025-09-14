import joi from 'joi';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { createNotice, deleteNoticeById } from '../db/notice.db.js';
import { client, getAllNoticesFromCache } from '../db/redis.db.js';
import { cacheNotices } from '../src/noticeplo.js';

export const noticeSchema = joi.object({
  author: joi.number().integer().min(1).max(1000).required(),
  content: joi.string().min(1).max(1000).required(),
  type: joi.string().valid('info','warning','alert','general').default('general'),
  is_public: joi.boolean().default(true),
expires_at: joi.date().greater('now').optional().allow(null)
});

export const createNoticeController = asyncHandler(async (req, res) => {
  const data = req.body;
  const { error } = noticeSchema.validate(data);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const notice = await createNotice(data);
    // Cache the created notice for quick public reads
    cacheNotices();
    return res.status(201).json(notice);
  } catch (e) {
    console.error('Failed to cache new notice:', e);
  }
  
});

export const getCacheNoticesController = asyncHandler(async (req, res) => {
  try {
    const notices = await getAllNoticesFromCache();
    return res.status(200).json(notices);
  } catch (error) {
    console.error('Error fetching cached notices:', error);
    return res.status(500).json({ error: 'Failed to fetch notices' });
  }
});

export const deleteNoticeController = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid notice id' });
  try {
    await deleteNoticeById(id);
   cacheNotices();
    try { await client.del(`notice_${id}`); } catch(e){ console.error('Failed to remove notice from cache', e); }
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting notice:', error);
    return res.status(500).json({ error: 'Failed to delete notice' });
  }
});
