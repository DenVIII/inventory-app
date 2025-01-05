const pool = require("./pool");

async function getAllCategories() {
  const { rows } = await pool.query("SELECT category_name FROM category");
  return rows;
}

module.exports = {
  getAllCategories,
};
