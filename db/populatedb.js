#! /usr/bin/env node

const { Client } = require("pg");
require("dotenv").config();

const SQL = `
    CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        category_name VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS brand (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        brand_name VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS groceries (
        id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        name VARCHAR(100) NOT NULL,
        quantity INT NOT NULL DEFAULT 0,
        measurment VARCHAR(100) NOT NULL DEFAULT 'шт.',
        price_rub INT NOT NULL,
        category_id INT REFERENCES category(id)
    );

    CREATE TABLE IF NOT EXISTS brand_grocery (
        brand_id INT REFERENCES brand(id),
        grocery_id INT REFERENCES groceries(id)
    );

    INSERT INTO category (category_name) 
    VALUES
        ('Молочная продукция'),
        ('Овощи'),
        ('Фрукты'),
        ('Морепродукты'),
        ('Мясо'),
        ('Бакалея'),
        ('Напитки'),
        ('Хлебобулочные изделия');

    INSERT INTO brand (brand_name) 
    VALUES
        ('Ивановна'),
        ('Лукошко'),
        ('Королевский шампур'),
        ('Морелов'),
        ('Мяу-у-усов'),
        ('ЭкоФерма'),
        ('Бодрый День');

    INSERT INTO groceries (name, quantity, measurment, price_rub, category_id) 
    VALUES
        ('Молоко', 4, 'л', 94, 1),
        ('Сыр', 2, 'кг', 754, 1),
        ('Йогурт', 6, 'шт.', 56, 1),

        ('Помидоры', 10, 'кг', 200, 2),
        ('Яблоки', 5, 'кг', 120, 3),
        ('Креветки', 2, 'кг', 800, 4),

        ('Говядина', 3, 'кг', 650, 5),
        ('Кефир', 2, 'л', 85, 1),
        ('Огурцы', 8, 'кг', 150, 2),

        ('Апельсины', 3, 'кг', 250, 3),
        ('Лосось', 1.5, 'кг', 1200, 4),
        ('Свинина', 2.5, 'кг', 500, 5),

        ('Гречка', 1, 'кг', 80, 6),
        ('Сок', 10, 'л', 100, 7),
        ('Хлеб', 5, 'шт.', 50, 8);

    INSERT INTO brand_grocery (brand_id, grocery_id) 
    VALUES
        (1, 1),
        (1, 2),
        (1, 3),

        (2, 4),
        (2, 5),
        (2, 9),
        (2, 10),
        (2, 13),
        (2, 14),
        (2, 15),

        (3, 7),
        (3, 12),

        (4, 6),
        (4, 11),

        (5, 7),
        (5, 12),

        (6, 4),
        (6, 5),
        (6, 9),
        (6, 10),
        (6, 7),
        (6, 12),

        (7, 14);
`;

const connectionString = process.env.POSTGRES_CONNECTION_STRING;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString,
  });
  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
