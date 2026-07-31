# Junior Pocket Adventure

Primera base funcional del nuevo juego de mascota virtual.

## Versión 0.4.0

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
