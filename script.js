(function () {
  "use strict";

  /* ============================================================
     UTIL
     ============================================================ */
  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }
  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }
  function wait(ms) {
    return new Promise(function (res) {
      setTimeout(res, prefersReducedMotion ? Math.min(ms, 60) : ms);
    });
  }

  /* ============================================================
     SCENE / STATE MANAGEMENT
     ============================================================ */
  var sceneOrder = [
    "opening",
    "envelope",
    "letter",
    "thankyou",
    "prayer",
    "secret",
    "birthday",
    "lastthing",
    "final",
  ];
  var scenes = {};
  sceneOrder.forEach(function (name) {
    scenes[name] = qs('[data-scene="' + name + '"]');
  });
  var currentScene = "opening";

  function hideScene(name) {
    var el = scenes[name];
    if (!el) return;
    el.classList.remove("is-active");
    el.style.visibility = "hidden";
    el.style.pointerEvents = "none";
  }

  function showScene(name, onEnter) {
    var next = scenes[name];
    var prev = scenes[currentScene];
    if (!next || next === prev) return;

    if (prev) {
      prev.classList.add("scene-exit");
      prev.classList.remove("is-active");
    }

    setTimeout(
      function () {
        if (prev) hideScene(currentScene);
        if (prev) prev.classList.remove("scene-exit");
        next.style.visibility = "";
        next.style.pointerEvents = "";
        next.classList.add("is-active");
        next.scrollTop = 0;
        currentScene = name;
        if (typeof onEnter === "function") onEnter();
      },
      prefersReducedMotion ? 0 : 250,
    );
  }

  function transitionToScene(name, onEnter) {
    showScene(name, onEnter);
  }

  /* ============================================================
     MUSIC
     ============================================================ */
  var music = qs("#backgroundMusic");
  var musicToggle = qs("#musicToggle");
  var musicIcon = qs("#musicIcon");
  var musicStarted = false;
  var musicMuted = false;
  
  function startMusic() {
    if (!music || musicStarted) return;

    music.volume = 0;

    var p = music.play();

    if (p && typeof p.then === "function") {
      p.then(function () {
        musicStarted = true;
        fadeMusic(0.32, 2000);
      }).catch(function (error) {
        console.log("Music playback failed:", error);
        musicStarted = false;
      });
    } else {
      musicStarted = true;
      fadeMusic(0.32, 2000);
    }
  }

  function fadeMusic(target, duration) {
    if (musicMuted) target = 0;
    var start = music.volume;
    var startTime = performance.now();
    function step(now) {
      var t = Math.min(1, (now - startTime) / duration);
      music.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function toggleMusic() {
    musicMuted = !musicMuted;
    if (musicMuted) {
      fadeMusic(0, 400);
      musicIcon.innerHTML = "&#128263;";
      musicToggle.setAttribute("aria-label", "Play background music");
      musicToggle.setAttribute("aria-pressed", "true");
    } else {
      if (!musicStarted) startMusic();
      fadeMusic(targetVolumeForScene(currentScene), 400);
      musicIcon.innerHTML = "&#128266;";
      musicToggle.setAttribute("aria-label", "Mute background music");
      musicToggle.setAttribute("aria-pressed", "false");
    }
  }

  function targetVolumeForScene(scene) {
    if (scene === "prayer" || scene === "secret") return 0.16;
    if (scene === "birthday") return 0.42;
    return 0.32;
  }

  musicToggle.addEventListener("click", toggleMusic);

  /* ============================================================
     DECORATIVE EFFECTS: petals, sparkles, confetti
     ============================================================ */
  var fxLayer = qs("#fxLayer");
  var MAX_FX = 36;

  function createPetal() {
    if (prefersReducedMotion) return;
    if (fxLayer.childElementCount > MAX_FX) return;
    var el = document.createElement("div");
    el.className = "fx-petal";
    var startX = Math.random() * 100;
    var drift = Math.random() * 120 - 60 + "px";
    var duration = 9 + Math.random() * 6;
    el.style.left = startX + "vw";
    el.style.setProperty("--drift", drift);
    el.style.animationDuration = duration + "s";
    el.style.transform = "scale(" + (0.6 + Math.random() * 0.8) + ")";
    fxLayer.appendChild(el);
    setTimeout(
      function () {
        el.remove();
      },
      duration * 1000 + 200,
    );
  }

  function createSparkle(xVw, yVh) {
    if (prefersReducedMotion) return;
    if (fxLayer.childElementCount > MAX_FX) return;
    var el = document.createElement("div");
    el.className = "fx-sparkle";
    el.style.left = xVw + "vw";
    el.style.top = yVh + "vh";
    var duration = 1.2 + Math.random() * 0.8;
    el.style.animationDuration = duration + "s";
    fxLayer.appendChild(el);
    setTimeout(
      function () {
        el.remove();
      },
      duration * 1000 + 100,
    );
  }

  function sparkleBurst(count) {
    for (var i = 0; i < count; i++) {
      (function (i) {
        setTimeout(function () {
          createSparkle(35 + Math.random() * 30, 24 + Math.random() * 22);
        }, i * 90);
      })(i);
    }
  }

  var confettiColors = ["#C7702E", "#B8965A", "#D6B98C", "#F7F0E6", "#5A3A2E"];

  function createConfettiPiece() {
    if (prefersReducedMotion) return;
    if (fxLayer.childElementCount > MAX_FX) return;
    var el = document.createElement("div");
    el.className = "fx-confetti";
    var startX = Math.random() * 100;
    var drift = Math.random() * 160 - 80 + "px";
    var duration = 3.5 + Math.random() * 2.5;
    el.style.left = startX + "vw";
    el.style.setProperty("--drift", drift);
    el.style.animationDuration = duration + "s";
    el.style.background =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    el.style.transform = "rotate(" + Math.random() * 360 + "deg)";
    fxLayer.appendChild(el);
    setTimeout(
      function () {
        el.remove();
      },
      duration * 1000 + 200,
    );
  }

  var petalInterval = null;
  function startAmbientPetals() {
    if (prefersReducedMotion || petalInterval) return;
    petalInterval = setInterval(createPetal, 2600);
    createPetal();
  }
  function stopAmbientPetals() {
    if (petalInterval) {
      clearInterval(petalInterval);
      petalInterval = null;
    }
  }

  var confettiInterval = null;
  function createConfetti(durationMs) {
    if (prefersReducedMotion || confettiInterval) return;
    var elapsed = 0,
      tick = 140;
    confettiInterval = setInterval(function () {
      createConfettiPiece();
      createConfettiPiece();
      elapsed += tick;
      if (elapsed >= durationMs) {
        clearInterval(confettiInterval);
        confettiInterval = null;
      }
    }, tick);
  }

  function cleanupEffects() {
    stopAmbientPetals();
    if (confettiInterval) {
      clearInterval(confettiInterval);
      confettiInterval = null;
    }
    fxLayer.innerHTML = "";
  }

  /* ============================================================
     SEQUENTIAL REVEAL HELPER
     ============================================================ */
  function revealSequentially(container, selector, stepMs, startDelay) {
    var items = qsa(selector, container);
    items.forEach(function (el, i) {
      setTimeout(
        function () {
          el.classList.add("is-shown");
        },
        (startDelay || 0) + i * (stepMs || 350),
      );
    });
    return items.length * (stepMs || 350) + (startDelay || 0);
  }

  /* ============================================================
     SCENE: OPENING
     ============================================================ */
  var openGiftBtn = qs("#openGiftBtn");
  openGiftBtn.addEventListener("click", function () {
    openGiftBtn.classList.add("is-shown");
    openGiftBtn.style.opacity = "0";
    startMusic();
    startAmbientPetals();
    transitionToScene("envelope");
  });

  /* ============================================================
     SCENE: ENVELOPE
     ============================================================ */
  var envelopeWrap = qs("#envelopeWrap");
  var envelopeEl = qs("#envelope");
  var envelopeFlap = qs("#envelopeFlap");
  var envelopeSeal = qs("#envelopeSeal");
  var envelopeLetterPeek = qs("#envelopeLetterPeek");
  var tapPrompt = qs("#tapPrompt");
  var envelopeOpened = false;

  function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    envelopeWrap.classList.add("opening");
    envelopeEl.classList.add("settled");

    (async function () {
      await wait(500);
      envelopeSeal.classList.add("releasing");
      await wait(550);
      envelopeFlap.classList.add("open");
      await wait(900);
      envelopeLetterPeek.classList.add("rising");
      await wait(700);
      envelopeLetterPeek.classList.add("rising-more");
      await wait(500);
      envelopeWrap.classList.add("retreat");
      await wait(750);
      transitionToScene("letter", animateLetter);
    })();
  }

  tapPrompt.addEventListener("click", openEnvelope);
  envelopeEl.addEventListener("click", openEnvelope);
  envelopeEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openEnvelope();
    }
  });

  /* ============================================================
     SCENE: LETTER
     ============================================================ */
  function animateLetter() {
    var body = qs("#letterBody");
    var total = revealSequentially(body, "p", 480, 350);
    setTimeout(function () {
      qs("#scene-letter .paper-continue").classList.add("is-shown");
    }, total + 300);
  }

  /* ============================================================
     GENERIC CONTINUE ROUTING
     ============================================================ */
  qsa("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      routeTo(btn.getAttribute("data-next"));
    });
  });

  function routeTo(next) {
    if (next === "thankyou") transitionToScene("thankyou", showThankYou);
    else if (next === "prayer") transitionToScene("prayer", showPrayer);
    else if (next === "secret")
      transitionToScene("secret", startSecretTransition);
    else if (next === "lastthing")
      transitionToScene("lastthing", function () {
        stopAmbientPetals();
      });
  }

  /* ============================================================
     SCENE: THANK YOU
     ============================================================ */
  function showThankYou() {
    var lines = qs("#thankyouLines");
    var lineDelay = revealSequentially(lines, ".thankyou-line", 500, 900);
    var body = qs("#thankyouBody");
    setTimeout(function () {
      body.classList.add("is-shown");
    }, lineDelay + 200);
    var btn = qs("#scene-thankyou .btn--ghost");
    setTimeout(function () {
      btn.classList.add("is-shown");
    }, lineDelay + 900);
    setTimeout(function () {
      sparkleBurst(6);
    }, lineDelay + 200);
  }

  /* ============================================================
     SCENE: PRAYER (calmest)
     ============================================================ */
  function showPrayer() {
    fadeMusic(targetVolumeForScene("prayer"), 1800);
    stopAmbientPetals();
    var body = qs("#prayerBody");
    var pDelay = revealSequentially(body, "p", 900, 2800);
    body.classList.add("is-shown");
    setTimeout(function () {
      qs("#prayerAmen").classList.add("is-shown");
    }, pDelay + 500);
    setTimeout(function () {
      qs("#prayerContinueBtn").classList.add("is-shown");
    }, pDelay + 1300);
  }

  /* ============================================================
     SCENE: SECRET TRANSITION
     ============================================================ */
  function startSecretTransition() {
    fadeMusic(0.1, 2000);
    var glow = qs("#secretGlow");
    var line = qs("#secretLine");

    (async function () {
      await wait(900);
      glow.classList.add("glowing");
      await wait(1600);
      if (!prefersReducedMotion) {
        for (var i = 0; i < 3; i++) {
          createSparkle(45 + Math.random() * 10, 42 + Math.random() * 10);
          await wait(500);
        }
        createPetal();
        await wait(500);
        createPetal();
      }
      await wait(900);
      line.classList.add("is-shown");
      await wait(2600);
      transitionToScene("birthday", showBirthdayReveal);
    })();
  }

  /* ============================================================
     SCENE: BIRTHDAY REVEAL + CELEBRATION
     ============================================================ */
  function showBirthdayReveal() {
    var stage = qs("#stage");
    stage.style.background =
      "radial-gradient(ellipse at 50% 25%, #FCEBD1, #F3B98B 65%, #E8875A 130%)";
    fadeMusic(targetVolumeForScene("birthday"), 2200);

    (async function () {
      await wait(400);
      qs("#wordHappy").classList.add("is-shown");
      await wait(1100);
      qs("#wordBirthday").classList.add("is-shown");
      await wait(1200);
      qs("#wordMummy").classList.add("is-shown");
      sparkleBurst(12);
      createConfetti(prefersReducedMotion ? 0 : 4500);
      startAmbientPetals();
      await wait(900);
      qs("#revealDate").classList.add("is-shown");
      await wait(900);
      var total = revealSequentially(qs("#birthdayBody"), "p", 550, 0);
      await wait(total + 400);
      qs("#scene-birthday .birthday-continue").classList.add("is-shown");
    })();
  }

  /* ============================================================
     SCENE: ONE LAST THING -> FINAL
     ============================================================ */
  var openLastBtn = qs("#openLastBtn");
  openLastBtn.addEventListener("click", function () {
    openLastBtn.style.opacity = "0";
    transitionToScene("final", showFinal);
  });

  function showFinal() {
    var stage = qs("#stage");
    stage.style.background =
      "linear-gradient(180deg, var(--ivory), var(--cream))";
    fadeMusic(targetVolumeForScene("final"), 2200);
    stopAmbientPetals();
    startAmbientPetals();

    var body = qs("#finalBody");
    var total = revealSequentially(body, "p", 550, 300);
    setTimeout(function () {
      qs("#finalSignature").classList.add("is-shown");
    }, total + 500);
  }

  /* ============================================================
     INIT
     ============================================================ */
  sceneOrder.forEach(function (name) {
    if (name !== "opening") hideScene(name);
  });
})();
