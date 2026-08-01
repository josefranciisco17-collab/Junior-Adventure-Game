# Junior Adventure Game v0.1.0

Base funcional inicial con HTML5 Canvas.

Incluye movimiento lateral con aceleración, salto, gravedad, colisiones, cámara suave, plataformas, monedas, vidas, controles táctiles y máquina de estados (`idle`, `run`, `jump`, `fall`).

La animación actual usa una sola pose con rebote, inclinación y squash/stretch. La arquitectura permite sustituirla después por sprite sheets reales sin rehacer física, controles ni niveles.

## Probar en Termux

```bash
cd ~/Junior-Adventure-Game-v0.1.0
python -m http.server 8080
```

Abre `http://127.0.0.1:8080`.

## Subir a GitHub

```bash
git add -A
git commit -m "Primera base funcional de Junior Adventure"
git push origin main
```
