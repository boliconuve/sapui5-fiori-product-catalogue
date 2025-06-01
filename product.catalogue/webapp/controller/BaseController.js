sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";
    return Controller.extend("pc.product.catalogue.controller.BaseController", {
        // Puedes agregar aquí métodos comunes para todos los controladores
        onInitProducts: function() {
            // Initialize the product list
            fetch("http://localhost:3000/products", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            // Fetch products from the backend
            .then(res => {
                if (!res.ok) {
                    throw new Error("Network response was not ok");
                }
                return res.json(); // aquí parseamos la respuesta como JSON solo una vez
            })
            // Process the products and add them to the UI
            .then(products => {
                const oVBox = this.byId("productList");
                products.forEach(p => {
                    oVBox.addItem(new sap.m.ObjectListItem({
                        id: p.id,
                        title: p.name,
                        number: `$${p.price}`,
                        numberUnit: "USD",
                        press: this.onListItemPress.bind(this),
                        intro: p.description,
                        icon: p.image ? p.image : "sap-icon://file",
                        type: "Active"
                    }));
                });
            })
            // Handle any errors that occur during the fetch
            .catch(err => {
                console.error("Error al cargar productos:", err.message);
            });

        },
    });
});