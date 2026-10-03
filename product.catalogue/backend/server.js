const path = require("path");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const { randomUUID } = require("node:crypto");

const PROJECT_ROOT = path.resolve(__dirname, "..");

require("dotenv").config({
    path: path.join(PROJECT_ROOT, ".env")
});

const app = express();

const PORT = Number(process.env.BACKEND_PORT ?? "4000");

const DB_FILE = path.resolve(
    PROJECT_ROOT,
    process.env.DB_FILE || "backend/data/products.json"
);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error(
        "Configuración inválida: PORT debe ser un entero entre 1 y 65535."
    );
}

if (!fs.existsSync(DB_FILE)) {
    throw new Error(
        `No se encuentra el archivo de productos: ${DB_FILE}`
    );
}

app.use(cors());
app.use(express.json());


function readData() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function validateProductPayload(body, partial = false) {
    const fail = error => ({ error });

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return fail("El cuerpo debe ser un objeto JSON.");
    }

    const allowed = ["name", "description", "price", "image"];
    const keys = Object.keys(body);

    if (keys.some(key => !allowed.includes(key))) {
        return fail("Solo se permiten name, description, price e image.");
    }

    if (partial && keys.length === 0) {
        return fail("Debes enviar algún campo para actualizar.");
    }

    if ((!partial || Object.hasOwn(body, "name")) &&
        (typeof body.name !== "string" || body.name.trim() === "")) {
        return fail("El nombre es obligatorio y debe ser un texto.");
    }

    if ((!partial || Object.hasOwn(body, "price")) &&
        (!Number.isFinite(body.price) || body.price < 0)) {
        return fail("El precio debe ser un número mayor o igual que cero.");
    }

    for (const field of ["description", "image"]) {
        if (Object.hasOwn(body, field) && typeof body[field] !== "string") {
            return fail("El campo " + field + " debe ser un texto.");
        }
    }

    const values = {};
    for (const key of keys) {
        values[key] = typeof body[key] === "string"
            ? body[key].trim()
            : body[key];
    }

    return { values, error: null };
}

// GET /products → Devuelve todos los productos
app.get("/products", (req, res) => {
  res.json(readData());
});

// GET /products/:id → Devuelve un producto por ID
app.get("/products/:id", (req, res) => {
  const id = req.params.id; 
  const products = readData();
  const product = products.find(p => String(p.id) === id);
  if (!product) {
    return res.status(404).send("Producto no encontrado");
  }
  res.json(product);
});

// POST /products → Crea un nuevo producto
app.post("/products", (req, res) => {
    const validation = validateProductPayload(req.body);

    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    const products = readData();
    const newProduct = {
        description: "",
        ...validation.values,
        id: "product-" + randomUUID()
    };

    products.push(newProduct);
    writeData(products);
    res.status(201).json(newProduct);
});

// PUT /products/:id → Actualiza
app.put("/products/:id", (req, res) => {
    const validation = validateProductPayload(req.body, true);

    if (validation.error) {
        return res.status(400).json({ error: validation.error });
    }

    const products = readData();
    const index = products.findIndex(p => String(p.id) === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: "Producto no encontrado." });
    }

    products[index] = {
        ...products[index],
        ...validation.values,
        id: products[index].id
    };

    writeData(products);
    res.json(products[index]);
});

// DELETE /products/:id → Elimina
app.delete("/products/:id", (req, res) => {
  const id = req.params.id;
  let products = readData();
  // DELETE /products/:id
  const filtered = products.filter(p => String(p.id) !== id);
  if (filtered.length === products.length) return res.status(404).send("No se encontró el producto");
  
  writeData(filtered);
  res.status(204).send();
});

// LISTEN PORT
app.listen(PORT, () => {
  console.log(`✅ Backend del catálogo corriendo en http://localhost:${PORT}`);
});
