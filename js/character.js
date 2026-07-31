(() => {
  class JuniorCharacter {
    constructor(element) {
      if (!element) throw new Error("No se encontró el elemento de Junior.");

      this.element = element;
      this.state = "neutral";
      this.blinkTimer = null;
      this.idleTimer = null;
      this.stateTimer = null;
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

      const x = Math.max(-9, Math.min(9, (event.clientX - centerX) / 17));
      const y = Math.max(-7, Math.min(7, (event.clientY - centerY) / 21));

      this.element.style.setProperty("--gaze-x", `${x}px`);
      this.element.style.setProperty("--gaze-y", `${y}px`);

      const rig = this.element.querySelector(".vector-rig");
      if (rig && this.state === "neutral") {
        rig.style.transform = `translate(${x * 0.12}px, ${y * 0.07}px) rotate(${x * 0.025}deg)`;
      }
    }

    resetLook() {
      this.element.style.setProperty("--gaze-x", "0px");
      this.element.style.setProperty("--gaze-y", "0px");

      const rig = this.element.querySelector(".vector-rig");
      if (rig) rig.style.transform = "";
    }

    setState(state, duration = 0) {
      const validStates = [
        "neutral",
        "happy",
        "sad",
        "tired",
        "hungry",
        "surprised",
        "annoyed",
        "sleeping"
      ];

      window.clearTimeout(this.stateTimer);
      this.state = validStates.includes(state) ? state : "neutral";
      this.element.dataset.state = this.state;

      if (duration > 0) {
        this.stateTimer = window.setTimeout(() => {
          if (this.state !== "sleeping") this.setState("neutral");
        }, duration);
      }
    }

    handleTouch() {
      if (this.state === "sleeping") {
        this.setState("surprised", 1100);
      } else {
        this.touchCount += 1;

        if (this.touchCount >= 5) {
          this.setState("annoyed", 1600);
          this.touchCount = 0;
        } else {
          this.setState("happy", 1050);
        }
      }

      this.element.classList.remove("touch-bounce");
      void this.element.offsetWidth;
      this.element.classList.add("touch-bounce");

      window.clearTimeout(this.touchResetTimer);
      this.touchResetTimer = window.setTimeout(() => {
        this.touchCount = 0;
      }, 3300);

      if (typeof this.onInteract === "function") {
        this.onInteract(this.state);
      }
    }

    blink() {
      if (this.state === "sleeping") return;

      const closeEyes = () => {
        this.element.classList.add("blink");
        window.setTimeout(() => {
          this.element.classList.remove("blink");
        }, 92);
      };

      closeEyes();

      if (Math.random() < 0.16) {
        window.setTimeout(closeEyes, 205);
      }
    }

    scheduleBlink() {
      window.clearTimeout(this.blinkTimer);
      const delay = 2600 + Math.random() * 3900;

      this.blinkTimer = window.setTimeout(() => {
        this.blink();
        this.scheduleBlink();
      }, delay);
    }

    scheduleIdleEmotion() {
      window.clearTimeout(this.idleTimer);
      const delay = 7600 + Math.random() * 5000;

      this.idleTimer = window.setTimeout(() => {
        if (this.state === "neutral") {
          const roll = Math.random();

          if (roll < 0.58) {
            this.setState("neutral");
          } else if (roll < 0.82) {
            this.setState("happy", 850);
          } else {
            this.setState("surprised", 650);
          }
        }

        this.scheduleIdleEmotion();
      }, delay);
    }
  }

  window.JuniorCharacter = JuniorCharacter;
})();
