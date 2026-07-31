document.addEventListener("DOMContentLoaded", () => {
  try {
    const game = new JuniorGame();
    game.init();
    window.juniorPocketAdventure = game;
  } catch (error) {
    console.error("No se pudo iniciar Junior Pocket Adventure:", error);
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#111827;color:white;font-family:system-ui;text-align:center">
        <div>
          <h1>Error al iniciar el juego</h1>
          <p>Revisa la consola del navegador para conocer el detalle.</p>
        </div>
      </main>
    `;
  }
});
