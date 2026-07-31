# Junior Pocket Adventure

Primera base funcional del nuevo juego de mascota virtual.

## Versión 0.5.1

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
