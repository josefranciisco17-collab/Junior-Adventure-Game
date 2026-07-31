(() => {
  const KEY = "juniorPocketAdventure.save.v1";

  const defaults = {
    coins: 1250,
    diamonds: 30,
    room: "living",
    needs: {
      hunger: 85,
      sleep: 70,
      hygiene: 80,
      happiness: 90
    },
    settings: {
      music: true,
      sound: true,
      reducedMotion: false
    },
    lastSavedAt: Date.now()
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function merge(base, stored) {
    return {
      ...base,
      ...stored,
      needs: { ...base.needs, ...(stored?.needs || {}) },
      settings: { ...base.settings, ...(stored?.settings || {}) }
    };
  }

  window.GameStorage = {
    defaults: clone(defaults),

    load() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return clone(defaults);
        return merge(clone(defaults), JSON.parse(raw));
      } catch (error) {
        console.warn("No se pudo leer el guardado:", error);
        return clone(defaults);
      }
    },

    save(data) {
      try {
        const payload = { ...data, lastSavedAt: Date.now() };
        localStorage.setItem(KEY, JSON.stringify(payload));
        return true;
      } catch (error) {
        console.warn("No se pudo guardar:", error);
        return false;
      }
    },

    hasSave() {
      return Boolean(localStorage.getItem(KEY));
    },

    reset() {
      localStorage.removeItem(KEY);
      return clone(defaults);
    }
  };
})();
