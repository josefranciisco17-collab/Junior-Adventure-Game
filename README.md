# Junior Pocket Adventure

Primera base funcional del nuevo juego de mascota virtual.

## Versión 0.8.3

Incluye:

- Pantalla de carga.
- Menú principal.
- Habitación inicial.
- Junior construido solo con cuerpo, ojos, boca y orejas.
- Sin brazos, patas ni cola.
- Parpadeo natural.
- Pupilas que siguen el toque.
- Respiración y movimiento suave.
- Expresiones neutral, contento, triste, cansado, hambriento, sorprendido, molesto y dormido.
- Barras de hambre, sueño, higiene y felicidad.
- Sala, cocina, baño y dormitorio.
- Guardado local con LocalStorage.
- Ajustes básicos.

## Abrir localmente

Abre `index.html` en un navegador o usa un servidor local.

En Termux puedes instalar Python y ejecutar:

```bash
pkg install python
python -m http.server 8080
```

Después abre:

```text
http://127.0.0.1:8080
```


## Cambio principal de la versión 0.2.0

- Se sustituyó el personaje genérico de CSS por el diseño oficial de Junior.
- Se eliminó el fondo negro de la imagen.
- El personaje conserva su pecho, pelaje, hocico, ojos y orejas originales.
- Se añadieron respiración, parpadeo, reacción al tocarlo, sueño, tristeza, sorpresa y movimientos suaves.


## Reconstrucción completa 0.4.0

- Se eliminó por completo el personaje anterior.
- Junior fue redibujado desde cero como SVG vectorial.
- Ya no depende de una fotografía recortada.
- El cuerpo, pecho, orejas, ojos, pupilas, párpados, hocico, nariz y boca son independientes.
- El parpadeo cierra los ojos de manera rápida y natural.
- Las pupilas siguen el toque sin deformar la cara.
- Las expresiones usan cambios pequeños y controlados.
- No tiene brazos, patas ni cola.
- La sala recibió más profundidad, mobiliario y mejor integración visual.


## Casa Premium 0.5.0

### Sala
- Sofá, cojines, televisión, mueble, mesa, lámpara, planta, alfombra, reloj, cuadro y ventana animada.

### Cocina
- Refrigerador, alacenas, fregadero, estufa, horno, microondas, campana, barra, bancos y frutero.

### Baño
- Regadera de cristal, agua animada, lavabo, espejo iluminado, inodoro, toallero, productos y tapete.

### Dormitorio
- Cama, almohadas, cobija, buró, lámpara, clóset, planta, alfombra y ventana nocturna.

Las cuatro habitaciones están construidas con objetos independientes y transiciones suaves.


## Ajuste 0.5.1

- La pantalla de carga usa al Junior oficial.
- El menú principal usa exactamente al mismo Junior del juego.
- Se eliminaron visualmente las versiones simplificadas anteriores.
- Se conservaron logo, botones, distribución y funciones.
- Junior respira, parpadea y mueve ligeramente la mirada en el menú.


## Corrección 0.5.2

- Se corrigió el Junior invisible del menú principal.
- Cada copia del SVG ahora tiene identificadores internos únicos.
- Se corrigieron conflictos de filtros y recortes en navegadores Android.
- El personaje aparece en la pantalla de carga, el menú y la partida.
- Se conservaron respiración, parpadeo y movimiento de mirada.


## Casa Viva 0.6.0

- Reloj analógico y digital con la hora real.
- Ciclo automático de día, tarde y noche.
- Iluminación adaptada a la hora.
- Televisión animada.
- Plantas, estrellas, reflejos y objetos con movimiento.
- Acciones diferentes en sala, cocina, baño y dormitorio.
- Efectos de burbujas, vapor y estrellas.
- Junior bosteza, recibe caricias y reacciona a cada habitación.
- Transiciones suaves al cambiar de cuarto.


## Vida y sonido 0.7.0

- Motor de audio Web Audio sin depender de archivos externos.
- Música ambiental diferente en sala, cocina, baño y dormitorio.
- Sonidos para televisión, comida, agua, baño, cepillado, sueño, despertar, bostezo y caricias.
- Botón para activar o silenciar el audio.
- Barras de necesidades con brillo y colores de advertencia.
- Corazones al acariciar a Junior.
- Z animadas al dormir.
- Sacudida al secarse.
- Reacciones hacia el lado donde se toca.
- HUD más vivo y animaciones visuales adicionales.

Nota: los navegadores móviles exigen tocar la pantalla una vez para permitir el audio.


## Corrección 0.7.1

- Al pulsar Dormir, Junior mantiene los ojos completamente cerrados.
- El juego ya no recarga la habitación después de cada acción.
- Junior duerme durante 9 segundos antes de despertar.
- Se añadieron ronquidos repetidos y un sonido de sueño más fuerte.
- El audio se desbloquea directamente al tocar cualquier acción.
- La música comienza al pulsar Jugar o Continuar.
- El botón de sonido queda visible junto al botón del menú.
- Se incrementó el volumen general de música y efectos.


## Refrigerador interactivo 0.8.0

- El refrigerador se abre dentro de la cocina.
- Aparecen manzana, plátano, pollo, galleta de hueso, zanahoria y pastel.
- Los alimentos se arrastran con el dedo.
- Junior sigue la comida con la mirada.
- Abre la boca cuando el alimento se acerca.
- Al soltarlo en su boca, mastica con sonido.
- La barra de hambre aumenta según el alimento.
- Junior muestra felicidad y salta después de comer.
- Los controles de alimentación funcionan únicamente en la cocina.


## Corrección 0.8.1

- Se corrigió el arrastre de alimentos en Android.
- Se añadieron eventos táctiles de respaldo además de Pointer Events.
- El navegador ya no desplaza la pantalla mientras sostienes comida.
- El alimento sigue el dedo como elemento flotante.
- Se amplió la zona de la boca para facilitar soltar la comida.
- Aparece una indicación mientras arrastras.


## Corrección 0.8.2

- El alimento original permanece dentro del refrigerador.
- Se crea una copia flotante que sigue el dedo.
- Una capa transparente captura todo el movimiento táctil.
- Se evita perder el arrastre al salir del área del refrigerador.
- El sistema separa correctamente eventos táctiles y eventos de mouse.
- La zona de entrega en la boca es más grande.


## Corrección real del arrastre 0.8.3

- Se identificó que el movimiento táctil seguía asociado al alimento original.
- Los eventos touchmove, touchend y touchcancel ahora se escuchan en toda la ventana.
- Se eliminó la dependencia de una capa creada después de comenzar el toque.
- Se usan listeners en fase de captura para evitar que Android o el navegador bloqueen el gesto.
- El alimento original se marca visualmente mientras la copia flotante sigue el dedo.
