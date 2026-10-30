// Direcciones base de la API de ARASAAC
const URL_BUSQUEDA = "https://api.arasaac.org/v1/pictograms/es/search/";
const URL_PICTOGRAMA = "https://api.arasaac.org/v1/pictograms/";

// Palabras que se buscaran en la API (hay de sobra: maximo 18 parejas en una rejilla 6x6)
const PALABRAS = [
    "casa", "perro", "gato", "sol", "luna", "arbol", "flor", "coche", "pan",
    "agua", "manzana", "pelota", "libro", "mesa", "silla", "pez", "pajaro",
    "leche", "cama", "zapato", "camisa", "reloj", "bicicleta", "avion",
    "barco", "tren"
];

let miBoton = document.querySelector("#btnInicio");
let miGaleria = document.querySelector(".galeria");
let estado = document.querySelector("#estado");
let columnas;
let filas;

// variables de estado del juego
let numGiradas = 0;
let cartaGirada1;
let cartaGirada2;
let cartaTapada = "imagenes/reversoCarta.png";
let fin; // parejas pendientes
let urlsActuales = []; // URLs de las imagenes de la partida, para liberarlas al acabar

// mezcla un array (Fisher-Yates)
function barajar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// comprueba que el valor introducido es un entero entre 1 y 6
function valido(valor) {
    return valor !== null && valor.trim() !== "" &&
        Number.isInteger(Number(valor)) && Number(valor) >= 1 && Number(valor) <= 6;
}

// 1) Llamada a la API: busca una palabra y descarga su pictograma.
//    Devuelve { id, url } o null si no hay resultado o falla algo.
async function obtenerPictograma(palabra) {
    try {
        // primera llamada: buscar el id del pictograma
        const respuesta = await fetch(URL_BUSQUEDA + encodeURIComponent(palabra));
        if (!respuesta.ok) {
            return null; // 404 = sin resultados
        }

        const lista = await respuesta.json();
        if (!Array.isArray(lista) || lista.length === 0) {
            return null;
        }
        const id = lista[0]._id;

        // segunda llamada: descargar la imagen del pictograma
        const respuestaImg = await fetch(URL_PICTOGRAMA + id + "?download=false");
        if (!respuestaImg.ok) {
            return null;
        }

        const blob = await respuestaImg.blob();
        if (blob == null || blob.size === 0) {
            return null;
        }

        return { id: id, url: URL.createObjectURL(blob) };
    } catch (error) {
        console.error("Hubo un error al conectar con ARASAAC (" + palabra + ")", error);
        return null;
    }
}

// 2) Consigue tantos pictogramas distintos como parejas haya que formar.
//    Pide las palabras en lotes en paralelo y, si alguna falla, usa las siguientes.
async function obtenerPictogramas(cantidad) {
    const palabras = barajar([...PALABRAS]);
    const resultado = [];
    let indice = 0;

    while (resultado.length < cantidad && indice < palabras.length) {
        const faltan = cantidad - resultado.length;
        const lote = palabras.slice(indice, indice + faltan);
        indice += faltan;

        const respuestas = await Promise.all(lote.map(obtenerPictograma));

        for (const pictograma of respuestas) {
            // se descartan los fallos y los pictogramas repetidos
            if (pictograma != null && !resultado.some(p => p.id === pictograma.id)) {
                resultado.push(pictograma);
            }
        }
    }

    return resultado;
}

// vuelve a mostrar el boton de inicio
function mostrarBoton() {
    miBoton.style.opacity = "1";
    miBoton.style.pointerEvents = "auto";
}

miBoton.onclick = async function () {
    // desaparece el boton y deja de ser clicable
    miBoton.style.transition = "opacity 2s ease-in-out";
    miBoton.style.opacity = "0";
    miBoton.style.pointerEvents = "none";

    // numero de columnas
    let entrada;
    do {
        entrada = prompt("Introduce el numero de columnas (max 6):");
    } while (!valido(entrada));
    columnas = Number(entrada);

    // numero de filas (el total de cartas debe ser par)
    do {
        entrada = prompt("Introduce el numero de filas (max 6):");
    } while (!valido(entrada) || (Number(entrada) * columnas) % 2 !== 0);
    filas = Number(entrada);

    // reinicio el estado del juego
    numGiradas = 0;
    fin = (filas * columnas) / 2;

    // pido los pictogramas a la API
    estado.textContent = "Cargando pictogramas desde ARASAAC...";
    const pictogramas = await obtenerPictogramas(fin);

    if (pictogramas.length < fin) {
        estado.textContent = "";
        alert("No se han podido cargar suficientes pictogramas. Vuelve a intentarlo.");
        pictogramas.forEach(p => URL.revokeObjectURL(p.url));
        mostrarBoton();
        return;
    }
    estado.textContent = "";
    urlsActuales = pictogramas.map(p => p.url);

    // construyo la baraja: cada pictograma dos veces, y barajada
    let baraja = [];
    for (const pictograma of pictogramas) {
        baraja.push(pictograma, pictograma);
    }
    barajar(baraja);

    // la rejilla usa el numero de columnas elegido
    miGaleria.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;

    for (let i = 0; i < filas * columnas; i++) {
        let nuevaImg = document.createElement("img");
        nuevaImg.src = cartaTapada;

        nuevaImg.onclick = function () {
            if (numGiradas === 0) {
                nuevaImg.src = baraja[i].url;
                nuevaImg.dataset.id = baraja[i].id;
                numGiradas = 1;
                cartaGirada1 = nuevaImg;
                nuevaImg.style.pointerEvents = "none";
            } else if (numGiradas === 1) {
                nuevaImg.src = baraja[i].url;
                nuevaImg.dataset.id = baraja[i].id;
                numGiradas = 2;
                cartaGirada2 = nuevaImg;
                nuevaImg.style.pointerEvents = "none";

                if (cartaGirada1.dataset.id === cartaGirada2.dataset.id) {
                    // pareja encontrada
                    fin--;
                    numGiradas = 0;

                    if (fin === 0) {
                        setTimeout(function () {
                            alert("HAS TERMINADO. CIAO");
                            // borro las imgs del contenedor y libero las imagenes
                            miGaleria.replaceChildren();
                            urlsActuales.forEach(u => URL.revokeObjectURL(u));
                            urlsActuales = [];
                            // aparece el boton de inicio
                            mostrarBoton();
                        }, 1000);
                    }
                } else {
                    // se vuelven a tapar tras un tiempo
                    setTimeout(function () {
                        cartaGirada1.src = cartaTapada;
                        cartaGirada2.src = cartaTapada;
                        cartaGirada1.style.pointerEvents = "auto";
                        cartaGirada2.style.pointerEvents = "auto";
                        numGiradas = 0;
                    }, 1000);
                }
            }
        };

        miGaleria.appendChild(nuevaImg);
    }
};