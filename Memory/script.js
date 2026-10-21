//Inicio del JS
const REVERSO = "imagenes/reversoCarta.png";
const valores = ["imagenes/img1.png", "imagenes/img1.png", "imagenes/img2.png", "imagenes/img2.png", "imagenes/img3.png", "imagenes/img3.png"];
valores.sort(() => Math.random() - 0.5);
const cartas = document.querySelectorAll(".galeria img");
//sonidos

const acierto = new Audio("acierto.mp3");
const fallo = new Audio("fallo.mp3");
let primeraCarta = null;
let bloqueado = false;
let parejas = 0;

for (let i = 0; i < cartas.length; i++) {
    cartas[i].setAttribute("data-valor", valores[i]);
    cartas[i].style.transition = "opacity 0.5s";
    cartas[i].addEventListener("click", function () {
        destaparCarta(cartas[i]);
    });
}

function destaparCarta(carta) {
    if (bloqueado || carta === primeraCarta || carta.style.opacity === "0") {
        return;
    }

    carta.setAttribute("src", carta.getAttribute("data-valor"));

    if (primeraCarta === null) {
        primeraCarta = carta;
        return;
    }

    bloqueado = true;
    const a = primeraCarta;
    const b = carta;
    primeraCarta = null;


    if (a.getAttribute("data-valor") === b.getAttribute("data-valor")) {
        acierto.play();
        setTimeout(function () {
            a.style.opacity = "0";
            b.style.opacity = "0";
            parejas++;
            bloqueado = false;

            if (parejas === valores.length / 2) {
                setTimeout(() => {
                    alert("¡Muy bien!");
                }, 600);
            }
        }, 800);
    } else {
        fallo.play();
        setTimeout(function () {
            a.setAttribute("src", REVERSO);
            b.setAttribute("src", REVERSO);
            bloqueado = false;
        }, 1000);
    }
}