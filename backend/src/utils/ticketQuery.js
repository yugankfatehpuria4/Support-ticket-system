const mongoose = require('mongoose');

const ALLOWED_SORTS = {
  '-createdAt': '-createdAt',
  createdAt: 'createdAt',
  '-updatedAt': '-updatedAt',
  updatedAt: 'updatedAt',
};

const buildTicketQuery = (query = {}, baseFilter = {}) => {
  const { status, priority, category, search, page = 1, limit = 10, sort = '-createdAt' } = query;
  const filter = { ...baseFilter };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  if (search && typeof search === 'string' && search.trim()) {
    const term = search.trim();
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const orClauses = [
      { title: { $regex: escaped, $options: 'i' } },
      { description: { $regex: escaped, $options: 'i' } },
      {
        $expr: {
          $regexMatch: {
            input: { $toString: '$_id' },
            regex: escaped,
            options: 'i',
          },
        },
      },
    ];

    if (mongoose.Types.ObjectId.isValid(term)) {
      orClauses.push({ _id: new mongoose.Types.ObjectId(term) });
    }

    filter.$or = orClauses;
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;
  const sortOrder = ALLOWED_SORTS[sort] || '-createdAt';

  return { filter, pageNum, limitNum, skip, sortOrder };
};

module.exports = { buildTicketQuery };
