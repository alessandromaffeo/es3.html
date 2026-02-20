const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

// --- CONFIGURAZIONE AMBIENTE ---
// Crea le cartelle necessarie se non esistono
const dirs = ["./views", "./public/uploads"];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Database JSON iniziale
const filePath = path.join(__dirname, "post.json");
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify([]));

// Scrittura automatica dei file EJS per lo Step 2
const views = {
    "post.ejs": `
        <!DOCTYPE html><html lang="it"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"><title>Nuovo Post</title></head>
        <body class="container"><h1>Aggiungi Post</h1><form action="/post" method="POST" enctype="multipart/form-data">
        <input type="text" name="titolo" placeholder="Titolo" required><textarea name="descrizione" placeholder="Descrizione"></textarea>
        <input type="text" name="info" placeholder="Info extra"><input type="file" name="immagine" accept="image/*" required><button type="submit">Pubblica</button></form>
        <a href="/gallery">Vai alla Gallery</a></body></html>`,
    "gallery.ejs": `
        <!DOCTYPE html><html lang="it"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"><title>Gallery</title></head>
        <body class="container"><nav><ul><li><strong>Gallery</strong></li></ul><ul><li><a href="/post">Aggiungi</a></li></ul></nav>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
        <% posts.forEach(post => { %><article><a href="/post/<%= post.id %>"><img src="<%= post.immagine %>" style="width:100%; height:150px; object-fit:cover;">
        <footer style="text-align:center"><%= post.titolo %></footer></a></article><% }) %></div></body></html>`,
    "detail.ejs": `
        <!DOCTYPE html><html lang="it"><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@1/css/pico.min.css"><title><%= post.titolo %></title></head>
        <body class="container"><article><header><h2><%= post.titolo %></h2></header><img src="<%= post.immagine %>" style="max-width:100%"><p><%= post.descrizione %></p>
        <p><small><%= post.info %></small></p><footer><a href="/gallery">Torna alla gallery</a></footer></article></body></html>`
};

Object.entries(views).forEach(([name, content]) => {
    fs.writeFileSync(path.join("./views", name), content.trim());
});

// --- LOGICA SERVER ---
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./public/uploads"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get("/post", (req, res) => res.render("post"));

app.post("/post", upload.single("immagine"), (req, res) => {
    const posts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const newPost = {
        id: Date.now(),
        titolo: req.body.titolo,
        descrizione: req.body.descrizione,
        info: req.body.info,
        immagine: req.file ? `/uploads/\${req.file.filename}` : null
    };
    posts.push(newPost);
    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));
    res.redirect("/gallery");
});

app.get("/gallery", (req, res) => {
    const posts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    res.render("gallery", { posts });
});

app.get("/post/:id", (req, res) => {
    const posts = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const post = posts.find(p => p.id == req.params.id);
    post ? res.render("detail", { post }) : res.status(404).send("Post non trovato");
});

app.listen(PORT, () => console.log(`Online: http://localhost:\${PORT}/post`));
