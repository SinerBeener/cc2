let socket;
let clientId = null;
let clientCount = 0;
let clientInfoElem;

let prevX = null, prevY = null;

// Canvas
const canvasWidth = 800;
const canvasHeight = 1200;
const zoneCount = 4;
const zoneHeight = canvasHeight / zoneCount;

let drawingLayer;

// Overlay-Logik
let showOverlays = true;
let revealProgress = 0;       // 0 (nichts sichtbar) und 1 (alles sichtbar)
let revealing = false;        
const revealSpeed = 0.02;     // Geschwindigkeit vom Overlay bzw vom Reveal

function setup() {
  createCanvas(canvasWidth, canvasHeight);

  drawingLayer = createGraphics(canvasWidth, canvasHeight); //Canvas Setup
  drawingLayer.background(255);
  drawingLayer.strokeWeight(2);

  strokeWeight(2);
  clientInfoElem = document.getElementById('clientInfo');

  //Websocket Kommunikation
  socket = new WebSocket("wss://nosch.uber.space/web-rooms/");

  socket.addEventListener("open", () => {
    sendMsg("*enter-room*", "cadavre-exquis");
    sendMsg("*subscribe-client-count*");
    console.log("Verbunden mit WebSocket");
  });

  socket.addEventListener("message", (event) => {
    let msg;
    try {
      msg = JSON.parse(event.data); //damit die striche nicht gelöscht werden
    } catch {
      return;
    }

    const type = msg[0];

    if (type === "*client-id*") {
      clientId = msg[1];
      updateInfo();
    }

    if (type === "*client-count*") {
      clientCount = msg[1];
      updateInfo();
    }

    if (type === "draw-line") {
      const sender = msg[1];
      const [x1, y1] = msg[2];
      const [x2, y2] = msg[3];

      if (sender === clientId) return;

      drawingLayer.stroke('red'); //andere Farbe als eigener strich
      drawingLayer.line(x1, y1, x2, y2);
    }
  });

  const revealBtn = document.getElementById('revealBtn');
  revealBtn.addEventListener('click', () => {
    revealing = true;
  });
}

//Zeichenfläche Funktion
function draw() {
  image(drawingLayer, 0, 0);

  stroke(180);
  for (let i = 1; i < zoneCount; i++) {
    line(0, i * zoneHeight, canvasWidth, i * zoneHeight);
  }

  // Overlay funktion
  if ((showOverlays || revealing) && clientId !== null) {
    noStroke();
    fill('#8ECAE6'); // Overlay farbe

    for (let i = 0; i < zoneCount; i++) {
      if (i !== clientId) {
        const y = i * zoneHeight;
        let visibleHeight = zoneHeight;

        if (revealing) {
          visibleHeight = zoneHeight * (1 - revealProgress);
        }

        rect(0, y, canvasWidth, visibleHeight);
      }
    }

    // Overlay entfernen
    if (revealing) {
      revealProgress += revealSpeed;
      if (revealProgress >= 1) {
        revealProgress = 1; // alles sichtbar
        showOverlays = false;
        revealing = false;
      }
    }
  }
}

function updateInfo() {
  if (clientId !== null && clientCount > 0) {
    clientInfoElem.textContent = `Du bist Client #${clientId + 1} von ${clientCount}`;
  }
}

//Zechen Funktion
function mouseDragged() {
  if (clientId === null || !showOverlays) return;

  const zoneTop = clientId * zoneHeight;
  const zoneBottom = zoneTop + zoneHeight;

  if (mouseY < zoneTop || mouseY > zoneBottom) return;

  if (prevX !== null && prevY !== null) {
    drawingLayer.stroke('black');
    drawingLayer.line(prevX, prevY, mouseX, mouseY);

    const message = ["draw-line", clientId, [prevX, prevY], [mouseX, mouseY]];
    sendMsg("*broadcast-message*", message); // Damit alle sehen was gezeichnet wird
  }

  prevX = mouseX;
  prevY = mouseY;
}

function mouseReleased() {
  prevX = null;
  prevY = null;
}

function sendMsg(...message) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}