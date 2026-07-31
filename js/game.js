(() => {
  class JuniorGame {
    constructor() {
      this.save = GameStorage.load();
      this.character = null;
      this.needTimer = null;
      this.messageTimer = null;
      this.started = false;

      this.dom = {
        screens: [...document.querySelectorAll(".screen")],
        loadingScreen: document.getElementById("loadingScreen"),
        menuScreen: document.getElementById("menuScreen"),
        gameScreen: document.getElementById("gameScreen"),
        settingsScreen: document.getElementById("settingsScreen"),
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
        motionToggle: document.getElementById("motionToggle")
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
        button.addEventListener("click", () => this.performAction(button.dataset.action));
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
        "Organizando su habitación...",
        "Cargando emociones naturales...",
        "Todo listo."
      ];

      const timer = window.setInterval(() => {
        progress += 8 + Math.random() * 12;
        progress = Math.min(100, progress);
        this.dom.loadingBar.style.width = `${progress}%`;
        this.dom.loadingText.textContent = messages[Math.min(messages.length - 1, Math.floor(progress / 26))];

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
      this.started = true;
      this.render();
      this.character.setState("happy", 1400);
      this.showScreen("gameScreen");
      this.startNeedLoop();
      this.persist();
      this.showMessage("Bienvenido a Junior Pocket Adventure.");
    }

    continueGame() {
      this.save = GameStorage.load();
      this.started = true;
      this.render();
      this.showScreen("gameScreen");
      this.startNeedLoop();
      this.showMessage("Junior se alegra de verte.");
      this.character.setState("happy", 1400);
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

    performAction(action) {
      const actions = {
        feed: () => {
          this.changeNeed("hunger", 18);
          this.save.coins = Math.max(0, this.save.coins - 5);
          this.character.setState("happy", 1300);
          this.showMessage("Junior comió y quedó satisfecho.");
        },
        clean: () => {
          this.changeNeed("hygiene", 25);
          this.character.setState("surprised", 1200);
          this.showMessage("Junior quedó limpio.");
        },
        play: () => {
          this.changeNeed("happiness", 20);
          this.changeNeed("sleep", -4);
          this.character.setState("happy", 1600);
          this.showMessage("Junior se divirtió contigo.");
        },
        sleep: () => {
          this.changeNeed("sleep", 28);
          this.character.setState("sleeping");
          this.showMessage("Junior está descansando.");

          window.setTimeout(() => {
            this.character.setState("neutral");
          }, 4500);
        }
      };

      actions[action]?.();
      this.render();
      this.persist();
    }

    changeRoom(room) {
      const rooms = ["living", "kitchen", "bathroom", "bedroom"];
      if (!rooms.includes(room)) return;

      this.save.room = room;
      this.dom.gameScreen.className = `screen game-screen active ${room}-room`;

      document.querySelectorAll("[data-room]").forEach((button) => {
        button.classList.toggle("active", button.dataset.room === room);
      });

      const roomNames = {
        living: "Sala",
        kitchen: "Cocina",
        bathroom: "Baño",
        bedroom: "Dormitorio"
      };

      const roomMessages = {
        living: "La sala está lista para jugar y descansar.",
        kitchen: "La cocina está preparada para alimentar a Junior.",
        bathroom: "El baño está listo para mantenerlo limpio.",
        bedroom: "El dormitorio está preparado para descansar."
      };

      this.character.setState("surprised", 650);
      this.showMessage(roomMessages[room] || `Ahora estás en: ${roomNames[room]}.`);
      this.persist();
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
