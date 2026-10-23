let miBoton = document.querySelector("button");
let miGaleria = document.querySelector(".galeria");
let columnas;
let filas;

// variables de estado del juego
let numGiradas = 0;
let cartaGirada1;
let cartaGirada2;
let cartaTapada = "imagenes/reversoCarta.png";
let cartas = ["imagenes/memory1.png", "imagenes/memory2.png", "imagenes/memory3.png"];
let fin; // parejas pendientes

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

miBoton.onclick = function () {
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

    // construyo la baraja: cada imagen dos veces, y barajada
    let baraja = [];
    for (let p = 0; p < fin; p++) {
        let ruta = cartas[p % cartas.length];
        baraja.push(ruta, ruta);
    }
    barajar(baraja);

    // la rejilla usa el numero de columnas elegido
    miGaleria.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;

    for (let i = 0; i < filas * columnas; i++) {
        let nuevaImg = document.createElement("img");
        nuevaImg.src = cartaTapada;

        nuevaImg.onclick = function () {
            if (numGiradas === 0) {
                nuevaImg.src = baraja[i];
                numGiradas = 1;
                cartaGirada1 = nuevaImg;
                nuevaImg.style.pointerEvents = "none";
            } else if (numGiradas === 1) {
                nuevaImg.src = baraja[i];
                numGiradas = 2;
                cartaGirada2 = nuevaImg;
                nuevaImg.style.pointerEvents = "none";

                if (cartaGirada1.src === cartaGirada2.src) {
                    // pareja encontrada
                    fin--;
                    numGiradas = 0;

                    if (fin === 0) {
                        setTimeout(function () {
                            alert("HAS TERMINADO. CIAO");
                            // borro las imgs del contenedor
                            miGaleria.replaceChildren();
                            // aparece el boton de inicio
                            miBoton.style.opacity = "1";
                            miBoton.style.pointerEvents = "auto";
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