// Globale Menüstruktur
var menu = {
  "": { "title": "BLE Detector" },
  "DETECT": function() { scan(); }
};

// Zeigt das Hauptmenü an und ermöglicht die Rückkehr zum Hauptbildschirm
function showMainMenu() {
  menu["< Back"] = function() { load(); }; // Rückkehr zum Hauptmenü
  Bangle.drawWidgets(); // Vermeidung von Widget-Überlagerungen
  E.showMenu(menu); // Anzeigen des Menüs
}

// Anzeige des Wartestatus mit verbesserter Benutzerführung
function waitMessage(scanProcess) {
  scanProcess = scanProcess || "Detecting..."; // Standardwert für scanProcess
  E.showMenu(); // Löschen des aktuellen Menüs
  E.showMessage(scanProcess, "BLE Detector"); // Benutzer über den Scan-Vorgang informieren
}

// Globale Variablen für die Animation
var startTime;
var scanDuration = 15; // Dauer des Scans in Sekunden

// Funktion zur Aktualisierung der Scan-Animationsdarstellung
function updateScanAnimation() {
  var currentTime = getTime();
  var elapsedTime = currentTime - startTime;
  var progress = elapsedTime / scanDuration;
  var centerX = 120; // Zentrum des Scanners auf der X-Achse
  var centerY = 120; // Zentrum des Scanners auf der Y-Achse
  var maxRadius = 100; // Maximale Ausbreitung der Geräte

  g.clear();
  g.drawCircle(centerX, centerY, 12); // Zeichnet das Scanner-Symbol

  // Simuliert das Finden von Geräten basierend auf dem Fortschritt
  for (var i = 0; i < progress * 20; i++) {
    var angle = Math.random() * 2 * Math.PI;
    var radius = Math.random() * maxRadius * Math.sqrt(Math.random());
    var x = centerX + radius * Math.cos(angle);
    var y = centerY + radius * Math.sin(angle);
    g.fillCircle(x, y, 3); // Zeichnet das gefundene Gerät als kleinen Kreis
  }
}

// Scan-Funktion mit Animation
function scan(options) {
  startTime = getTime(); // Aktualisiert die Startzeit für die Animation
  options = options || { active: true, timeout: scanDuration * 1000 }; // Standardoptionen
  waitMessage("Scanning..."); // Benutzer über den Beginn des Scans informieren
  var animationInterval = setInterval(updateScanAnimation, 500); // Startet die Animation

  NRF.findDevices(function(devices) {
    clearInterval(animationInterval); // Stoppt die Animation, wenn der Scan abgeschlossen ist
    handleScanResults(devices); // Verarbeitung der Scan-Ergebnisse
  }, options);
}

// Verarbeitet Scan-Ergebnisse und zeigt diese an
function handleScanResults(devices) {
  if (devices.length === 0) {
    E.showMessage("No devices found", "Scan Result");
    setTimeout(showMainMenu, 2000); // Zurück zum Hauptmenü nach Nachricht
    return;
  }

  devices.forEach(function(device) {
    addDeviceToMenu(device); // Fügt jedes Gerät zum Menü hinzu
  });

  showMainMenu(); // Anzeigen der gefundenen Geräte
}

// Fügt ein Gerät zum Menü hinzu
function addDeviceToMenu(device) {
  var deviceName = device.name || device.id.substring(0, 17); // Verwendung des Gerätenamens oder der ID
  menu[deviceName] = function() { showDeviceInfo(device); }; // Hinzufügen des Geräts zum Menü
}

// Zeigt Informationen zu einem spezifischen Gerät an
function showDeviceInfo(device) {
  var deviceMenu = {
    "": { "title": "Device Info" },
    "Name": { value: device.name || "-" },
    "RSSI": { value: device.rssi.toString() },
    "Manufacturer": { value: device.manufacturer || "-" }
  };

  deviceMenu["< Back"] = function() { showMainMenu(); }; // Rückkehr zur Geräteliste

  E.showMenu(deviceMenu); // Anzeige der Geräteinformationen
}

// Initialisierung und Anzeige des Hauptmenüs
Bangle.loadWidgets();
showMainMenu();
waitMessage("Initializing...");
scan({ active: true, timeout: 15000 }); // Beginn des Scan-Vorgangs mit Standardoptionen
