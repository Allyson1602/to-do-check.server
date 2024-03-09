const express = require("express");
const dotenv = require("dotenv");
var cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(cors());

app.get("/category", (req, res) => {
  res.json([
    {
      id: 5,
      iconName: "building",
      isFavorite: true,
      title: "Criar - teste",
      todoItems: [
        {
          id: 1,
          description: "Coisas - teste",
          title: "Tarefas - teste",
          isImportant: true,
          isDone: false,
        },
        {
          id: 2,
          description: "Outras Coisas - teste",
          title: "Outras Tarefas - teste",
          isImportant: false,
          isDone: false,
        },
      ],
    },
    {
      id: 8,
      iconName: "hamburguer",
      isFavorite: false,
      title: "Outro - teste",
      todoItems: [
        {
          id: 3,
          description: "Mais Coisas - teste",
          title: "Mais Tarefas - teste",
          isImportant: true,
          isDone: false,
        },
        {
          id: 4,
          description: "Mais Outras Coisas - teste",
          title: "Mais Outras Tarefas - teste",
          isImportant: true,
          isDone: false,
        },
      ],
    },
  ]);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
