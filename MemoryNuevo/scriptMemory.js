let btnInicio = document.querySelector("button");

let miGaleria = document.querySelector(".galeria");
let misImagenes;

var numGiradas = 0; // puede valer 0,1,2
var cartaGirada1;
var cartaGirada2;
const cartas = [];
const cartaTapada = "imagenes/carta memory reves.png"
var fin = 3;
var filas;
var columnas;


//Cuando inicio el juego pido el num de columnas y filas
btnInicio.onclick = function () {
    //Muestro un prompt pidiendo el numero de columnas, max 6
    do {
        columnas = prompt("Numero de Columnas (max 6)");
    } while (isNaN(columnas) || columnas > 6 || columnas < 1);

    //Muestro un prompt pideindo el numero de filas. max 6
    //Tengo también que comprobar que filas*columnas de un numero par de cartas, si no vuelvo a pedir el numero de filas.
    let numParCartas = false;
    while (!numParCartas) {
        //Muestro un prompt pidiendo el numero de filas, max 6
        do {
            filas = prompt("Numero de Filas (max 6)");
        } while (isNaN(filas) || filas > 6 || filas < 1);
        if ((filas * columnas) % 2 === 0) numParCartas = true;
    }


    //Inicializo variables para el juego
    fin = filas * columnas / 2;
    //Creo la estructura de datos con las parejas de cartas escondidas
    for (let i = 0; i < (filas * columnas / 2); i++) {
        cartas[i] = `imagenes/memory${i + 1}.png`;
        cartas[i + (filas * columnas / 2)] = `imagenes/memory${i + 1}.png`;
    }
    //Mezclo las cartas escondidas
    cartas.sort(() => Math.random() - 0.5);

    //Hago desaparecer el botón
    btnInicio.style.opacity = "0";
    btnInicio.style.transition = "opacity 2s ease-in-out";


    //Hago aparecer la regilla con las imagenes
    //Modifico el DOM (el HTML) para insertar en el html la rejilla de cartas en el contenedor div con class galeria
    //Modifico el estilo de galeria para que use el numero de columnas introducidas por el usuario

    miGaleria.style.gridTemplateColumns = `repeat(${columnas}, 1fr)`;

    // Creo columnas*filas imagenes
    for (let i = 0; i < (filas * columnas); i++) {
        let nuevaImg = document.createElement("img");
        // Le asignamos sus atributos 
        nuevaImg.src = cartaTapada;

        // Añado el evento click a la imágen
        nuevaImg.onclick = function () {

            //Compruebo si no he girado todavía ninguna carta
            if (numGiradas === 0) {
                //Giro una carta y pongo al dia el estado del juego
                nuevaImg.setAttribute("src", cartas[i]);
                numGiradas = 1;
                cartaGirada1 = nuevaImg;
                nuevaImg.style.pointerEvents = "none";
            } else if (numGiradas === 1) {
                nuevaImg.setAttribute("src", cartas[i]);
                numGiradas = 2;
                cartaGirada2 = nuevaImg;
                nuevaImg.style.pointerEvents = "none";
            }
            //compruebo si tengo dos cartas giradas y tengo que hacer algo
            if (numGiradas === 2) {
                // si hay dos cartas iguales las elimino
                if (cartaGirada1.src === cartaGirada2.src) {
                    //sonido
                    let sonidoAplausos = new Audio('sonidos/aplausos.mp3');
                    sonidoAplausos.play();
                    //Desvanecer
                    cartaGirada1.style.opacity = "0";
                    cartaGirada1.style.transition = "opacity 2s ease-in-out";
                    cartaGirada2.style.opacity = "0";
                    cartaGirada2.style.transition = "opacity 2s ease-in-out";

                    //marco un acierto menos hacia el fin
                    fin = fin - 1;

                } else {
                    let sonidoFallo = new Audio('sonidos/fallo.mp3');
                    sonidoFallo.play();

                    //Espero 2 segundos y tapo las cartas
                    setTimeout(() => {
                        cartaGirada1.style.pointerEvents = "auto";
                        cartaGirada2.style.pointerEvents = "auto";

                        cartaGirada1.setAttribute("src", cartaTapada)
                        cartaGirada2.setAttribute("src", cartaTapada)

                    }, 2000);

                }
                //reseteo las varialbles
                numGiradas = 0;

            }


            //Compruebo si he terminado
            if (fin === 0) {
                setTimeout(() => {
                    alert("HAS TERMINADO. CIAO");
                }, 2000);

                //Borro del DOM las imagenes del contenedor div
                miGaleria.replaceChildren();

                //Vuelvo a hacer aparecer el boton de inico
                btnInicio.style.opacity = "1";
            }

        }

        // Metemos la nueva imagen al final del div galeria 
        miGaleria.appendChild(nuevaImg);
    };


};