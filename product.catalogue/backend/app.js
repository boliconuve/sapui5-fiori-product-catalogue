const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DB_FILE = './data/products.json';

function readData() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// GET /products → Devuelve todos los productos
app.get("/products", (req, res) => {
  res.json(readData());
});

// GET /products/:id → Devuelve un producto por ID
app.get("/products/:id", (req, res) => {
  const id = req.params.id; 
  const products = readData();
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).send("Producto no encontrado");
  }
  res.json(product);
});

// POST /products → Crea un nuevo producto
app.post("/products", (req, res) => {
  const products = readData();
  const newProduct = { ...req.body, id: Date.now() };
  products.push(newProduct);
  writeData(products);
  res.status(201).json(newProduct);
});

// PUT /products/:id → Actualiza
app.put("/products/:id", (req, res) => {
  const id = req.params.id;
  let products = readData();

  const index = products.findIndex(p => p.id === id);
  if (index === -1) return res.status(404).send("Producto no encontrado");

  products[index] = { ...products[index], ...req.body };
  writeData(products);
  res.json(products[index]);
});

// DELETE /products/:id → Elimina
app.delete("/products/:id", (req, res) => {
  const id = req.params.id;
  let products = readData();
  const filtered = products.filter(p => p.id !== id);
  if (filtered.length === products.length) return res.status(404).send("No se encontró el producto");
  
  writeData(filtered);
  res.status(204).send();
});

// LISTEN PORT
app.listen(PORT, () => {
  console.log(`✅ Backend del catálogo corriendo en http://localhost:${PORT}`);
});
