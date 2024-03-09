const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const db = require("./database");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT;

app.post("/category", (req, res) => {
  const { iconName, title } = req.body;
  const isFavorite = false;
  const todoItems = [];

  if (typeof iconName !== "string" || typeof title !== "string") {
    res.status(400).send("Dados inválidos fornecidos");
    return;
  }

  const query = `INSERT INTO category (iconName, title) VALUES (?, ?)`;

  db.run(query, [iconName, title], function (err) {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao criar a categoria");
      return;
    }

    res
      .status(201)
      .json({ id: this.lastID, iconName, title, isFavorite, todoItems });
  });
});

app.get("/category", async (req, res) => {
  db.all(`SELECT * FROM category`, [], (err, categories) => {
    if (err) {
      console.error(err.message);
      res.status(500).send("Erro ao buscar categorias");
      return;
    }

    let categoriesProcessed = 0;

    if (categories.length === 0) {
      res.json([]);
    } else {
      categories.forEach((category, index, array) => {
        db.all(
          `SELECT * FROM to_do WHERE categoryId = ?`,
          [category.id],
          (err, items) => {
            if (err) {
              console.error(err.message);
              res
                .status(500)
                .send("Erro ao buscar to_do para a categoria: " + category.id);
              return;
            }

            array[index].todoItems = items;

            categoriesProcessed++;
            if (categoriesProcessed === array.length) {
              res.json(categories);
            }
          }
        );
      });
    }
  });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
