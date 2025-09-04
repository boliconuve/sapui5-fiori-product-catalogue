import React, { useEffect, useState } from "react";

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  function fetchProducts() {
    fetch("http://localhost:3000/products")
      .then((res) => res.json())
      .then(setProducts);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      fetch(`http://localhost:3000/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then(() => {
        setEditingId(null);
        setForm({ name: "", price: "" });
        fetchProducts();
      });
    } else {
      fetch("http://localhost:3000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then(() => {
        setForm({ name: "", price: "" });
        fetchProducts();
      });
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);
    setForm({ name: product.name, price: product.price });
  }

  function handleDelete(id) {
    fetch(`http://localhost:3000/products/${id}`, { method: "DELETE" }).then(fetchProducts);
  }

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Catálogo de Productos</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
        <input
          name="name"
          placeholder="Nombre"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="price"
          placeholder="Precio"
          value={form.price}
          onChange={handleChange}
          required
          type="number"
          min="0"
          step="0.01"
        />
        <button type="submit">{editingId ? "Actualizar" : "Agregar"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", price: "" });
            }}
          >
            Cancelar
          </button>
        )}
      </form>
      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.price}</td>
              <td>
                <button onClick={() => handleEdit(p)}>Editar</button>
                <button onClick={() => handleDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;