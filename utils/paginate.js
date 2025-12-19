const { Op } = require("sequelize");

async function paginate(model, queryParams, searchFields = []) {
  let { page, limit, sort, order, search } = queryParams;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 2;
  const offset = (page - 1) * limit;

  sort = sort || "createdAt";
  order = order || "DESC";

  const where = {};

  // 🔍 Filtering
  if (search && searchFields.length > 0) {
    where[Op.or] = searchFields.map((field) => ({
      [field]: { [Op.iLike]: `%${search}%` },
    }));
  }

  const { rows, count } = await model.findAndCountAll({
    where,
    limit,
    offset,
    order: [[sort, order]],
  });

  const totalPages = Math.ceil(count / limit);

  return {
    data: rows,
    meta: {
      total: count,
      page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },
  };
}

module.exports = paginate;
