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

async function getCatalogueBySearchQuery(queryParams) {
  const queryText = `
      SELECT name, quantity, measurment, price_rub, category_name, brand_name 
      FROM groceries 
      JOIN category ON groceries.category_id = category.id
      JOIN brand_grocery ON brand_grocery.grocery_id = groceries.id
      JOIN brand ON brand_grocery.brand_id = brand.id
      WHERE ${createDatabaseQueryFromRequest(queryParams)}
      ORDER BY category_name, name;
  `;
  console.log(queryText);
  const { rows } = await pool.query(queryText);

  return rows;
}

function createDatabaseQueryFromRequest(requestQueries) {
  let result = "";
  const keys = Object.keys(requestQueries); // Создаем массив ключей-столбцов по которым мы будем фильтровать значения

  keys.forEach((key) => {
    if (result != "") result += " AND "; // Проверяем был ли уже добавлен параметр запроса и добавляем AND в конец строки, если результат не пустой

    const queryValue = requestQueries[key];
    if (Array.isArray(queryValue)) {
      result += `LOWER(${key}) IN (\'${queryValue.join("','")}\')`; // Обрабатываем массив запросов по одному столбцу
    } else {
      result += `LOWER(${key}) = LOWER(\'${queryValue}\')`;
    }
  });

  return result;
}

module.exports = {
  getAllCategories,
  getAllCatalogue,
  getCatalogueBySearchQuery,
};
