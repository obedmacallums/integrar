/* Información geográfica del fotograma, independiente del giro del visor. */
(function (global) {
    'use strict';

    function iniciarFichaGnss(visor, contenedor, escenas) {
        var control = document.createElement('div');
        control.className = 'control-gnss';
        control.innerHTML =
            '<button type="button" class="boton-gnss pnlm-controls" ' +
            'aria-label="Información GNSS" title="Información GNSS" ' +
            'aria-expanded="false" aria-controls="ficha-gnss">' +
            '<svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24" ' +
            'fill="none" stroke="currentColor" stroke-width="1.8">' +
            '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/>' +
            '<circle cx="12" cy="10" r="2.5"/></svg></button>' +
            '<section id="ficha-gnss" class="ficha-gnss" aria-label="Información GNSS" hidden>' +
            '<div class="cabecera-gnss"><strong>Información GNSS</strong>' +
            '<button type="button" class="cerrar-gnss" aria-label="Cerrar información GNSS">×</button></div>' +
            '<dl><dt>Longitud</dt><dd data-gnss="lon"></dd>' +
            '<dt>Latitud</dt><dd data-gnss="lat"></dd>' +
            '<dt>Altura</dt><dd data-gnss="alt"></dd>' +
            '<dt>Rumbo del fotograma</dt><dd data-gnss="rumbo"></dd></dl>' +
            '<a class="mapa-gnss" target="_blank" rel="noopener noreferrer">Abrir en Google Maps ↗</a>' +
            '</section>';
        contenedor.appendChild(control);
        var boton = control.querySelector('.boton-gnss');
        var ficha = control.querySelector('.ficha-gnss');
        var mapa = control.querySelector('.mapa-gnss');

        function mostrar(abierta) {
            ficha.hidden = !abierta;
            boton.setAttribute('aria-expanded', String(abierta));
            // `tour.css` esconde con esto las flechas de dirección en el
            // celular: la ficha las taparía.
            contenedor.classList.toggle('ficha-gnss-abierta', abierta);
        }

        function numero(valor) {
            return typeof valor === 'number' && isFinite(valor);
        }

        function actualizar() {
            var escena = escenas[visor.getScene()] || {};
            var datos = escena.gnss || {};
            ['lon', 'lat', 'alt', 'rumbo'].forEach(function (clave) {
                var valor = datos[clave];
                var decimales = clave === 'lon' || clave === 'lat' ? 6 : 1;
                control.querySelector('[data-gnss="' + clave + '"]').textContent =
                    numero(valor) ? valor.toFixed(decimales).replace('.', ',') +
                    (clave === 'alt' ? ' m' : '°') : 'No disponible';
            });
            var ubicacion = numero(datos.lat) && numero(datos.lon) &&
                Math.abs(datos.lat) <= 90 && Math.abs(datos.lon) <= 180;
            mapa.hidden = !ubicacion;
            if (ubicacion) {
                mapa.href = 'https://www.google.com/maps/search/?api=1&query=' +
                    encodeURIComponent(datos.lat + ',' + datos.lon);
            } else {
                mapa.removeAttribute('href');
            }
        }

        boton.addEventListener('click', function () { mostrar(ficha.hidden); });
        control.querySelector('.cerrar-gnss').addEventListener('click', function () {
            mostrar(false);
            boton.focus();
        });
        // Evita que interactuar con la ficha arrastre el panorama o navegue.
        ['pointerdown', 'mousedown', 'touchstart', 'dblclick', 'wheel', 'click'].forEach(function (tipo) {
            control.addEventListener(tipo, function (evento) { evento.stopPropagation(); });
        });
        control.addEventListener('keydown', function (evento) {
            evento.stopPropagation();
            if (evento.key === 'Escape') {
                mostrar(false);
                boton.focus();
            }
        });
        visor.on('scenechange', actualizar);
        actualizar();
    }

    global.iniciarFichaGnss = iniciarFichaGnss;
}(window));
