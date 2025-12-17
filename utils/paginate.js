const { Op } = require("sequelize");

async function paginate(model, queryParams, searchFields = []) {
  let { page, limit, sort, order, search } = queryParams;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 5;
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

// // utils/paginate.js
// const { Sequelize } = require("sequelize");

// async function paginate(model, queryParams, searchFields = []) {
//   let { page, limit, sort, order, search } = queryParams;

//   page = parseInt(page) || 1; // default page = 1
//   limit = parseInt(limit) || 2; // default limit = 10
//   const offset = (page - 1) * limit;
//   sort = sort || "createdAt"; // default sort column
//   order = order || "DESC"; // default order

//   // Build where condition for search
//   const where = {};
//   if (search && searchFields.length > 0) {
//     const { Op } = Sequelize;
//     where[Op.or] = searchFields.map((field) => ({
//       [field]: { [Op.iLike]: `%${search}%` },
//     }));
//   }

//   // Fetch data with count
//   const { rows, count } = await model.findAndCountAll({
//     where,
//     limit,
//     offset,
//     order: [[sort, order]],
//   });

//   const totalPages = Math.ceil(count / limit);

//   return {
//     data: rows,
//     meta: {
//       total: count,
//       page,
//       totalPages,
//       nextPage: page < totalPages ? page + 1 : null,
//       prevPage: page > 1 ? page - 1 : null,
//     },
//   };
// }

// module.exports = paginate;
