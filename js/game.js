(() => {
  class JuniorGame {
    constructor() {
      this.save = GameStorage.load();
      this.character = null;
      this.needTimer = null;
      this.clockTimer = null;
      this.idleYawnTimer = null;
      this.messageTimer = null;
      this.tvOn = false;
      this.draggedFood = null;
      this.dragPointerId = null;
      this.foodOrigin = null;

      this.dom = {
        screens: [...document.querySelectorAll(".screen")],
        loadingScreen: document.getElementById("loadingScreen"),
        menuScreen: document.getElementById("menuScreen"),
        gameScreen: document.getElementById("gameScreen"),
        settingsScreen: document.getElementById("settingsScreen"),
        room: document.querySelector(".room"),
        playBtn: document.getElementById("playBtn"),
        continueBtn: document.getElementById("continueBtn"),
        settingsBtn: document.getElementById("settingsBtn"),
        settingsBack: document.getElementById("settingsBack"),
        backToMenu: document.getElementById("backToMenu"),
        loadingBar: document.getElementById("loadingBar"),
        loadingText: document.getElementById("loadingText"),
        coins: document.getElementById("coins"),
        diamonds: document.getElementById("diamonds"),
        message: document.getElementById("message"),
        musicToggle: document.getElementById("musicToggle"),
        soundToggle: document.getElementById("soundToggle"),
        motionToggle: document.getElementById("motionToggle"),
        digitalClock: document.getElementById("digitalClock"),
        roomParticles: document.getElementById("roomParticles"),
        roomActionEffect: document.getElementById("roomActionEffect"),
        primaryAction: document.getElementById("primaryAction"),
        secondaryAction: document.getElementById("secondaryAction"),
        careAction: document.getElementById("careAction"),
        restAction: document.getElementById("restAction"),
        soundButton: document.getElementById("soundButton"),
        touchHearts: document.getElementById("touchHearts"),
        fridgeHotspot: document.getElementById("fridgeHotspot"),
        fridgeInventory: document.getElementById("fridgeInventory"),
        closeFridge: document.getElementById("closeFridge"),
        mouthDropTarget: document.getElementById("mouthDropTarget")
      };
    }

    init() {
      this.character = new JuniorCharacter(document.getElementById("junior"));
      this.character.onInteract = () => {
        this.changeNeed("happiness", 1);
        this.spawnHearts(4);
        AudioEngine.play("pet");
        this.showMessage("Junior disfruta tu atención.");
      };

      this.bindEvents();
      this.applySettings();
      this.render();
      this.runLoading();
      this.startClock();
      this.scheduleIdleYawn();
    }

    bindEvents() {
      const unlockAudio = () => {
        AudioEngine.unlock();
        document.removeEventListener("pointerdown", unlockAudio);
      };
      document.addEventListener("pointerdown", unlockAudio, { once: true });

      this.dom.playBtn.addEventListener("click", async () => {
        await AudioEngine.unlock();
        AudioEngine.play("tap");
        this.startNewGame();
      });
      this.dom.continueBtn.addEventListener("click", () => this.continueGame());
      this.dom.settingsBtn.addEventListener("click", () => this.showScreen("settingsScreen"));
      this.dom.settingsBack.addEventListener("click", () => this.showScreen("menuScreen"));
      this.dom.soundButton.addEventListener("click", async () => {
        await AudioEngine.unlock();
        this.save.settings.sound = !this.save.settings.sound;
        this.save.settings.music = this.save.settings.sound;
        this.applySettings();
        if (this.save.settings.sound || this.save.settings.music) {
          AudioEngine.startAmbient(this.save.room || "living");
          AudioEngine.play("wake");
        }
        this.persist();
      });

      this.dom.backToMenu.addEventListener("click", () => {
        AudioEngine.stopSnoring();
        this.persist();
        this.showScreen("menuScreen");
      });

      document.querySelectorAll("[data-room]").forEach((button) => {
        button.addEventListener("click", () => this.changeRoom(button.dataset.room));
      });

      this.dom.fridgeHotspot?.addEventListener("click", async () => {
        await AudioEngine.unlock();
        this.openFridge();
      });

      this.dom.closeFridge?.addEventListener("click", () => this.closeFridge());

      document.querySelectorAll(".food-item").forEach((item) => {
        item.addEventListener("pointerdown", (event) => this.startFoodDrag(event, item));
      });

      document.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", async () => {
          await AudioEngine.unlock();
          this.performRoomAction(button.dataset.action);
        });
      });

      this.dom.musicToggle.addEventListener("change", () => this.updateSettings());
      this.dom.soundToggle.addEventListener("change", () => this.updateSettings());
      this.dom.motionToggle.addEventListener("change", () => this.updateSettings());

      window.addEventListener("beforeunload", () => this.persist());
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.persist();
      });
    }

    runLoading() {
      let progress = 0;
      const messages = [
        "Preparando a Junior...",
        "Encendiendo la casa...",
        "Ajustando la hora del día...",
        "Todo listo."
      ];

      const timer = window.setInterval(() => {
        progress += 8 + Math.random() * 12;
        progress = Math.min(100, progress);
        this.dom.loadingBar.style.width = `${progress}%`;
        this.dom.loadingText.textContent =
          messages[Math.min(messages.length - 1, Math.floor(progress / 26))];

        if (progress >= 100) {
          window.clearInterval(timer);
          window.setTimeout(() => this.showScreen("menuScreen"), 350);
        }
      }, 120);
    }

    showScreen(id) {
      this.dom.screens.forEach((screen) => {
        screen.classList.toggle("active", screen.id === id);
      });
    }

    startNewGame() {
      this.save = JSON.parse(JSON.stringify(GameStorage.defaults));
      this.render();
      this.character.setState("happy", 1400);
      this.showScreen("gameScreen");
      this.startNeedLoop();
      AudioEngine.startAmbient(this.save.room || "living");
      this.persist();
      this.showMessage("La Casa Viva de Junior está lista.");
    }

    continueGame() {
      this.save = GameStorage.load();
      this.render();
      this.showScreen("gameScreen");
      this.startNeedLoop();
      AudioEngine.startAmbient(this.save.room || "living");
      this.showMessage("Junior se alegra de verte.");
      this.character.setState("happy", 1400);
    }

    startClock() {
      const update = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (this.dom.digitalClock) {
          this.dom.digitalClock.textContent =
            now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
        }

        const hourHand = document.querySelector(".clock-hour");
        const minuteHand = document.querySelector(".clock-minute");

        if (hourHand) {
          hourHand.style.transform =
            `translate(-50%,-100%) rotate(${(hours % 12) * 30 + minutes * .5}deg)`;
        }
        if (minuteHand) {
          minuteHand.style.transform =
            `translate(-50%,-100%) rotate(${minutes * 6}deg)`;
        }

        this.applyTimeOfDay(hours);
      };

      update();
      window.clearInterval(this.clockTimer);
      this.clockTimer = window.setInterval(update, 30000);
    }

    applyTimeOfDay(hour) {
      this.dom.gameScreen.classList.remove("is-day", "is-evening", "is-night");

      if (hour >= 7 && hour < 18) {
        this.dom.gameScreen.classList.add("is-day");
      } else if (hour >= 18 && hour < 21) {
        this.dom.gameScreen.classList.add("is-evening");
      } else {
        this.dom.gameScreen.classList.add("is-night");
      }
    }

    startNeedLoop() {
      window.clearInterval(this.needTimer);
      this.needTimer = window.setInterval(() => {
        this.changeNeed("hunger", -1);
        this.changeNeed("sleep", -1);
        this.changeNeed("hygiene", -1);
        this.changeNeed("happiness", -1);
        this.evaluateEmotion();
        this.persist();
      }, 30000);
    }

    scheduleIdleYawn() {
      window.clearTimeout(this.idleYawnTimer);
      this.idleYawnTimer = window.setTimeout(() => {
        const gameVisible = this.dom.gameScreen.classList.contains("active");
        if (gameVisible && this.character.state === "neutral" && Math.random() < .65) {
          this.character.yawn();
          AudioEngine.play("yawn");
        }
        this.scheduleIdleYawn();
      }, 12000 + Math.random() * 9000);
    }

    changeNeed(name, amount) {
      const current = Number(this.save.needs[name] || 0);
      this.save.needs[name] = Math.max(0, Math.min(100, current + amount));
      this.renderNeeds();
    }

    evaluateEmotion() {
      const n = this.save.needs;

      if (n.sleep <= 20) this.character.setState("tired");
      else if (n.hunger <= 20) this.character.setState("hungry");
      else if (n.happiness <= 20) this.character.setState("sad");
      else if (n.hygiene <= 15) this.character.setState("annoyed");
      else if (this.character.state !== "sleeping") this.character.setState("neutral");
    }

    getRoomActions(room) {
      return {
        living: {
          primary: ["Ver TV", () => this.toggleTv()],
          secondary: ["Jugar", () => this.playWithJunior()],
          care: ["Acariciar", () => this.petJunior()],
          rest: ["Descansar", () => this.restJunior()]
        },
        kitchen: {
          primary: ["Abrir refri", () => this.openFridge()],
          secondary: ["Dar agua", () => this.giveWater()],
          care: ["Cocinar", () => this.cookForJunior()],
          rest: ["Cerrar refri", () => this.closeFridge()]
        },
        bathroom: {
          primary: ["Bañar", () => this.batheJunior()],
          secondary: ["Cepillar", () => this.brushJunior()],
          care: ["Secar", () => this.dryJunior()],
          rest: ["Relajarse", () => this.relaxJunior()]
        },
        bedroom: {
          primary: ["Dormir", () => this.sleepJunior()],
          secondary: ["Apagar luz", () => this.toggleNight()],
          care: ["Despertar", () => this.wakeJunior()],
          rest: ["Bostezar", () => this.character.yawn()]
        }
      }[room];
    }

    updateActionLabels() {
      const actions = this.getRoomActions(this.save.room || "living");
      this.dom.primaryAction.textContent = actions.primary[0];
      this.dom.secondaryAction.textContent = actions.secondary[0];
      this.dom.careAction.textContent = actions.care[0];
      this.dom.restAction.textContent = actions.rest[0];
    }

    performRoomAction(actionName) {
      const actions = this.getRoomActions(this.save.room || "living");
      actions?.[actionName]?.[1]?.();

      // Solo actualiza HUD y economía. No vuelve a cargar el cuarto,
      // porque eso interrumpía las expresiones y el estado de dormir.
      this.renderEconomy();
      this.renderNeeds();
      this.persist();
    }

    openFridge() {
      if ((this.save.room || "living") !== "kitchen") {
        this.showMessage("El refrigerador solo está disponible en la cocina.");
        return;
      }

      this.dom.gameScreen.classList.add("fridge-open");
      this.dom.fridgeInventory?.setAttribute("aria-hidden", "false");
      AudioEngine.play("fridgeOpen");
      this.character.setState("surprised", 700);
      this.showMessage("Elige un alimento y arrástralo hasta la boca de Junior.");
    }

    closeFridge(playSound = true) {
      if (!this.dom.gameScreen.classList.contains("fridge-open")) return;
      this.dom.gameScreen.classList.remove("fridge-open");
      this.dom.fridgeInventory?.setAttribute("aria-hidden", "true");
      if (playSound) AudioEngine.play("fridgeClose");
    }

    startFoodDrag(event, item) {
      if ((this.save.room || "living") !== "kitchen") return;
      if (!this.dom.gameScreen.classList.contains("fridge-open")) return;
      if (item.classList.contains("food-used")) return;

      event.preventDefault();
      this.draggedFood = item;
      this.dragPointerId = event.pointerId;
      this.foodOrigin = {
        parent: item.parentElement,
        next: item.nextElementSibling
      };

      item.setPointerCapture?.(event.pointerId);
      item.classList.add("dragging");
      document.body.appendChild(item);
      this.moveFood(event);

      const move = (moveEvent) => {
        if (moveEvent.pointerId !== this.dragPointerId) return;
        this.moveFood(moveEvent);
      };

      const end = (endEvent) => {
        if (endEvent.pointerId !== this.dragPointerId) return;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        this.finishFoodDrag(endEvent);
      };

      window.addEventListener("pointermove", move, { passive: false });
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
    }

    moveFood(event) {
      if (!this.draggedFood) return;
      event.preventDefault?.();

      this.draggedFood.style.left = `${event.clientX}px`;
      this.draggedFood.style.top = `${event.clientY}px`;

      const juniorRect = this.character.element.getBoundingClientRect();
      const mouthX = juniorRect.left + juniorRect.width * .5;
      const mouthY = juniorRect.top + juniorRect.height * .625;
      const distance = Math.hypot(event.clientX - mouthX, event.clientY - mouthY);

      this.character.element.classList.toggle("food-near", distance < 115);

      const dx = Math.max(-9, Math.min(9, (event.clientX - mouthX) / 18));
      const dy = Math.max(-7, Math.min(7, (event.clientY - mouthY) / 22));
      this.character.element.style.setProperty("--gaze-x", `${dx}px`);
      this.character.element.style.setProperty("--gaze-y", `${dy}px`);

      if (Math.random() < .32) this.spawnFoodTrail(event.clientX, event.clientY);
    }

    finishFoodDrag(event) {
      if (!this.draggedFood) return;

      const item = this.draggedFood;
      const juniorRect = this.character.element.getBoundingClientRect();
      const mouthX = juniorRect.left + juniorRect.width * .5;
      const mouthY = juniorRect.top + juniorRect.height * .625;
      const distance = Math.hypot(event.clientX - mouthX, event.clientY - mouthY);

      this.character.element.classList.remove("food-near");
      this.character.element.style.setProperty("--gaze-x", "0px");
      this.character.element.style.setProperty("--gaze-y", "0px");

      if (distance < 105) {
        this.feedDraggedFood(item);
      } else {
        this.restoreFood(item);
      }

      this.draggedFood = null;
      this.dragPointerId = null;
    }

    restoreFood(item) {
      item.classList.remove("dragging");
      item.removeAttribute("style");

      if (this.foodOrigin?.next) {
        this.foodOrigin.parent.insertBefore(item, this.foodOrigin.next);
      } else {
        this.foodOrigin?.parent?.appendChild(item);
      }
    }

    feedDraggedFood(item) {
      const hunger = Number(item.dataset.hunger || 10);
      const name = item.dataset.name || "comida";

      item.classList.remove("dragging");
      item.style.left = "50%";
      item.style.top = "62%";
      item.style.transition = "transform .22s ease,opacity .22s ease";
      item.style.transform = "translate(-50%,-50%) scale(.45)";
      item.style.opacity = "0";

      this.character.element.classList.add("eating");
      AudioEngine.play("bite");

      window.setTimeout(() => {
        item.removeAttribute("style");
        item.classList.add("food-used");
        this.foodOrigin?.parent?.appendChild(item);

        this.changeNeed("hunger", hunger);
        this.changeNeed("happiness", 8);
        this.character.element.classList.remove("eating");
        this.character.element.classList.add("food-celebration");
        this.character.setState("happy", 1500);
        AudioEngine.play("happy");
        this.spawnStars(10);
        this.spawnHearts(5);
        this.renderNeeds();
        this.persist();
        this.showMessage(`Junior disfrutó la ${name}.`);

        window.setTimeout(() => {
          this.character.element.classList.remove("food-celebration");
        }, 950);

        window.setTimeout(() => {
          item.classList.remove("food-used");
        }, 7000);
      }, 700);
    }

    spawnFoodTrail(x, y) {
      const dot = document.createElement("span");
      dot.className = "food-trail";
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      document.body.appendChild(dot);
      window.setTimeout(() => dot.remove(), 550);
    }

    toggleTv() {
      this.tvOn = !this.tvOn;
      this.dom.gameScreen.classList.toggle("tv-on", this.tvOn);
      this.character.setState("surprised", 700);
      AudioEngine.play("tv");
      this.showMessage(this.tvOn ? "Junior está viendo la televisión." : "La televisión se apagó.");
      this.spawnStars(5);
    }

    playWithJunior() {
      this.changeNeed("happiness", 18);
      this.changeNeed("sleep", -3);
      this.character.setState("happy", 1500);
      this.spawnStars(9);
      AudioEngine.play("happy");
      this.showMessage("Junior se divirtió mucho.");
    }

    petJunior() {
      this.changeNeed("happiness", 7);
      this.character.pet();
      this.spawnHearts(5);
      AudioEngine.play("pet");
      this.showMessage("Junior recibió una caricia.");
    }

    restJunior() {
      this.changeNeed("sleep", 9);
      this.character.setState("tired", 1200);
      AudioEngine.play("sleep");
      this.showMessage("Junior descansó un momento.");
    }

    feedJunior() {
      if ((this.save.room || "living") !== "kitchen") {
        this.showMessage("Solo puedes dar comida dentro de la cocina.");
        return;
      }
      if (this.save.coins < 5) {
        this.showMessage("No tienes suficientes monedas.");
        return;
      }
      this.save.coins -= 5;
      this.changeNeed("hunger", 20);
      this.character.setState("happy", 1400);
      AudioEngine.play("eat");
      this.spawnSteam(4, 56, 45);
      this.showMessage("Junior comió y quedó satisfecho.");
    }

    giveWater() {
      this.changeNeed("hunger", 5);
      this.changeNeed("happiness", 3);
      this.spawnBubbles(7, 53, 52);
      AudioEngine.play("drink");
      this.character.setState("happy", 900);
      this.showMessage("Junior tomó agua fresca.");
    }

    cookForJunior() {
      this.spawnSteam(7, 70, 45);
      AudioEngine.play("eat");
      this.character.setState("surprised", 900);
      this.showMessage("La cocina huele delicioso.");
    }

    giveFruit() {
      this.changeNeed("hunger", 10);
      this.spawnStars(5);
      AudioEngine.play("happy");
      this.character.setState("happy", 1100);
      this.showMessage("Junior probó fruta.");
    }

    batheJunior() {
      this.changeNeed("hygiene", 28);
      this.spawnBubbles(14, 70, 58);
      AudioEngine.play("water");
      this.character.setState("surprised", 1100);
      this.showMessage("Junior quedó limpio y fresco.");
    }

    brushJunior() {
      this.changeNeed("hygiene", 9);
      this.spawnStars(5);
      AudioEngine.play("brush");
      this.character.pet();
      this.showMessage("Junior quedó bien arreglado.");
    }

    dryJunior() {
      this.character.setState("happy", 1000);
      this.character.shakeDry();
      AudioEngine.play("water");
      this.spawnStars(7);
      this.showMessage("Junior quedó completamente seco.");
    }

    relaxJunior() {
      this.changeNeed("happiness", 5);
      this.changeNeed("sleep", 5);
      this.spawnBubbles(8, 52, 54);
      AudioEngine.play("water");
      this.character.setState("tired", 1200);
      this.showMessage("Junior se relajó en el baño.");
    }

    sleepJunior() {
      this.changeNeed("sleep", 30);
      this.character.setState("sleeping");
      AudioEngine.play("sleep");
      AudioEngine.startSnoring();
      this.spawnSleepZ();
      this.dom.gameScreen.classList.add("is-night");
      this.showMessage("Junior cerró los ojos y está durmiendo.");

      window.clearTimeout(this.sleepTimer);
      this.sleepTimer = window.setTimeout(() => {
        AudioEngine.stopSnoring();
        if (this.character.state === "sleeping") {
          this.character.setState("neutral");
          AudioEngine.play("wake");
          this.showMessage("Junior terminó de descansar.");
        }
      }, 9000);
    }

    toggleNight() {
      this.dom.gameScreen.classList.toggle("is-night");
      this.showMessage(
        this.dom.gameScreen.classList.contains("is-night")
          ? "La luz quedó apagada."
          : "La luz quedó encendida."
      );
    }

    wakeJunior() {
      AudioEngine.stopSnoring();
      window.clearTimeout(this.sleepTimer);
      this.character.setState("surprised", 900);
      AudioEngine.play("wake");
      this.showMessage("Junior despertó.");
    }

    changeRoom(room) {
      const rooms = ["living", "kitchen", "bathroom", "bedroom"];
      if (room !== "bedroom") AudioEngine.stopSnoring();
      if (room !== "kitchen") this.closeFridge(false);
      if (!rooms.includes(room)) return;

      this.dom.room?.classList.add("room-changing");

      window.setTimeout(() => {
        this.save.room = room;
        const timeClasses = [...this.dom.gameScreen.classList]
          .filter((name) => name.startsWith("is-"));

        this.dom.gameScreen.className =
          `screen game-screen active ${room}-room ${timeClasses.join(" ")}`;

        document.querySelectorAll("[data-room]").forEach((button) => {
          button.classList.toggle("active", button.dataset.room === room);
        });

        this.updateActionLabels();
        AudioEngine.startAmbient(room);
        AudioEngine.play("room");
        this.character.setState("surprised", 550);
        this.dom.room?.classList.remove("room-changing");

        const messages = {
          living: "La sala está viva y lista para jugar.",
          kitchen: "La cocina está lista para alimentar a Junior.",
          bathroom: "El baño está preparado para cuidarlo.",
          bedroom: "El dormitorio está listo para descansar."
        };

        this.showMessage(messages[room]);
        this.persist();
      }, 180);
    }

    renderEconomy() {
      const previousCoins = this.dom.coins.textContent;
      const previousDiamonds = this.dom.diamonds.textContent;

      this.dom.coins.textContent = this.save.coins;
      this.dom.diamonds.textContent = this.save.diamonds;

      if (previousCoins !== String(this.save.coins)) {
        const card = this.dom.coins.closest(".currency");
        card?.classList.remove("bump");
        void card?.offsetWidth;
        card?.classList.add("bump");
      }

      if (previousDiamonds !== String(this.save.diamonds)) {
        const card = this.dom.diamonds.closest(".currency");
        card?.classList.remove("bump");
        void card?.offsetWidth;
        card?.classList.add("bump");
      }
    }

    render() {
      this.renderEconomy();
      this.dom.continueBtn.disabled = !GameStorage.hasSave();
      this.dom.continueBtn.style.opacity = GameStorage.hasSave() ? "1" : ".55";
      this.renderNeeds();
      this.changeRoom(this.save.room || "living");
    }

    renderNeeds() {
      const mapping = {
        hunger: ["hungerBar", "hungerText"],
        sleep: ["sleepBar", "sleepText"],
        hygiene: ["hygieneBar", "hygieneText"],
        happiness: ["happinessBar", "happinessText"]
      };

      Object.entries(mapping).forEach(([key, ids]) => {
        const value = Math.round(this.save.needs[key]);
        document.getElementById(ids[0]).style.width = `${value}%`;
        document.getElementById(ids[1]).textContent = `${value}%`;

        const card = document.getElementById(ids[0]).closest("article");
        card.classList.toggle("low", value <= 25);
        card.classList.toggle("medium", value > 25 && value <= 55);
      });
    }

    spawnStars(count = 6) {
      this.spawnEffect("action-star", count, 50, 58);
    }

    spawnBubbles(count = 8, left = 50, top = 55) {
      this.spawnEffect("action-bubble", count, left, top);
    }

    spawnSteam(count = 5, left = 55, top = 48) {
      this.spawnEffect("action-steam", count, left, top);
    }

    spawnEffect(className, count, left, top) {
      const host = this.dom.roomActionEffect;
      if (!host) return;

      for (let i = 0; i < count; i += 1) {
        const effect = document.createElement("span");
        effect.className = className;
        effect.style.left = `${left + (Math.random() - .5) * 22}%`;
        effect.style.top = `${top + (Math.random() - .5) * 12}%`;
        effect.style.setProperty("--drift", `${(Math.random() - .5) * 55}px`);
        host.appendChild(effect);
        window.setTimeout(() => effect.remove(), 3200);
      }
    }

    spawnHearts(count = 4) {
      const host = this.dom.touchHearts;
      if (!host) return;

      for (let i = 0; i < count; i += 1) {
        const heart = document.createElement("span");
        heart.className = "touch-heart";
        heart.style.left = `${45 + Math.random() * 18}%`;
        heart.style.top = `${50 + Math.random() * 12}%`;
        heart.style.setProperty("--drift", `${(Math.random() - .5) * 55}px`);
        host.appendChild(heart);
        window.setTimeout(() => heart.remove(), 1700);
      }
    }

    spawnSleepZ() {
      const host = this.dom.roomActionEffect;
      if (!host) return;

      [0, 650, 1300].forEach((delay, index) => {
        window.setTimeout(() => {
          const z = document.createElement("span");
          z.className = "sleep-z";
          z.textContent = "Z";
          z.style.fontSize = `${20 + index * 7}px`;
          host.appendChild(z);
          window.setTimeout(() => z.remove(), 2500);
        }, delay);
      });
    }

    showMessage(text) {
      window.clearTimeout(this.messageTimer);
      this.dom.message.textContent = text;
      this.dom.message.hidden = false;
      this.messageTimer = window.setTimeout(() => {
        this.dom.message.hidden = true;
      }, 2200);
    }

    applySettings() {
      const settings = this.save.settings;
      this.dom.musicToggle.checked = settings.music;
      this.dom.soundToggle.checked = settings.sound;
      this.dom.motionToggle.checked = settings.reducedMotion;
      this.character.setReducedMotion(settings.reducedMotion);
      AudioEngine.setMusicEnabled(settings.music);
      AudioEngine.setSfxEnabled(settings.sound);
      AudioEngine.setEnabled(settings.music || settings.sound);
      this.dom.soundButton.classList.toggle("muted", !(settings.music || settings.sound));
      this.dom.soundButton.textContent = (settings.music || settings.sound) ? "♪" : "×";
    }

    updateSettings() {
      this.save.settings = {
        music: this.dom.musicToggle.checked,
        sound: this.dom.soundToggle.checked,
        reducedMotion: this.dom.motionToggle.checked
      };
      this.character.setReducedMotion(this.save.settings.reducedMotion);
      AudioEngine.setMusicEnabled(this.save.settings.music);
      AudioEngine.setSfxEnabled(this.save.settings.sound);
      AudioEngine.setEnabled(this.save.settings.music || this.save.settings.sound);
      this.dom.soundButton.classList.toggle(
        "muted",
        !(this.save.settings.music || this.save.settings.sound)
      );
      this.persist();
    }

    persist() {
      GameStorage.save(this.save);
    }
  }

  window.JuniorGame = JuniorGame;
})();
