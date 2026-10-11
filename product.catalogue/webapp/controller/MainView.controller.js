sap.ui.define([
    "pc/product/catalogue/controller/BaseController",
    "pc/product/catalogue/service/ProductService",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/ValueState",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Text",
    "sap/m/Input",
    "sap/m/Label",
    "sap/m/Button",
    "sap/m/HBox",
    "sap/m/VBox"
], (BaseController, ProductService, JSONModel, ValueState, MessageToast, MessageBox, Dialog, Text, Input, Label, Button, HBox, VBox) => {
    "use strict";
    var oResourceBundle;

    return BaseController.extend("pc.product.catalogue.controller.MainView", {
        onInit() {
            let oProductModel = new JSONModel({ items: [] });
            this.setModel(oProductModel, "products");
            this._loadProducts();
            oResourceBundle=this.getResourceBundle();
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
            const oInput = new Input({ value: nPrice, width: "50%" });
            const oLabel = new Label({ text: "Precio: "});
            const oDescription = new Text({ text: `Descripción: ${sIntro}`}); 

            const oHBox = new HBox({
                items: [
                    oLabel,
                    oInput
                ]
            });

            const oVBox = new VBox({
                items: [
                    oHBox,
                    oDescription
                ]
            });

            // Dialog para mostrar y editar detalles
            const oDialog = new Dialog({
                title: sTitle,
                content: [
                    new sap.m.Image({ src: sIcon }),
                    oVBox
                ],
                beginButton: new Button({
                    text: "Guardar",
                    press: () => {

                        const isNumber = Number(oInput.getValue()); // isNumber
                        const isNaN = Number.isNaN(isNumber); // isNan
                        const isZero = (oInput.getValue() < 0) ? true : false;

                        const numberFinity = isFinite(isNumber);

                        // En el caso que el precio sea incorrecto
                        if(isZero || !isNumber || isNaN || !numberFinity)
                        {
                            oInput.setValueState(ValueState.Error);
                            oInput.setValueStateText(oResourceBundle.getText("mainView.dialog.errorMessage"));
                            MessageToast.show(oResourceBundle.getText("mainView.dialog.errorMessage"));
                            return;
                        }

                        const newPrice = parseFloat(oInput.getValue()); // new price to update

                        // Llama a la API para actualizar el precio
                        ProductService.update(sId, {
                            price: parseFloat(newPrice)
                        }).then(updatedProduct => {
                            this.getModel("products").setProperty(oContext.getPath(),updatedProduct);
                            MessageToast.show(oResourceBundle.getText("mainView.dialog.updatePriceMessage"));
                            oDialog.close();
                        }).catch(err => {
                            MessageToast.show(oResourceBundle.getText("mainView.dialog.errorUpdateServiceMessage") + err.message);
                        }).finally(() => {
                            oInput.setValueState(ValueState.None);
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
