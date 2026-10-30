// URL de la casa
const url = "https://api.arasaac.org/v1/pictograms/6964?download=false";

let resultado;
let dataCasa;

async function obtenerImagenCasa() {
    try {
        // await = identifica el comando asincrono 
        resultado = await fetch(url);

        if (!resultado.ok) {
            alert("Error de la API");
            return null;
        }

        dataCasa = await resultado.blob();

        if (dataCasa == null) {
            alert("Error en el contenido");
            return null;
        }
        return dataCasa;
    } catch (error) {
        console.error('Hubo un error al conectar con AASRC');
        return null;

    }

}

let boton = document.querySelector("#miBoton");
boton.addEventListener("click", async function () {
    let imgPng = await obtenerImagenCasa();
    let imagenhtml = document.querySelector("img");
    imagenhtml.src = URL.createObjectURL(imgPng);


})