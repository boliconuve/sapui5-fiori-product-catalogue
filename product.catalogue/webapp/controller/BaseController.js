sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";
    return Controller.extend("pc.product.catalogue.controller.BaseController", {

        // Función que devuelven la localización/traducciones
        getResourceBundle: function ()
        {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
       
        getModel: function (sName)
        {
            return this.getView().getModel(sName);
        },

        setModel: function (oModel, sName)
        {
            this.getView().setModel(oModel, sName);
            return this;
        }
    });
});