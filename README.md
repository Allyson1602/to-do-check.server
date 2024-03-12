
# To Do Check - Server

Backend do app To Do Check.
Atualmente rodando na vercel (https://to-do-check-server.vercel.app/)
Variáveis de ambiente foram enviadas para o HR


## Documentação da API

#### Retorna todas as categorias

```http
  GET /category
```

#### Cria uma categoria
```http
  POST /category
```
| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `title` | `string` | **Obrigatório**. O título da categoria |
| `iconname` | `string` | **Obrigatório**. O ícone da categoria |

#### Atualiza uma categoria
```http
  PUT /category/${id}
```
| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `title` | `string` | **Obrigatório**. O título da categoria |
| `iconname` | `string` | **Obrigatório**. O ícone da categoria |
| `isfavorite` | `boolean` | **Obrigatório**. O status se é favorita |

#### Deleta uma categoria
```http
  DELETE /category/${id}
```


#### Cria uma tarefa
```http
  POST /to-do
```
| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `categoryid` | `string` | **Obrigatório**. O id da categoria |
| `title` | `string` | **Obrigatório**. O título da tarefa |
| `description` | `string` | **Obrigatório**. A descrição da tarefa |

#### Atualiza uma tarefa
```http
  PUT /to-do/${id}
```
| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `title` | `string` | **Obrigatório**. O título da tarefa |
| `description` | `string` | **Obrigatório**. A descrição da tarefa |
| `isdone` | `boolean` | **Obrigatório**. O status se está concluída |
| `isimportant` | `boolean` | **Obrigatório**. O status se é importante |

#### Deleta uma tarefa
```http
  DELETE /to-do/${id}
```



## Instalação

```bash
  npm install
  npm run start
```
    
