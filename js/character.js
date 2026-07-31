(() => {
  class JuniorCharacter {
    constructor(element) {
      if (!element) throw new Error("No se encontró el elemento de Junior.");

      this.element = element;
      this.state = "neutral";
      this.blinkTimer = null;
      this.idleTimer = null;
      this.touchCount = 0;
      this.touchResetTimer = null;
      this.reducedMotion = false;
      this.onInteract = null;

      this.bindEvents();
      this.scheduleBlink();
      this.scheduleIdleEmotion();
    }

    bindEvents() {
      this.element.addEventListener("pointermove", (event) => this.lookAt(event));
      this.element.addEventListener("pointerleave", () => this.resetLook());
      this.element.addEventListener("pointerdown", () => this.handleTouch());
      this.element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.handleTouch();
        }
      });
    }

    setReducedMotion(enabled) {
      this.reducedMotion = Boolean(enabled);
      document.body.classList.toggle("reduced-motion", this.reducedMotion);
    }

    lookAt(event) {
      if (this.reducedMotion || this.state === "sleeping") return;

      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.42;
      const x = Math.max(-8, Math.min(8, (event.clientX - centerX) / 18));
      const y = Math.max(-6, Math.min(6, (event.clientY - centerY) / 22));

      this.element.style.setProperty("--look-x", `${x}px`);
      this.element.style.setProperty("--look-y", `${y}px`);
    }

    resetLook() {
      this.element.style.setProperty("--look-x", "0px");
      this.element.style.setProperty("--look-y", "0px");
    }

    setState(state, duration = 0) {
      const valid = [
        "neutral",
        "happy",
        "sad",
        "tired",
        "hungry",
        "surprised",
        "annoyed",
        "sleeping"
      ];

      this.state = valid.includes(state) ? state : "neutral";
      this.element.dataset.state = this.state;

      if (duration > 0) {
        window.clearTimeout(this.stateTimer);
        this.stateTimer = window.setTimeout(() => {
          if (this.state !== "sleeping") this.setState("neutral");
        }, duration);
      }
    }

    handleTouch() {
      if (this.state === "sleeping") {
        this.setState("surprised", 1200);
      } else {
        this.touchCount += 1;

        if (this.touchCount >= 5) {
          this.setState("annoyed", 1800);
          this.touchCount = 0;
        } else {
          this.setState("happy", 1100);
        }
      }

      this.element.classList.remove("touch-bounce");
      void this.element.offsetWidth;
      this.element.classList.add("touch-bounce");

      window.clearTimeout(this.touchResetTimer);
      this.touchResetTimer = window.setTimeout(() => {
        this.touchCount = 0;
      }, 3500);

      if (typeof this.onInteract === "function") {
        this.onInteract(this.state);
      }
    }

    blink() {
      if (this.state === "sleeping") return;

      this.element.classList.add("blink");
      window.setTimeout(() => {
        this.element.classList.remove("blink");
      }, 150);
    }

    scheduleBlink() {
      window.clearTimeout(this.blinkTimer);
      const delay = 2200 + Math.random() * 4200;

      this.blinkTimer = window.setTimeout(() => {
        this.blink();
        this.scheduleBlink();
      }, delay);
    }

    scheduleIdleEmotion() {
      window.clearTimeout(this.idleTimer);

      this.idleTimer = window.setTimeout(() => {
        if (this.state === "neutral") {
          const states = ["neutral", "neutral", "happy", "surprised"];
          const next = states[Math.floor(Math.random() * states.length)];
          this.setState(next, next === "neutral" ? 0 : 1100);
        }
        this.scheduleIdleEmotion();
      }, 6500 + Math.random() * 4500);
    }
  }

  window.JuniorCharacter = JuniorCharacter;
})();
