(() => {
  "use strict";

  class FridgeController {
    constructor(options) {
      this.game = options.game;
      this.gameScreen = options.gameScreen;
      this.character = options.character;
      this.kitchenScene = document.querySelector(".kitchen-scene");

      this.panel = null;
      this.hotspot = null;
      this.selectedFood = null;
      this.dragClone = null;
      this.dragSource = null;
      this.activePointerId = null;
      this.dragging = false;
      this.lastX = 0;
      this.lastY = 0;

      this.foodData = [
        { id: "apple", name: "Manzana", hunger: 10, className: "food-apple" },
        { id: "banana", name: "Plátano", hunger: 12, className: "food-banana" },
        { id: "chicken", name: "Pollo", hunger: 22, className: "food-chicken" },
        { id: "bone", name: "Galleta", hunger: 16, className: "food-bone" },
        { id: "carrot", name: "Zanahoria", hunger: 9, className: "food-carrot" },
        { id: "cake", name: "Pastel", hunger: 18, className: "food-cake" }
      ];

      this.build();
      this.bind();
    }

    build() {
      if (!this.kitchenScene) {
        throw new Error("No se encontró la escena de cocina.");
      }

      this.hotspot = document.createElement("button");
      this.hotspot.type = "button";
      this.hotspot.className = "fridge-module-hotspot";
      this.hotspot.setAttribute("aria-label", "Abrir refrigerador");

      this.panel = document.createElement("section");
      this.panel.className = "fridge-module";
      this.panel.setAttribute("aria-hidden", "true");

      this.panel.innerHTML = `
        <header class="fridge-module-header">
          <strong>Refrigerador</strong>
          <button type="button" class="fridge-module-close" aria-label="Cerrar refrigerador">×</button>
        </header>

        <p class="fridge-module-help">
          1. Toca una comida para seleccionarla.<br>
          2. Tócala otra vez y arrástrala, o pulsa “Dársela a Junior”.
        </p>

        <div class="fridge-module-foods">
          ${this.foodData.map((food) => `
            <button
              type="button"
              class="fridge-food ${food.className}"
              data-food="${food.id}"
              data-name="${food.name}"
              data-hunger="${food.hunger}"
              aria-label="${food.name}"
            >
              <span class="food-shape"></span>
              <small>${food.name}</small>
            </button>
          `).join("")}
        </div>

        <button type="button" class="fridge-feed-selected" disabled>
          Dársela a Junior
        </button>
      `;

      this.kitchenScene.appendChild(this.hotspot);
      this.kitchenScene.appendChild(this.panel);

      this.closeButton = this.panel.querySelector(".fridge-module-close");
      this.feedButton = this.panel.querySelector(".fridge-feed-selected");
      this.foodButtons = [...this.panel.querySelectorAll(".fridge-food")];
    }

    bind() {
      this.hotspot.addEventListener("click", () => this.open());
      this.closeButton.addEventListener("click", () => this.close());
      this.feedButton.addEventListener("click", () => this.feedSelected());

      this.foodButtons.forEach((food) => {
        food.addEventListener("pointerdown", (event) => {
          if (!this.isOpen()) return;
          event.preventDefault();
          event.stopPropagation();

          if (this.selectedFood !== food) {
            this.select(food);
            return;
          }

          this.beginDrag(food, event);
        }, { passive: false });

        food.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (this.selectedFood !== food) this.select(food);
        });
      });

      // Método seguro: seleccionar comida y tocar a Junior.
      this.character.element.addEventListener("pointerdown", (event) => {
        if (!this.isOpen() || !this.selectedFood || this.dragging) return;
        event.preventDefault();
        event.stopPropagation();
        this.feedSelected();
      }, { passive: false });
    }

    isKitchen() {
      return (this.game.save.room || "living") === "kitchen";
    }

    isOpen() {
      return this.gameScreen.classList.contains("fridge-module-open");
    }

    open() {
      if (!this.isKitchen()) {
        this.game.showMessage("El refrigerador solo funciona dentro de la cocina.");
        return;
      }

      this.gameScreen.classList.add("fridge-module-open");
      this.panel.setAttribute("aria-hidden", "false");
      AudioEngine.unlock();
      AudioEngine.play("fridgeOpen");
      this.character.setState("surprised", 700);
      this.game.showMessage("Selecciona una comida del refrigerador.");
    }

    close(playSound = true) {
      if (!this.isOpen()) return;
      this.cancelDrag();
      this.clearSelection();
      this.gameScreen.classList.remove("fridge-module-open");
      this.panel.setAttribute("aria-hidden", "true");
      if (playSound) AudioEngine.play("fridgeClose");
    }

    select(food) {
      if (!this.isKitchen() || !this.isOpen()) return;
      this.clearSelection();

      this.selectedFood = food;
      food.classList.add("is-selected");
      this.feedButton.disabled = false;
      this.feedButton.textContent = `Darle ${food.dataset.name} a Junior`;
      this.character.element.classList.add("food-target-ready");
      this.character.setState("surprised", 650);
      AudioEngine.play("tap");
      this.game.showMessage(
        `${food.dataset.name} seleccionada. Tócala otra vez para arrastrarla o pulsa el botón para dársela.`
      );
    }

    clearSelection() {
      this.foodButtons.forEach((food) => food.classList.remove("is-selected"));
      this.selectedFood = null;
      this.feedButton.disabled = true;
      this.feedButton.textContent = "Dársela a Junior";
      this.character.element.classList.remove("food-target-ready", "food-near");
      this.character.element.style.setProperty("--gaze-x", "0px");
      this.character.element.style.setProperty("--gaze-y", "0px");
    }

    beginDrag(food, event) {
      if (this.dragging || this.selectedFood !== food) return;

      this.dragging = true;
      this.dragSource = food;
      this.activePointerId = event.pointerId;
      food.classList.add("is-drag-source");

      this.dragClone = food.cloneNode(true);
      this.dragClone.classList.remove("is-selected", "is-drag-source");
      this.dragClone.classList.add("fridge-food-drag-clone");
      document.body.appendChild(this.dragClone);

      this.moveClone(event.clientX, event.clientY);

      this.onPointerMove = (moveEvent) => {
        if (moveEvent.pointerId !== this.activePointerId) return;
        moveEvent.preventDefault();
        this.moveClone(moveEvent.clientX, moveEvent.clientY);
      };

      this.onPointerUp = (upEvent) => {
        if (upEvent.pointerId !== this.activePointerId) return;
        upEvent.preventDefault();
        this.finishDrag(upEvent.clientX, upEvent.clientY);
      };

      window.addEventListener("pointermove", this.onPointerMove, { passive: false, capture: true });
      window.addEventListener("pointerup", this.onPointerUp, { passive: false, capture: true });
      window.addEventListener("pointercancel", this.onPointerUp, { passive: false, capture: true });
    }

    moveClone(x, y) {
      if (!this.dragClone) return;

      this.lastX = x;
      this.lastY = y;
      this.dragClone.style.left = `${x}px`;
      this.dragClone.style.top = `${y}px`;

      const mouth = this.getMouthPoint();
      const distance = Math.hypot(x - mouth.x, y - mouth.y);

      this.character.element.classList.toggle("food-near", distance <= 150);

      const dx = Math.max(-9, Math.min(9, (x - mouth.x) / 18));
      const dy = Math.max(-7, Math.min(7, (y - mouth.y) / 22));
      this.character.element.style.setProperty("--gaze-x", `${dx}px`);
      this.character.element.style.setProperty("--gaze-y", `${dy}px`);
    }

    finishDrag(x, y) {
      if (!this.dragging) return;

      const mouth = this.getMouthPoint();
      const distance = Math.hypot(x - mouth.x, y - mouth.y);
      const food = this.dragSource;

      this.cancelDrag(false);

      if (distance <= 150) {
        this.eat(food);
      } else {
        this.game.showMessage("No llegó a la boca. La comida sigue seleccionada.");
        food.classList.add("is-selected");
        this.selectedFood = food;
        this.feedButton.disabled = false;
      }
    }

    cancelDrag(resetSelection = false) {
      if (this.onPointerMove) {
        window.removeEventListener("pointermove", this.onPointerMove, true);
        window.removeEventListener("pointerup", this.onPointerUp, true);
        window.removeEventListener("pointercancel", this.onPointerUp, true);
      }

      this.dragClone?.remove();
      this.dragSource?.classList.remove("is-drag-source");

      this.dragClone = null;
      this.dragSource = null;
      this.activePointerId = null;
      this.dragging = false;
      this.onPointerMove = null;
      this.onPointerUp = null;

      this.character.element.classList.remove("food-near");
      this.character.element.style.setProperty("--gaze-x", "0px");
      this.character.element.style.setProperty("--gaze-y", "0px");

      if (resetSelection) this.clearSelection();
    }

    feedSelected() {
      if (!this.selectedFood || !this.isOpen() || !this.isKitchen()) return;
      const food = this.selectedFood;
      this.eat(food);
    }

    eat(food) {
      const hunger = Number(food.dataset.hunger || 10);
      const name = food.dataset.name || "comida";

      this.clearSelection();
      food.disabled = true;
      food.classList.add("is-eaten");

      this.character.element.classList.add("eating");
      AudioEngine.unlock();
      AudioEngine.play("bite");

      window.setTimeout(() => {
        this.game.changeNeed("hunger", hunger);
        this.game.changeNeed("happiness", 8);
        this.character.element.classList.remove("eating");
        this.character.element.classList.add("food-celebration");
        this.character.setState("happy", 1600);
        AudioEngine.play("happy");
        this.game.spawnStars(10);
        this.game.spawnHearts(6);
        this.game.renderNeeds();
        this.game.persist();
        this.game.showMessage(`Junior disfrutó ${name}.`);

        window.setTimeout(() => {
          this.character.element.classList.remove("food-celebration");
        }, 950);

        window.setTimeout(() => {
          food.disabled = false;
          food.classList.remove("is-eaten");
        }, 4500);
      }, 650);
    }

    getMouthPoint() {
      const rect = this.character.element.getBoundingClientRect();
      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.63
      };
    }
  }

  window.FridgeController = FridgeController;
})();
