import * as THREE from "three";

export function generateBodyTextures(): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const canvasC = document.createElement("canvas");
  const canvasB = document.createElement("canvas");
  canvasC.width = canvasB.width = size;
  canvasC.height = canvasB.height = size;
  const ctxC = canvasC.getContext("2d");
  const ctxB = canvasB.getContext("2d");

  if (ctxC && ctxB) {
    ctxC.fillStyle = "#efefed";
    ctxC.fillRect(0, 0, size, size);
    ctxB.fillStyle = "#8f8f8f";
    ctxB.fillRect(0, 0, size, size);

    for (let i = 0; i < 9000; i += 1) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 0.25 + Math.random() * 0.7;
      const tone = 232 + Math.floor(Math.random() * 16);
      ctxC.beginPath();
      ctxC.arc(x, y, r, 0, Math.PI * 2);
      ctxC.fillStyle = `rgb(${tone}, ${tone}, ${tone - 1})`;
      ctxC.fill();

      const bump = 118 + Math.floor(Math.random() * 22);
      ctxB.beginPath();
      ctxB.arc(x, y, r, 0, Math.PI * 2);
      ctxB.fillStyle = `rgb(${bump}, ${bump}, ${bump})`;
      ctxB.fill();
    }
  }

  const colorMap = new THREE.CanvasTexture(canvasC);
  const bumpMap = new THREE.CanvasTexture(canvasB);
  colorMap.wrapS = bumpMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = bumpMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(3, 2);
  bumpMap.repeat.set(3, 2);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.needsUpdate = true;
  bumpMap.needsUpdate = true;

  return { colorMap, bumpMap };
}
