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

    const queryValue = requestQueries[key].toLowerCase();
    if (Array.isArray(queryValue)) {
      result += `LOWER(${key}) IN (\'${queryValue.join("','")}\')`; // Обрабатываем массив запросов по одному столбцу
    } else {
      result += `LOWER(${key}) LIKE (\'${queryValue}\%')`;
    }
  });

  return result;
}

/* async function insertNewGrocery(grocery) {
  await pool.query(
    "INSERT INTO category (category_name) SELECT $1 WHERE NOT EXISTS (SELECT category_name FROM category WHERE category_name=$1);",
    [grocery.categoryName]
  );

  await pool.query(
    "INSERT INTO brand (brand_name) SELECT $1 WHERE NOT EXISTS (SELECT brand_name FROM brand WHERE brand_name=$1);",
    [grocery.brandName]
  );

  await pool.query(
    `
    INSERT INTO groceries (name, quantity, measurment, price_rub, category_id) 
    SELECT 
      ${grocery.name}, 
      ${grocery.quantity}, 
      ${grocery.measurment}, 
      ${grocery.priceRub},
      c.id
      FROM category c
      WHERE category_name = ${grocery.categoryName};
    `
  );

  await pool.query(
    `
      INSERT INTO brand_grocery (brand_id, grocery_id)
      SELECT
        b.id,
        (SELECT g.id FROM groceries g ORDER BY g.id DESC LIMIT 1)
        FROM brand b
        WHERE brand_name = ${grocery.brandName};
    `
  );
} */

/* async function insertNewGrocery(grocery) {
  await pool.query(
    "INSERT INTO category (category_name) SELECT 'Бакалея' WHERE NOT EXISTS (SELECT category_name FROM category WHERE category_name='Бакалея');",
    ["Бакалея"]
  );

  await pool.query(
    "INSERT INTO brand (brand_name) SELECT 'Лукошко' WHERE NOT EXISTS (SELECT brand_name FROM brand WHERE brand_name='Лукошко');",
    ["Лукошко"]
  );

  await pool.query(
    `
    INSERT INTO groceries (name, quantity, measurment, price_rub, category_id) 
    SELECT 
      'Рис', 
      22, 
      'кг', 
      97,
      c.id
      FROM category c
      WHERE category_name = 'Бакалея';
    `
  );

  await pool.query(
    `
      INSERT INTO brand_grocery (brand_id, grocery_id)
      SELECT
        b.id,
        (SELECT g.id FROM groceries g ORDER BY g.id DESC LIMIT 1)
        FROM brand b
        WHERE brand_name = 'Лукошко';
    `
  );
} */

async function insertNewGrocery(grocery) {
  // Вставляем категорию, если она еще не существует
  await pool.query(
    `INSERT INTO category (category_name) SELECT $1::VARCHAR(100) WHERE NOT EXISTS (SELECT category_name FROM category WHERE category_name=$1::VARCHAR(100));`,
    [grocery.categoryName]
  );

  // Вставляем бренд, если он еще не существует
  await pool.query(
    `INSERT INTO brand (brand_name) SELECT $1::VARCHAR(100) WHERE NOT EXISTS (SELECT brand_name FROM brand WHERE brand_name=$1::VARCHAR(100));`,
    [grocery.brandName]
  );

  // Вставляем товар
  await pool.query(
    `INSERT INTO groceries (name, quantity, measurment, price_rub, category_id) 
    SELECT 
      $1, 
      $2, 
      $3, 
      $4,
      c.id
    FROM category c
    WHERE c.category_name = $5
    RETURNING id;`,
    [
      grocery.name,
      grocery.quantity,
      grocery.measurment,
      grocery.priceRub,
      grocery.categoryName,
    ]
  );

  // Вставляем связь с последним товаром для бренда
  await pool.query(
    `INSERT INTO brand_grocery (brand_id, grocery_id) 
    SELECT 
      b.id, 
      (SELECT MAX(g.id) FROM groceries g)
    FROM brand b
    WHERE b.brand_name = $1;`,
    [grocery.brandName]
  );
}

module.exports = {
  getAllCategories,
  getAllCatalogue,
  getCatalogueBySearchQuery,
  insertNewGrocery,
};
