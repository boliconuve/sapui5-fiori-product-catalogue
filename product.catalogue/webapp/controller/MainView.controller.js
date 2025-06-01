sap.ui.define([
    "pc/product/catalogue/controller/BaseController"
], (BaseController) => {
    "use strict";

    return BaseController.extend("pc.product.catalogue.controller.MainView", {
        onInit() {
            this.onInitProducts();
        },

        onListItemPress: function (oEvent) {
            // Get the selected item
            const oItem = oEvent.getSource();
            const sTitle = oItem.getTitle();
            const sNumber = oItem.getNumber();
            const sIntro = oItem.getIntro();
            const sIcon = oItem.getIcon();
            const sId = oItem.getId();

            // Extrae el valor numérico del precio
            const nPrice = parseFloat(sNumber.replace(/[^0-9.]/g, ""));

            // Input para editar el precio
            const oInput = new sap.m.Input({
                value: nPrice,
                type: "Number"
            });

            // Dialog para mostrar y editar detalles
            const oDialog = new sap.m.Dialog({
                title: sTitle,
                content: [
                    new sap.m.Image({ src: sIcon }),
                    new sap.m.Label({ text: "Precio:" }),
                    oInput,
                    new sap.m.Text({ text: `Descripción: ${sIntro}` })
                ],
                beginButton: new sap.m.Button({
                    text: "Guardar",
                    press: () => {
                        const newPrice = oInput.getValue();
                        // Llama a la API para actualizar el precio
                        fetch("http://localhost:3000/products/"+sId, {
                            method: "PUT",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({ price: parseFloat(newPrice) })
                        })
                        .then(res => {
                            if (!res.ok) throw new Error("No se pudo actualizar el producto");
                            return res.json();
                        }).then(updatedProduct => {
                            oItem.setNumber(`$${updatedProduct.price}`);
                            sap.m.MessageToast.show("Precio actualizado correctamente");
                            oDialog.close();
                        }
                        )
                        .catch(err => {
                            sap.m.MessageToast.show("Error al actualizar: " + err.message);
                        });
                    }
                }),
                endButton: new sap.m.Button({
                    text: "Cerrar",
                    press: function () {
                        oDialog.close();
                    }
                })
            });

            // Open the dialog
            oDialog.open();
        }

    });
});
