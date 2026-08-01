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
        restAction: document.getElementById("restAction")
      };
    }

    init() {
      this.character = new JuniorCharacter(document.getElementById("junior"));
      this.character.onInteract = () => {
        this.changeNeed("happiness", 1);
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
      this.dom.playBtn.addEventListener("click", () => this.startNewGame());
      this.dom.continueBtn.addEventListener("click", () => this.continueGame());
      this.dom.settingsBtn.addEventListener("click", () => this.showScreen("settingsScreen"));
      this.dom.settingsBack.addEventListener("click", () => this.showScreen("menuScreen"));
      this.dom.backToMenu.addEventListener("click", () => {
        this.persist();
        this.showScreen("menuScreen");
      });

      document.querySelectorAll("[data-room]").forEach((button) => {
        button.addEventListener("click", () => this.changeRoom(button.dataset.room));
      });

      document.querySelectorAll("[data-action]").forEach((button) => {
        button.addEventListener("click", () => this.performRoomAction(button.dataset.action));
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
      this.persist();
      this.showMessage("La Casa Viva de Junior está lista.");
    }

    continueGame() {
      this.save = GameStorage.load();
      this.render();
      this.showScreen("gameScreen");
      this.startNeedLoop();
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
          primary: ["Dar comida", () => this.feedJunior()],
          secondary: ["Dar agua", () => this.giveWater()],
          care: ["Cocinar", () => this.cookForJunior()],
          rest: ["Probar fruta", () => this.giveFruit()]
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
      this.render();
      this.persist();
    }

    toggleTv() {
      this.tvOn = !this.tvOn;
      this.dom.gameScreen.classList.toggle("tv-on", this.tvOn);
      this.character.setState("surprised", 700);
      this.showMessage(this.tvOn ? "Junior está viendo la televisión." : "La televisión se apagó.");
      this.spawnStars(5);
    }

    playWithJunior() {
      this.changeNeed("happiness", 18);
      this.changeNeed("sleep", -3);
      this.character.setState("happy", 1500);
      this.spawnStars(9);
      this.showMessage("Junior se divirtió mucho.");
    }

    petJunior() {
      this.changeNeed("happiness", 7);
      this.character.pet();
      this.showMessage("Junior recibió una caricia.");
    }

    restJunior() {
      this.changeNeed("sleep", 9);
      this.character.setState("tired", 1200);
      this.showMessage("Junior descansó un momento.");
    }

    feedJunior() {
      if (this.save.coins < 5) {
        this.showMessage("No tienes suficientes monedas.");
        return;
      }
      this.save.coins -= 5;
      this.changeNeed("hunger", 20);
      this.character.setState("happy", 1400);
      this.spawnSteam(4, 56, 45);
      this.showMessage("Junior comió y quedó satisfecho.");
    }

    giveWater() {
      this.changeNeed("hunger", 5);
      this.changeNeed("happiness", 3);
      this.spawnBubbles(7, 53, 52);
      this.character.setState("happy", 900);
      this.showMessage("Junior tomó agua fresca.");
    }

    cookForJunior() {
      this.spawnSteam(7, 70, 45);
      this.character.setState("surprised", 900);
      this.showMessage("La cocina huele delicioso.");
    }

    giveFruit() {
      this.changeNeed("hunger", 10);
      this.spawnStars(5);
      this.character.setState("happy", 1100);
      this.showMessage("Junior probó fruta.");
    }

    batheJunior() {
      this.changeNeed("hygiene", 28);
      this.spawnBubbles(14, 70, 58);
      this.character.setState("surprised", 1100);
      this.showMessage("Junior quedó limpio y fresco.");
    }

    brushJunior() {
      this.changeNeed("hygiene", 9);
      this.spawnStars(5);
      this.character.pet();
      this.showMessage("Junior quedó bien arreglado.");
    }

    dryJunior() {
      this.character.setState("happy", 1000);
      this.spawnStars(7);
      this.showMessage("Junior quedó completamente seco.");
    }

    relaxJunior() {
      this.changeNeed("happiness", 5);
      this.changeNeed("sleep", 5);
      this.spawnBubbles(8, 52, 54);
      this.character.setState("tired", 1200);
      this.showMessage("Junior se relajó en el baño.");
    }

    sleepJunior() {
      this.changeNeed("sleep", 30);
      this.character.setState("sleeping");
      this.dom.gameScreen.classList.add("is-night");
      this.showMessage("Junior está durmiendo.");
      window.setTimeout(() => {
        if (this.character.state === "sleeping") this.character.setState("neutral");
      }, 6500);
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
      this.character.setState("surprised", 900);
      this.showMessage("Junior despertó.");
    }

    changeRoom(room) {
      const rooms = ["living", "kitchen", "bathroom", "bedroom"];
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

    render() {
      this.dom.coins.textContent = this.save.coins;
      this.dom.diamonds.textContent = this.save.diamonds;
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
    }

    updateSettings() {
      this.save.settings = {
        music: this.dom.musicToggle.checked,
        sound: this.dom.soundToggle.checked,
        reducedMotion: this.dom.motionToggle.checked
      };
      this.character.setReducedMotion(this.save.settings.reducedMotion);
      this.persist();
    }

    persist() {
      GameStorage.save(this.save);
    }
  }

  window.JuniorGame = JuniorGame;
})();
