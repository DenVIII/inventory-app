const pool = require("./pool");

async function getAllCategories() {
  const { rows } = await pool.query("SELECT category_name FROM category");
  return rows;
}

async function getAllCatalogue() {
  const { rows } = await pool.query(
    `
      SELECT name, quantity, measurment, price_rub, category_name, brand_name 
      FROM groceries 
      JOIN category ON groceries.category_id = category.id
      JOIN brand_grocery ON brand_grocery.grocery_id = groceries.id
      JOIN brand ON brand_grocery.brand_id = brand.id
      ORDER BY category_name, name;
    `
  );
  return rows;
}

/* async function getCatalogueBySearchParameters(queryParams) {
  
  if (!queryParams) {
    return;
  } 
  const queryText = ''

  const { rows } = await pool.query("SELECT $1 FROM");
} */

module.exports = {
  getAllCategories,
  getAllCatalogue,
};
