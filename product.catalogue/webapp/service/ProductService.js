sap.ui.define([], 
function () {
    "use strict";

    const BASE_PATH = "/products";

    
    async function request(route, options = {})
    {
        let response;

        try {
            response = await fetch(route, {
                ...options,
                headers: {
                    Accept: "application/json",
                    ...(options.body != undefined ? {"Content-Type":"application/json"} : {})
                }
            });
        } catch(error) {
            if(error.name === "AbortError"){
                throw error;
            }

            throw new Error("No se pudo conectar con el servidor", {
                cause: error
            });
        }

        if(!response.ok){
            const body = await response.json().catch(() => ({}));

            const message = typeof body?.error == "string" ? body.error : "La petición ha fallado (HTTP " + response.status + ").";

            throw new Error(message);
            
        }

        return response.json();
    }

    return {
        getAll: function (signal) {
            return request(BASE_PATH, {
                signal: signal
            });
        },

        update: function (id, changes){
            return request(BASE_PATH + "/" + encodeURIComponent(String(id)),
                {
                    method: "PUT",
                    body: JSON.stringify(changes)
                }
            );
        }
    };

});