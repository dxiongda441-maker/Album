const GIF_WORKER_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js";

const themes = [
  {
    id: "spring",
    title: "春の宵まつり",
    description: "夜桜と提灯の光に包まれた幻想的なステージに変換します。",
    tag: "桜・提灯",
    gradient: ["#0f172a", "#f472b6", "#fb7185"],
    overlay: "rgba(236, 72, 153, 0.28)",
    decorations: "petals",
    preview:
      "linear-gradient(135deg, rgba(252, 165, 165, 0.5), rgba(244, 114, 182, 0.4))",
  },
  {
    id: "summer",
    title: "夏夜の花火舞台",
    description: "力強い花火と海風のライティングでエネルギッシュなシーンを演出。",
    tag: "花火・青波",
    gradient: ["#0b1120", "#1d4ed8", "#38bdf8"],
    overlay: "rgba(59, 130, 246, 0.25)",
    decorations: "fireworks",
    preview:
      "linear-gradient(135deg, rgba(59, 130, 246, 0.5), rgba(14, 165, 233, 0.45))",
  },
  {
    id: "lantern",
    title: "灯篭と水面の幻想",
    description: "静かな水辺に灯る灯篭の揺らぎで穏やかな時間を描きます。",
    tag: "灯篭・水面",
    gradient: ["#1f2937", "#fbbf24", "#f97316"],
    overlay: "rgba(251, 191, 36, 0.25)",
    decorations: "lanterns",
    preview:
      "linear-gradient(135deg, rgba(250, 204, 21, 0.45), rgba(245, 158, 11, 0.4))",
  },
  {
    id: "aurora",
    title: "星降るナイトパレード",
    description: "オーロラと星屑の流れを重ね、舞台の上で光のパレードを展開。",
    tag: "星・オーロラ",
    gradient: ["#020617", "#6366f1", "#8b5cf6"],
    overlay: "rgba(129, 140, 248, 0.25)",
    decorations: "aurora",
    preview:
      "linear-gradient(135deg, rgba(99, 102, 241, 0.45), rgba(167, 139, 250, 0.4))",
  },
  {
    id: "autumn",
    title: "紅葉の灯り回廊",
    description: "紅葉とキャンドルが揺れるあたたかな回廊で思い出を彩ります。",
    tag: "紅葉・キャンドル",
    gradient: ["#111827", "#f97316", "#facc15"],
    overlay: "rgba(249, 115, 22, 0.28)",
    decorations: "leaves",
    preview:
      "linear-gradient(135deg, rgba(249, 115, 22, 0.5), rgba(250, 204, 21, 0.4))",
  },
  {
    id: "winter",
    title: "雪灯りの祈り",
    description: "雪原と光の粒をまとい、清らかな冬の祭壇をイメージ。",
    tag: "雪・祈り",
    gradient: ["#0f172a", "#38bdf8", "#e0f2fe"],
    overlay: "rgba(148, 197, 253, 0.28)",
    decorations: "snow",
    preview:
      "linear-gradient(135deg, rgba(125, 211, 252, 0.45), rgba(191, 219, 254, 0.5))",
  },
];

const photoInput = document.getElementById("photoInput");
const generateButton = document.getElementById("generateButton");
const themeGrid = document.getElementById("themeGrid");
const album = document.getElementById("album");
const toast = document.getElementById("toast");
const subjectPreview = document.getElementById("subjectPreview");
const shareButton = document.getElementById("shareButton");
const downloadAllButton = document.getElementById("downloadAllButton");
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");
const modalClose = document.getElementById("modalClose");

const state = {
  subjectDataUrl: null,
  scenes: [],
};

renderThemeCards();
attachEventListeners();

function renderThemeCards() {
  const template = document.getElementById("themeCardTemplate");
  themes.forEach((theme) => {
    const node = template.content.firstElementChild.cloneNode(true);
    const input = node.querySelector(".theme-card__input");
    const visual = node.querySelector(".theme-card__visual");
    const title = node.querySelector(".theme-card__title");
    const description = node.querySelector(".theme-card__description");
    const tag = node.querySelector(".theme-card__tag");

    input.value = theme.id;
    visual.style.background = theme.preview;
    title.textContent = theme.title;
    description.textContent = theme.description;
    tag.textContent = theme.tag;

    themeGrid.appendChild(node);
  });
}

function attachEventListeners() {
  photoInput.addEventListener("change", handlePhotoUpload);
  generateButton.addEventListener("click", handleGenerateScenes);
  shareButton.addEventListener("click", shareAlbum);
  downloadAllButton.addEventListener("click", downloadAllScenes);
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hasAttribute("hidden")) {
      closeModal();
    }
  });
}

function handlePhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    state.subjectDataUrl = reader.result;
    updateSubjectPreview(reader.result);
    showToast("写真を読み込みました。テーマを選んで生成してください。");
  };
  reader.readAsDataURL(file);
}

function updateSubjectPreview(dataUrl) {
  subjectPreview.innerHTML = "";
  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = "アップロードした写真";
  subjectPreview.appendChild(img);
}

async function handleGenerateScenes() {
  if (!state.subjectDataUrl) {
    showToast("先に写真をアップロードしてください。");
    return;
  }

  const selectedThemeIds = Array.from(
    themeGrid.querySelectorAll(".theme-card__input:checked")
  ).map((input) => input.value);

  if (selectedThemeIds.length === 0) {
    showToast("少なくとも1つテーマを選択してください。");
    return;
  }

  generateButton.disabled = true;
  generateButton.textContent = "生成中...";
  album.innerHTML = "";
  state.scenes = [];

  try {
    for (const themeId of selectedThemeIds) {
      const theme = themes.find((item) => item.id === themeId);
      const scene = await createScene(theme, state.subjectDataUrl);
      state.scenes.push(scene);
      album.appendChild(createAlbumItem(scene));
    }

    showToast(`${state.scenes.length} 件のシーンを生成しました。`);
  } catch (error) {
    console.error(error);
    showToast("生成中にエラーが発生しました。ページを再読み込みして再試行してください。");
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "アルバムを生成";
  }
}

async function createScene(theme, subjectSrc) {
  const image = await loadImage(subjectSrc);
  const canvas = document.createElement("canvas");
  const size = 640;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const frames = 8;

  const gif = new GIF({
    workers: 2,
    quality: 12,
    width: size,
    height: size,
    background: theme.gradient[0],
    workerScript: GIF_WORKER_URL,
  });

  for (let index = 0; index < frames; index += 1) {
    const progress = index / frames;
    drawSceneFrame(ctx, canvas, theme, image, progress);
    gif.addFrame(ctx, { copy: true, delay: 160 });
  }

  const blob = await renderGif(gif);
  const blobUrl = URL.createObjectURL(blob);
  const previewUrl = canvas.toDataURL("image/png");
  const timestamp = Date.now();
  const fileName = `${theme.id}-scene-${timestamp}.gif`;

  return {
    themeId: theme.id,
    title: theme.title,
    description: theme.description,
    fileName,
    blob,
    blobUrl,
    previewUrl,
  };
}

function drawSceneFrame(ctx, canvas, theme, image, progress) {
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  const stops = theme.gradient.length - 1 || 1;
  theme.gradient.forEach((color, index) => {
    gradient.addColorStop(index / stops, color);
  });
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = theme.overlay;
  ctx.fillRect(0, 0, width, height);

  drawLightOrbs(ctx, width, height, progress, theme);
  drawDecorations(ctx, width, height, progress, theme);
  drawSubject(ctx, width, height, image, progress);
  drawForegroundGlow(ctx, width, height, progress, theme);
}

function drawLightOrbs(ctx, width, height, progress, theme) {
  const orbCount = 6;
  for (let i = 0; i < orbCount; i += 1) {
    const angle = (progress + i / orbCount) * Math.PI * 2;
    const radius = (Math.sin(progress * Math.PI * 2 + i) + 1) * 40 + 120;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * (radius * 0.5);
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 140);
    gradient.addColorStop(0, "rgba(255,255,255,0.45)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.globalCompositeOperation = "screen";
    ctx.beginPath();
    ctx.arc(x, y, 140, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
}

function drawDecorations(ctx, width, height, progress, theme) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  switch (theme.decorations) {
    case "petals":
      drawPetals(ctx, width, height, progress);
      break;
    case "fireworks":
      drawFireworks(ctx, width, height, progress);
      break;
    case "lanterns":
      drawLanterns(ctx, width, height, progress);
      break;
    case "aurora":
      drawAurora(ctx, width, height, progress);
      break;
    case "leaves":
      drawLeaves(ctx, width, height, progress);
      break;
    case "snow":
      drawSnow(ctx, width, height, progress);
      break;
    default:
      break;
  }
  ctx.restore();
}

function drawPetals(ctx, width, height, progress) {
  const count = 24;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + progress * Math.PI * 2;
    const radius = 220 + Math.sin(progress * Math.PI * 2 + i) * 40;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius * 0.6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const petalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    petalGradient.addColorStop(0, "rgba(255, 255, 255, 0.7)");
    petalGradient.addColorStop(1, "rgba(249, 168, 212, 0)");
    ctx.fillStyle = petalGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawFireworks(ctx, width, height, progress) {
  const bursts = 4;
  for (let i = 0; i < bursts; i += 1) {
    const baseAngle = (i / bursts) * Math.PI * 2;
    const burstRadius = 180 + Math.sin(progress * Math.PI * 2 + i) * 60;
    const x = width / 2 + Math.cos(baseAngle) * 120;
    const y = height / 3 + Math.sin(baseAngle) * 70;
    for (let ray = 0; ray < 20; ray += 1) {
      const angle = (ray / 20) * Math.PI * 2;
      const length = burstRadius * (0.4 + Math.sin(progress * Math.PI * 2 + ray) * 0.3);
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      const gradient = ctx.createLinearGradient(x, y, endX, endY);
      gradient.addColorStop(0, "rgba(248, 250, 252, 0.9)");
      gradient.addColorStop(1, "rgba(56, 189, 248, 0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }
}

function drawLanterns(ctx, width, height, progress) {
  const lanterns = 8;
  for (let i = 0; i < lanterns; i += 1) {
    const lane = i % 2 === 0 ? height * 0.35 : height * 0.6;
    const offset = (progress * width + i * 140) % (width + 160) - 80;
    const x = offset;
    const y = lane + Math.sin(progress * Math.PI * 2 + i) * 16;
    drawLantern(ctx, x, y);
  }
}

function drawLantern(ctx, x, y) {
  const gradient = ctx.createRadialGradient(x, y, 10, x, y, 60);
  gradient.addColorStop(0, "rgba(254, 215, 170, 0.85)");
  gradient.addColorStop(1, "rgba(251, 146, 60, 0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(x, y, 32, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(251, 191, 36, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, 28, 36, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawAurora(ctx, width, height, progress) {
  const bands = 3;
  ctx.globalCompositeOperation = "screen";
  for (let i = 0; i < bands; i += 1) {
    const amplitude = 80 + i * 20;
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, "rgba(129, 140, 248, 0.15)");
    gradient.addColorStop(0.5, "rgba(244, 114, 182, 0.22)");
    gradient.addColorStop(1, "rgba(129, 230, 217, 0.15)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.3 + i * 40);
    for (let x = 0; x <= width; x += 20) {
      const y =
        height * 0.3 +
        i * 40 +
        Math.sin((x / width) * Math.PI * 2 + progress * Math.PI * 4 + i) * amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawLeaves(ctx, width, height, progress) {
  const count = 20;
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 200 + Math.sin(progress * Math.PI * 2 + i) * 60;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius * 0.6;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + progress * Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? "rgba(249, 115, 22, 0.55)" : "rgba(251, 191, 36, 0.55)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawSnow(ctx, width, height, progress) {
  const flakes = 30;
  for (let i = 0; i < flakes; i += 1) {
    const size = 6 + (i % 6);
    const x = (i * 50 + progress * width * 0.6) % (width + 80) - 40;
    const y = ((i * 70 + progress * height * 0.9) % (height + 80)) - 40;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawSubject(ctx, width, height, image, progress) {
  const maxSize = width * 0.62;
  const scale = Math.min(maxSize / image.width, maxSize / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = width / 2 - drawWidth / 2;
  const y = height / 2 - drawHeight / 2 + Math.sin(progress * Math.PI * 2) * 6;

  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.55)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 20;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, Math.max(drawWidth, drawHeight) * 0.55, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = "rgba(15, 23, 42, 0.55)";
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, Math.max(drawWidth, drawHeight) * 0.52, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.restore();

  ctx.save();
  const overlayGradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.max(drawWidth, drawHeight) * 0.1,
    width / 2,
    height / 2,
    Math.max(drawWidth, drawHeight) * 0.52
  );
  overlayGradient.addColorStop(0, "rgba(255,255,255,0)");
  overlayGradient.addColorStop(1, "rgba(15, 23, 42, 0.35)");
  ctx.fillStyle = overlayGradient;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, Math.max(drawWidth, drawHeight) * 0.52, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawForegroundGlow(ctx, width, height, progress, theme) {
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  const glow = ctx.createRadialGradient(
    width / 2,
    height * 0.85,
    40,
    width / 2,
    height * 0.85,
    height * 0.6
  );
  glow.addColorStop(0, theme.overlay);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function createAlbumItem(scene) {
  const template = document.getElementById("albumItemTemplate");
  const node = template.content.firstElementChild.cloneNode(true);
  const img = node.querySelector("img");
  const title = node.querySelector("h3");
  const description = node.querySelector("p");
  const [downloadButton, previewButton] = node.querySelectorAll("button");

  img.src = scene.blobUrl;
  img.alt = scene.title;
  title.textContent = scene.title;
  description.textContent = scene.description;
  downloadButton.addEventListener("click", () => saveAs(scene.blob, scene.fileName));
  previewButton.addEventListener("click", () => openModal(scene.blobUrl));

  return node;
}

async function shareAlbum() {
  if (state.scenes.length === 0) {
    showToast("共有するシーンがまだありません。先に生成してください。");
    return;
  }

  const shareText = `Memorial Festival Album で ${state.scenes.length} 件のシーンを生成しました！`;

  if (navigator.share) {
    try {
      const files = state.scenes.slice(0, 3).map(
        (scene) =>
          new File([scene.blob], scene.fileName, {
            type: "image/gif",
          })
      );
      const shareData = { title: "Memorial Festival Album", text: shareText };
      if (navigator.canShare && navigator.canShare({ files })) {
        shareData.files = files;
      }
      await navigator.share(shareData);
      showToast("共有を開始しました。");
      return;
    } catch (error) {
      console.warn("Share API failed", error);
    }
  }

  try {
    await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
    showToast("共有用テキストをクリップボードにコピーしました。");
  } catch (error) {
    console.warn("Clipboard API failed", error);
    showToast("クリップボードにコピーできませんでした。手動で共有してください。");
  }
}

async function downloadAllScenes() {
  if (state.scenes.length === 0) {
    showToast("まだ生成されたシーンがありません。");
    return;
  }

  const zip = new JSZip();
  state.scenes.forEach((scene) => {
    zip.file(scene.fileName, scene.blob);
  });
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "memorial-festival-album.zip");
  showToast("ZIP ファイルをダウンロードしました。");
}

function openModal(imageUrl) {
  modalImage.src = imageUrl;
  modal.removeAttribute("hidden");
}

function closeModal() {
  modal.setAttribute("hidden", "");
  modalImage.src = "";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function renderGif(gif) {
  return new Promise((resolve, reject) => {
    gif.on("finished", (blob) => resolve(blob));
    gif.on("abort", () => reject(new Error("GIF rendering aborted")));
    gif.on("error", (error) => reject(error));
    gif.render();
  });
}
