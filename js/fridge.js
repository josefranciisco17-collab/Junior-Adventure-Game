(() => {
  "use strict";

  class FridgeController {
    constructor({ game, gameScreen, character }) {
      this.game = game;
      this.gameScreen = gameScreen;
      this.character = character;
      this.kitchenScene = document.querySelector(".kitchen-scene");

      this.isDragging = false;
      this.dragPointerId = null;
      this.dragClone = null;
      this.dragSource = null;
      this.sourceRect = null;
      this.lastX = 0;
      this.lastY = 0;

      this.foods = [
        { id: "apple", name: "Manzana", hunger: 10, className: "food-apple" },
        { id: "banana", name: "Plátano", hunger: 12, className: "food-banana" },
        { id: "chicken", name: "Pollo", hunger: 22, className: "food-chicken" },
        { id: "milk", name: "Leche", hunger: 8, className: "food-milk" },
        { id: "cake", name: "Pastel", hunger: 18, className: "food-cake" },
        { id: "bone", name: "Huesito", hunger: 16, className: "food-bone" },
        { id: "carrot", name: "Zanahoria", hunger: 9, className: "food-carrot" },
        { id: "cookie", name: "Galleta", hunger: 13, className: "food-cookie" }
      ];

      this.build();
      this.bind();
    }

    build() {
      if (!this.kitchenScene) {
        throw new Error("No se encontró la escena de cocina.");
      }

      this.fridge = document.createElement("section");
      this.fridge.className = "real-fridge";
      this.fridge.setAttribute("aria-hidden", "true");

      this.fridge.innerHTML = `
        <div class="real-fridge-shell">
          <header class="real-fridge-freezer">
            <span>Congelador</span>
            <button type="button" class="real-fridge-close" aria-label="Cerrar refrigerador">×</button>
          </header>

          <div class="real-fridge-interior">
            <div class="real-fridge-light"></div>

            <div class="real-fridge-shelf shelf-1"></div>
            <div class="real-fridge-shelf shelf-2"></div>
            <div class="real-fridge-shelf shelf-3"></div>

            <div class="real-fridge-foods">
              ${this.foods.map((food) => `
                <button
                  type="button"
                  class="real-food ${food.className}"
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
          </div>

          <div class="real-fridge-door">
            <div class="real-fridge-door-depth"></div>
            <div class="real-fridge-door-handle"></div>
          </div>
        </div>
      `;

      document.body.appendChild(this.fridge);

      this.closeButton = this.fridge.querySelector(".real-fridge-close");
      this.foodButtons = [...this.fridge.querySelectorAll(".real-food")];
    }

    bind() {
      this.closeButton.addEventListener("click", () => this.close());

      this.foodButtons.forEach((food) => {
        food.addEventListener("pointerdown", (event) => {
          if (!this.isOpen() || food.disabled) return;

          event.preventDefault();
          event.stopPropagation();

          this.startDrag(food, event);
        }, { passive: false });
      });
    }

    isKitchen() {
      return (this.game.save.room || "living") === "kitchen";
    }

    isOpen() {
      return this.fridge.classList.contains("open");
    }

    open() {
      if (!this.isKitchen()) {
        this.game.showMessage("El refrigerador solo funciona dentro de la cocina.");
        return;
      }

      AudioEngine.unlock();
      AudioEngine.play("fridgeOpen");

      this.fridge.classList.add("open", "light-on");
      this.fridge.setAttribute("aria-hidden", "false");
      document.body.classList.add("real-fridge-active");
      this.gameScreen.classList.add("real-fridge-open");

      this.character.setState("surprised", 700);
      this.game.showMessage("Toca una comida y arrástrala hasta la boca de Junior.");
    }

    close(playSound = true) {
      if (!this.isOpen()) return;

      this.cancelDrag(true);

      this.fridge.classList.remove("open", "light-on");
      this.fridge.setAttribute("aria-hidden", "true");
      document.body.classList.remove("real-fridge-active");
      this.gameScreen.classList.remove("real-fridge-open");

      if (playSound) AudioEngine.play("fridgeClose");
    }

    startDrag(food, event) {
      if (this.isDragging) return;

      this.isDragging = true;
      this.dragPointerId = event.pointerId;
      this.dragSource = food;
      this.sourceRect = food.getBoundingClientRect();
      this.lastX = event.clientX;
      this.lastY = event.clientY;

      food.classList.add("drag-source");

      this.dragClone = food.cloneNode(true);
      this.dragClone.classList.remove("drag-source");
      this.dragClone.classList.add("real-food-drag-clone");
      document.body.appendChild(this.dragClone);

      AudioEngine.play("pickupFood");

      try {
        food.setPointerCapture?.(event.pointerId);
      } catch (_) {}

      this.moveDrag(event.clientX, event.clientY);

      this.onMove = (moveEvent) => {
        if (moveEvent.pointerId !== this.dragPointerId) return;
        moveEvent.preventDefault();
        moveEvent.stopPropagation();

        this.moveDrag(moveEvent.clientX, moveEvent.clientY);
      };

      this.onEnd = (endEvent) => {
        if (endEvent.pointerId !== this.dragPointerId) return;
        endEvent.preventDefault();
        endEvent.stopPropagation();

        this.finishDrag(endEvent.clientX, endEvent.clientY);
      };

      window.addEventListener("pointermove", this.onMove, { passive: false, capture: true });
      window.addEventListener("pointerup", this.onEnd, { passive: false, capture: true });
      window.addEventListener("pointercancel", this.onEnd, { passive: false, capture: true });
    }

    moveDrag(x, y) {
      if (!this.dragClone) return;

      this.lastX = x;
      this.lastY = y;

      this.dragClone.style.left = `${x}px`;
      this.dragClone.style.top = `${y}px`;

      const mouth = this.getMouthPoint();
      const distance = Math.hypot(x - mouth.x, y - mouth.y);
      const nearMouth = distance <= 145;

      this.character.element.classList.toggle("food-near", nearMouth);

      const dx = Math.max(-9, Math.min(9, (x - mouth.x) / 18));
      const dy = Math.max(-7, Math.min(7, (y - mouth.y) / 22));

      this.character.element.style.setProperty("--gaze-x", `${dx}px`);
      this.character.element.style.setProperty("--gaze-y", `${dy}px`);
    }

    finishDrag(x, y) {
      if (!this.isDragging) return;

      const mouth = this.getMouthPoint();
      const distance = Math.hypot(x - mouth.x, y - mouth.y);
      const food = this.dragSource;

      if (distance <= 145) {
        this.cancelDrag(false);
        this.eat(food);
      } else {
        this.returnFoodToShelf();
      }
    }

    returnFoodToShelf() {
      if (!this.dragClone || !this.sourceRect) {
        this.cancelDrag(false);
        return;
      }

      this.dragClone.style.transition = "left .28s ease, top .28s ease, transform .28s ease, opacity .28s ease";
      this.dragClone.style.left = `${this.sourceRect.left + this.sourceRect.width / 2}px`;
      this.dragClone.style.top = `${this.sourceRect.top + this.sourceRect.height / 2}px`;
      this.dragClone.style.transform = "translate(-50%,-50%) scale(.72)";
      this.dragClone.style.opacity = ".45";

      this.game.showMessage("La comida regresó a su estante.");

      window.setTimeout(() => {
        this.cancelDrag(false);
      }, 300);
    }

    cancelDrag(resetCharacter = true) {
      if (this.onMove) {
        window.removeEventListener("pointermove", this.onMove, true);
        window.removeEventListener("pointerup", this.onEnd, true);
        window.removeEventListener("pointercancel", this.onEnd, true);
      }

      this.dragClone?.remove();
      this.dragSource?.classList.remove("drag-source");

      this.isDragging = false;
      this.dragPointerId = null;
      this.dragClone = null;
      this.dragSource = null;
      this.sourceRect = null;
      this.onMove = null;
      this.onEnd = null;

      if (resetCharacter) {
        this.character.element.classList.remove("food-near");
        this.character.element.style.setProperty("--gaze-x", "0px");
        this.character.element.style.setProperty("--gaze-y", "0px");
      }
    }

    eat(food) {
      const hunger = Number(food.dataset.hunger || 10);
      const name = food.dataset.name || "comida";

      food.disabled = true;
      food.classList.add("eaten");

      this.character.element.classList.remove("food-near");
      this.character.element.classList.add("eating");

      AudioEngine.unlock();
      AudioEngine.play("bite");

      window.setTimeout(() => {
        AudioEngine.play("chew");
      }, 170);

      window.setTimeout(() => {
        AudioEngine.play("swallow");
      }, 520);

      window.setTimeout(() => {
        this.game.changeNeed("hunger", hunger);
        this.game.changeNeed("happiness", 9);
        this.game.renderNeeds();
        this.game.persist();

        this.character.element.classList.remove("eating");
        this.character.element.classList.add("food-celebration");
        this.character.setState("happy", 1700);

        AudioEngine.play("foodHappy");
        this.game.spawnStars(12);
        this.game.spawnHearts(7);
        this.game.showMessage(`Junior disfrutó ${name}.`);

        window.setTimeout(() => {
          this.character.element.classList.remove("food-celebration");
        }, 1000);

        window.setTimeout(() => {
          food.disabled = false;
          food.classList.remove("eaten");
        }, 4500);
      }, 700);
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
