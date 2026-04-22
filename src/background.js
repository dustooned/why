// ✨ WHERE: background.js / background module
// WHAT: Owns the canvas animation, question visual presets, and mouse brightness behavior.
(function attachBackgroundModule() {
  const questionAssetsById = window.WhyManifest.questionAssetsById;
  const BRIGHTNESS_SETTINGS = {
    neutral: 0.5,
    easing: 0.08,
    topGlowBase: 0.06,
    topGlowRange: 0.68,
    bottomShadeBase: 0.28,
    bottomShadeRange: 0.16,
    minimumShade: 0.08
  };

  const GRAPHIC_SETTINGS = {
    sizeRatio: 2,
    mobileSizeRatio: 1.18,
    mobileBreakpoint: 720,
    narrowAspectThreshold: 0.82,
    baseOpacity: 0.34,
    fadeEasing: 0.08,
    xRatio: 0.5,
    yRatio: 0.42,
    mobileYRatio: 0.29,
    xOffset: 0,
    yOffset: 0,
    floatXAmplitude: 12,
    floatYAmplitude: 9,
    floatXSpeed: 0.9,
    floatYSpeed: 1.35,
    rotationDegrees: 3,
    rotationSpeed: 0.75
  };

  // 🌫️ WHERE: background.js / particle settings
  // WHAT: Controls how many floating points appear in the visual field.
  const particleCount = 90;

  // 🎨 WHERE: background.js / visual presets
  // WHAT: Gives each visual mode its own band colors, brightness, and motion.
  const visualPresets = {
    drift: {
      band: ["rgba(32, 106, 92, 0.05)", "rgba(0, 149, 255, 0.18)", "rgba(236, 212, 87, 0.06)"],
      particleAlpha: 0.28,
      bandSwing: 90,
      speedBoost: 1
    },
    ember: {
      band: ["rgba(103, 26, 23, 0.1)", "rgba(227, 79, 53, 0.26)", "rgba(255, 194, 91, 0.12)"],
      particleAlpha: 0.42,
      bandSwing: 72,
      speedBoost: 1.15
    },
    pulse: {
      band: ["rgba(72, 39, 18, 0.08)", "rgba(241, 102, 60, 0.26)", "rgba(247, 244, 237, 0.08)"],
      particleAlpha: 0.36,
      bandSwing: 110,
      speedBoost: 1.2
    },
    signal: {
      band: ["rgba(17, 79, 87, 0.08)", "rgba(93, 183, 168, 0.2)", "rgba(247, 244, 237, 0.07)"],
      particleAlpha: 0.32,
      bandSwing: 60,
      speedBoost: 0.95
    },
    veil: {
      band: ["rgba(43, 28, 58, 0.08)", "rgba(176, 114, 128, 0.18)", "rgba(245, 230, 197, 0.08)"],
      particleAlpha: 0.24,
      bandSwing: 48,
      speedBoost: 0.85
    }
  };

  // 🌌 WHERE: background.js / canvas background system
  // WHAT: Starts the full-screen animated canvas and returns controls for visual changes.
  function createBackgroundController(canvas) {
    const context = canvas.getContext("2d");
    const particles = [];
    const graphicCache = {};
    let width = 0;
    let height = 0;
    let time = 0;
    let pulse = 3;
    let brightness = BRIGHTNESS_SETTINGS.neutral;
    let targetBrightness = BRIGHTNESS_SETTINGS.neutral;
    let graphicOpacity = 0;
    let targetGraphicOpacity = 0;
    let activeGraphic = null;
    let activeVisual = visualPresets.drift;

    // 📐 WHERE: background.js / canvas sizing
    // WHAT: Matches the canvas resolution to the browser window and device pixel ratio.
    function resize() {
      const scale = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * scale);
      canvas.height = Math.floor(height * scale);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.imageSmoothingEnabled = false;
    }

    // 🌱 WHERE: background.js / particle setup
    // WHAT: Creates a fresh spread of particles across the current screen size.
    function seedParticles() {
      particles.length = 0;

      for (let index = 0; index < particleCount; index += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 1 + Math.random() * 3,
          speed: 0.25 + Math.random() * 0.8,
          drift: -0.5 + Math.random()
        });
      }
    }

    // 💡 WHERE: background.js / mouse brightness control
    // WHAT: Converts the mouse Y position into a smooth brightness target for the background.
    function setBrightnessFromPointer(pointerY) {
      const normalizedY = Math.min(Math.max(pointerY / Math.max(height, 1), 0), 1);
      targetBrightness = 1 - normalizedY;
    }

    // 🖼️ WHERE: background.js / graphic loader
    // WHAT: Loads and caches the PNG assigned to the active question.
    function getGraphic(questionId) {
      const manifestEntry = questionAssetsById[questionId];

      if (!questionId || !manifestEntry) {
        return null;
      }

      if (!graphicCache[questionId]) {
        const image = new Image();
        image.src = `assets/images/${manifestEntry.graphic}`;
        image.addEventListener("error", () => {
          console.warn(`Why could not load question graphic: assets/images/${manifestEntry.graphic}`);
        });
        graphicCache[questionId] = image;
      }

      return graphicCache[questionId];
    }

    // 🫥 WHERE: background.js / question graphic draw
    // WHAT: Draws the current question graphic with modular position, float, fade, and rotation controls.
    function drawQuestionGraphic() {
      if (!activeGraphic || !activeGraphic.complete || !activeGraphic.naturalWidth) {
        return;
      }

      graphicOpacity += (targetGraphicOpacity - graphicOpacity) * GRAPHIC_SETTINGS.fadeEasing;

      if (graphicOpacity <= 0.002) {
        return;
      }

      const shortestSide = Math.min(width, height);
      const aspectRatio = width / Math.max(height, 1);
      const isCompactViewport =
        width <= GRAPHIC_SETTINGS.mobileBreakpoint ||
        height <= GRAPHIC_SETTINGS.mobileBreakpoint ||
        aspectRatio <= GRAPHIC_SETTINGS.narrowAspectThreshold;
      const sizeRatio = isCompactViewport
        ? GRAPHIC_SETTINGS.mobileSizeRatio
        : GRAPHIC_SETTINGS.sizeRatio;
      const yRatio = isCompactViewport
        ? GRAPHIC_SETTINGS.mobileYRatio
        : GRAPHIC_SETTINGS.yRatio;
      const baseX = width * GRAPHIC_SETTINGS.xRatio + GRAPHIC_SETTINGS.xOffset;
      const baseY = height * yRatio + GRAPHIC_SETTINGS.yOffset;
      const graphicSize = shortestSide * sizeRatio;
      const driftX = Math.sin(time * GRAPHIC_SETTINGS.floatXSpeed) * GRAPHIC_SETTINGS.floatXAmplitude;
      const driftY = Math.cos(time * GRAPHIC_SETTINGS.floatYSpeed) * GRAPHIC_SETTINGS.floatYAmplitude;
      const rotationRadians = Math.sin(time * GRAPHIC_SETTINGS.rotationSpeed) * (GRAPHIC_SETTINGS.rotationDegrees * Math.PI / 180);

      context.save();
      context.imageSmoothingEnabled = false;
      context.translate(baseX + driftX, baseY + driftY);
      context.rotate(rotationRadians);
      context.globalAlpha = graphicOpacity * GRAPHIC_SETTINGS.baseOpacity;
      context.drawImage(
        activeGraphic,
        -graphicSize / 2,
        -graphicSize / 2,
        graphicSize,
        graphicSize
      );
      context.restore();
    }

    // 🎞️ WHERE: background.js / animation loop
    // WHAT: Paints the fading background, moving color band, drifting particles, and brightness wash.
    function draw() {
      time += 0.01;
      pulse *= 0.94;
      brightness += (targetBrightness - brightness) * BRIGHTNESS_SETTINGS.easing;

      context.fillStyle = "rgba(10, 9, 8, 0.24)";
      context.fillRect(0, 0, width, height);

      const bandY = height * 0.35 + Math.sin(time * 1.8) * activeVisual.bandSwing;
      const band = context.createLinearGradient(0, bandY - 120, width, bandY + 120);
      band.addColorStop(0, activeVisual.band[0]);
      band.addColorStop(0.5, activeVisual.band[1]);
      band.addColorStop(1, activeVisual.band[2]);
      context.fillStyle = band;
      context.fillRect(0, 0, width, height);

      if (pulse > 0.01) {
        context.fillStyle = `rgba(247, 244, 237, ${0.04 * pulse})`;
        context.fillRect(0, 0, width, height);
      }

      const glowAlpha = BRIGHTNESS_SETTINGS.topGlowBase + brightness * BRIGHTNESS_SETTINGS.topGlowRange;
      const shadeAlpha = BRIGHTNESS_SETTINGS.bottomShadeBase - brightness * BRIGHTNESS_SETTINGS.bottomShadeRange;
      const wash = context.createLinearGradient(0, 0, 0, height);
      wash.addColorStop(0, `rgba(255, 244, 214, ${glowAlpha})`);
      wash.addColorStop(0.45, "rgba(255, 244, 214, 0)");
      wash.addColorStop(1, `rgba(0, 0, 0, ${Math.max(BRIGHTNESS_SETTINGS.minimumShade, shadeAlpha)})`);
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);

      drawQuestionGraphic();

      particles.forEach((particle) => {
        particle.y -= particle.speed * activeVisual.speedBoost;
        particle.x += Math.sin(time + particle.y * 0.01) * particle.drift;

        if (particle.y < -10) {
          particle.y = height + 10;
          particle.x = Math.random() * width;
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(247, 244, 237, ${activeVisual.particleAlpha + pulse * 0.08})`;
        context.fill();
      });

      window.requestAnimationFrame(draw);
    }

    // 🪄 WHERE: background.js / visual changes
    // WHAT: Switches the background preset, updates the question image, and triggers a small flash.
    function applyQuestionVisual(question) {
      activeVisual = visualPresets[question.visual] || visualPresets.drift;
      activeGraphic = getGraphic(question.id);
      graphicOpacity = 0;
      targetGraphicOpacity = 1;
      pulse = 1;
    }

    // 🚀 WHERE: background.js / startup
    // WHAT: Sizes the canvas, creates particles, tracks the pointer, and begins drawing.
    resize();
    seedParticles();
    window.addEventListener("mousemove", (event) => {
      setBrightnessFromPointer(event.clientY);
    });
    document.addEventListener("mouseleave", () => {
      targetBrightness = BRIGHTNESS_SETTINGS.neutral;
    });
    window.addEventListener("resize", () => {
      resize();
      seedParticles();
    });

    draw();

    return {
      applyQuestionVisual
    };
  }

  window.WhyBackground = {
    BRIGHTNESS_SETTINGS,
    GRAPHIC_SETTINGS,
    createBackgroundController
  };
})();
