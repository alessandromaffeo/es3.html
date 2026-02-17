const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

// CREA post.json se non esiste
const filePath = path.join(__dirname, "post.json");
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, "{}");
}

// PAGINA /post
app.get("/post", (req, res) => {
  res.send(`
    <h1>Post</h1>
    <form method="POST" action="/post">
      <input type="text" name="titolo" placeholder="Titolo" required />
      <button type="submit">Salva</button>
    </form>
  `);
});

// SALVATAGGIO SU post.json
app.post("/post", (req, res) => {
  const newPost = {
    titolo: req.body.titolo
  };

  fs.writeFileSync(filePath, JSON.stringify(newPost, null, 2));

  res.send("Salvato su post.json");
});

app.listen(PORT, () => {
  console.log("Server avviato su http://localhost:3000/post");
});
