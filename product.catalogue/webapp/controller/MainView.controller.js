sap.ui.define([
    "pc/product/catalogue/controller/BaseController",
    "pc/product/catalogue/service/ProductService",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], (BaseController, ProductService, JSONModel, MessageBox) => {
    "use strict";

    return BaseController.extend("pc.product.catalogue.controller.MainView", {
        onInit() {
            let oProductModel = new JSONModel({ items: [] });
            this.setModel(oProductModel, "products");
            this._loadProducts();
        },

        _loadProducts: async function ()
        {
            const oModel = this.getModel("products");
            this.getView().setBusy(true);

            try{
                let products = await ProductService.getAll();
                oModel.setProperty("/items", products);
            } catch (oError) {
                MessageBox.error(oError.message);
            } finally {
                this.getView().setBusy(false);
            }
        },

        onListItemPress: function (oEvent)
        {
            const oItem = oEvent.getSource();
            const oContext = oItem.getBindingContext("products");
            const oProduct = oContext.getObject();

            let sTitle = oProduct.name;
            let sIntro = oProduct.description;
            let sIcon = oProduct.image || "sap-icon://product";
            let sId = oProduct.id;
            let nPrice = oProduct.price;

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
                        ProductService.update(sId, {
                            price: parseFloat(newPrice)
                        }).then(updatedProduct => {
                            this.getModel("products").setProperty(oContext.getPath(),updatedProduct); //oItem.setNumber(`$${updatedProduct.price}`);
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
