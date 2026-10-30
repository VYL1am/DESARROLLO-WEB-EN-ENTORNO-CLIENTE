const URL_BUSQUEDA = "https://api.arasaac.org/v1/pictograms/es/search/";
const URL_PICTOGRAMA = "https://api.arasaac.org/v1/pictograms/";

const inputPalabra = document.querySelector("#palabra");
const boton = document.querySelector("#miBoton");
const texto = document.querySelector("#texto");
const imagen = document.querySelector("#imagen");

let urlAnterior = null;


async function buscarIdPictograma(palabra) {
    try {
        const respuesta = await fetch(URL_BUSQUEDA + encodeURIComponent(palabra));

        if (respuesta.status === 404) {
            return null;
        }

        if (!respuesta.ok) {
            alert("Error de la API");
            return null;
        }

        const resultados = await respuesta.json();

        if (!Array.isArray(resultados) || resultados.length === 0) {
            return null;
        }

        return resultados[0]._id;
    } catch (error) {
        console.error("Hubo un error al conectar con ARASAAC (busqueda)", error);
        return null;
    }
}

async function obtenerImagen(id) {
    try {
        const respuesta = await fetch(URL_PICTOGRAMA + id + "?download=false");

        if (!respuesta.ok) {
            alert("Error de la API");
            return null;
        }

        const blob = await respuesta.blob();

        if (blob == null || blob.size === 0) {
            alert("Error en el contenido");
            return null;
        }

        return blob;
    } catch (error) {
        console.error("Hubo un error al conectar con ARASAAC (imagen)", error);
        return null;
    }
}

async function buscarPictograma() {
    const palabra = inputPalabra.value.trim();

    if (palabra === "") {
        texto.textContent = "Escribe una palabra antes de buscar.";
        imagen.style.display = "none";
        return;
    }

    texto.textContent = "Buscando...";
    imagen.style.display = "none";

    const id = await buscarIdPictograma(palabra);

    if (id == null) {
        texto.textContent = "No se ha encontrado ningun pictograma para \"" + palabra + "\".";
        return;
    }

    const blob = await obtenerImagen(id);

    if (blob == null) {
        texto.textContent = "No se ha podido cargar la imagen.";
        return;
    }

    if (urlAnterior != null) {
        URL.revokeObjectURL(urlAnterior);
    }
    urlAnterior = URL.createObjectURL(blob);

    imagen.src = urlAnterior;
    imagen.alt = palabra;
    imagen.style.display = "inline";
    texto.textContent = "Pictograma de \"" + palabra + "\" (id " + id + ")";
}

boton.addEventListener("click", buscarPictograma);
inputPalabra.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        buscarPictograma();
    }
});