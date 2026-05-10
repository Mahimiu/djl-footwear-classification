# 👟 Footwear Classification

Spring-Boot-Webanwendung zur automatischen Klassifikation von Schuhbildern in vier Kategorien (Boots, Sandals, Shoes, Slippers) mit der [Deep Java Library (DJL)](https://djl.ai/) und einem auf [UT-Zappos50K](https://vision.cs.utexas.edu/projects/finegrained/utzap50k/) trainierten ResNet-Modell.

Das Projekt entstand im Rahmen des Moduls **MDM (Model Deployment & Maintenance)** an der ZHAW (FS2026).

## 🌐 Live-Demo

**Azure App Service**: [https://djl-footwear-galmmax1-hcduhhgdbnaph3cp.switzerlandnorth-01.azurewebsites.net](https://djl-footwear-galmmax1-hcduhhgdbnaph3cp.switzerlandnorth-01.azurewebsites.net)

> Beim ersten Aufruf braucht die App ggf. 30-60 Sekunden, um aus dem Cold-Start aufzuwachen.

## ✨ Features

- 🖼️ **Drag-&-Drop-Upload** für Schuhbilder direkt im Browser
- 📊 **Top-4-Klassifikation** mit Wahrscheinlichkeiten als horizontale Balken
- 🎨 **Animierter Gradient-Hintergrund** für ein modernes Look-&-Feel
- 🔌 **REST-API** mit fünf Endpoints (Ping, Health, Info, Classes, Analyze)
- 📖 **Swagger UI** für interaktive API-Dokumentation
- 🐳 **Docker-Image** auf Docker Hub
- ☁️ **Azure App Service Deployment**
- 🤖 **CI/CD via GitHub Actions** (automatischer Build & Push bei jedem Commit)
- 🧪 **Postman-Collection** für API-Tests
- 📐 **Modellvergleich** ResNet18 vs. ResNet50 (siehe [MODELS.md](MODELS.md))

## 🏗️ Architektur

```
┌─────────────────┐      HTTP        ┌────────────────────────┐
│  Browser /      │ ───────────────► │  Spring Boot App       │
│  Postman        │ ◄─────────────── │  (Port 8080)           │
└─────────────────┘                   │                        │
                                      │  ┌──────────────────┐  │
                                      │  │ Classification   │  │
                                      │  │ Controller       │  │
                                      │  └────────┬─────────┘  │
                                      │           │            │
                                      │           ▼            │
                                      │  ┌──────────────────┐  │
                                      │  │ Inference (DJL)  │  │
                                      │  └────────┬─────────┘  │
                                      │           │            │
                                      │           ▼            │
                                      │  ┌──────────────────┐  │
                                      │  │ shoeclassifier   │  │
                                      │  │ .params (PyTorch)│  │
                                      │  └──────────────────┘  │
                                      └────────────────────────┘
```

Das Modell wird beim Start in den Speicher geladen; jede Anfrage triggert einen Forward-Pass durch das Netzwerk.

## 🛠️ Tech-Stack

| Bereich | Technologie |
|---|---|
| Sprache | Java 25 |
| Framework | Spring Boot 3 |
| ML | Deep Java Library (DJL) 0.36.0 + PyTorch 2.7.1 |
| Build | Maven |
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| API-Doku | springdoc-openapi (Swagger UI) |
| Containerisierung | Docker |
| CI/CD | GitHub Actions |
| Hosting | Azure App Service |
| Modell | ResNet50 (Transfer Learning) |
| Datensatz | UT-Zappos50K (square-small Subset) |

## 🚀 Setup & Lokal starten

### Voraussetzungen

- Java 25 (JDK)
- Maven (oder via Wrapper `./mvnw`)
- Docker (optional, für Container-Build)

### Repository klonen

```bash
git clone https://github.com/Mahimiu/djl-footwear-classification.git
cd djl-footwear-classification
```

### App starten (Maven)

```bash
./mvnw spring-boot:run
```

Auf Windows:

```cmd
mvnw.cmd spring-boot:run
```

Anschliessend ist die App unter [http://localhost:8080](http://localhost:8080) erreichbar.

### App starten (Docker)

```bash
docker build -t djl-footwear-classification .
docker run -p 8080:8080 djl-footwear-classification
```

Oder direkt das Image von Docker Hub ziehen:

```bash
docker run -p 8080:8080 galmmax1/djl-footwear-classification:latest
```

## 🎓 Training

Der Trainings-Code befindet sich in [`Training.java`](src/main/java/ch/zhaw/deeplearningjava/footwear/Training.java).

### Datensatz vorbereiten

1. UT-Zappos50K von [vision.cs.utexas.edu](https://vision.cs.utexas.edu/projects/finegrained/utzap50k/) herunterladen.
2. Das Verzeichnis `ut-zap50k-images-square-small` ins Projekt-Root legen.

### Training starten

In VS Code: `Training.java` öffnen → ▶️ Run-Button.

Oder per Kommandozeile:

```bash
./mvnw exec:java -Dexec.mainClass="ch.zhaw.deeplearningjava.footwear.Training"
```

Das trainierte Modell wird unter `models/shoeclassifier-XXXX.params` gespeichert.

### Hyperparameter anpassen

In `Training.java`:

```java
private static final int BATCH_SIZE = 32;
private static final int EPOCHS = 2;
```

In `Models.java` (Architektur):

```java
.setNumLayers(50)  // 18, 34, 50, 101, 152
```

### Modellvergleich

Eine ausführliche Gegenüberstellung von ResNet18 und ResNet50 findet sich in [MODELS.md](MODELS.md).

## 🔌 API-Endpoints

Alle Endpoints sind unter `http://localhost:8080` (lokal) bzw. der Azure-URL erreichbar.

### `GET /ping`

Health-Check. Antwort: `"Classification app is up and running!"`

### `GET /health`

Detaillierter Status:

```json
{
  "status": "UP",
  "timestamp": "2026-05-10T13:00:00.000"
}
```

### `GET /info`

Modell-Metadaten:

```json
{
  "modelName": "shoeclassifier",
  "framework": "DeepJavaLibrary (DJL) with PyTorch",
  "architecture": "ResNet50 (transfer learning)",
  "imageWidth": 100,
  "imageHeight": 100,
  "classes": ["Boots", "Sandals", "Shoes", "Slippers"]
}
```

### `GET /classes`

Liste der Klassen:

```json
["Boots", "Sandals", "Shoes", "Slippers"]
```

### `POST /analyze`

Bild hochladen und klassifizieren. Body: `multipart/form-data` mit Feld `image`.

Antwort:

```json
[
  {"className": "Sandals", "probability": 0.948},
  {"className": "Slippers", "probability": 0.051},
  {"className": "Shoes", "probability": 0.001},
  {"className": "Boots", "probability": 0.0001}
]
```

### Swagger UI

Interaktive API-Dokumentation: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

## 🧪 API-Tests mit Postman

Die Datei [`footwear-collection.json`](footwear-collection.json) enthält eine vollständige Postman-Collection mit allen fünf Endpoints.

### Import

1. Postman öffnen.
2. **Import** → JSON-Datei auswählen.
3. Variable `baseUrl` setzen:
   - Lokal: `http://localhost:8080`
   - Azure: `https://djl-footwear-galmmax1-hcduhhgdbnaph3cp.switzerlandnorth-01.azurewebsites.net`

### Tests durchführen

Alle GET-Endpoints können direkt mit **Send** ausgeführt werden. Für `POST /analyze` muss im Tab **Body → form-data** ein Bild beim Feld `image` hochgeladen werden.

## 🚢 Deployment

### Azure App Service

Die App läuft auf einem Azure App Service mit folgendem Setup:

- **Region**: Switzerland North
- **Container**: Docker
- **Image-Quelle**: Docker Hub (`galmmax1/djl-footwear-classification:latest`)
- **Port**: 8080

### Docker Hub

Image-URL: [hub.docker.com/r/galmmax1/djl-footwear-classification](https://hub.docker.com/r/galmmax1/djl-footwear-classification)

### CI/CD via GitHub Actions

Bei jedem Push auf `main` läuft automatisch der Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. Code-Checkout
2. Docker Buildx Setup
3. Login bei Docker Hub (mit Secret `DOCKERHUB_TOKEN`)
4. Build und Push des Images mit Tag `:latest`

Status der Builds: [Actions-Tab im Repo](https://github.com/Mahimiu/djl-footwear-classification/actions)

## 📁 Projektstruktur

```
djl-footwear-classification/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions Workflow
├── models/                         # Trainierte Modelle
│   ├── shoeclassifier-0002.params
│   └── synset.txt
├── models-resnet18/                # Backup ResNet18 (lokal)
├── models-resnet50/                # Backup ResNet50 (lokal)
├── src/
│   └── main/
│       ├── java/ch/zhaw/deeplearningjava/footwear/
│       │   ├── ClassificationController.java   # REST-Endpoints
│       │   ├── FootwearApplication.java         # Spring Boot Entry-Point
│       │   ├── Inference.java                   # DJL-Inferenz-Logik
│       │   ├── Models.java                       # Modell-Definition
│       │   └── Training.java                    # Training-Code
│       └── resources/
│           ├── application.properties
│           └── static/
│               ├── index.html                   # Frontend
│               ├── script.js
│               └── style.css
├── Dockerfile
├── footwear-collection.json        # Postman-Collection
├── MODELS.md                       # Modellvergleich
├── pom.xml
└── README.md                       # Diese Datei
```

## 📜 Lizenz

Dieses Projekt basiert auf dem [DJL-Beispielcode](https://github.com/deepjavalibrary/djl) (Apache 2.0) und wurde im akademischen Rahmen erweitert.

## 👤 Autor

**Maximillian Galm** — ZHAW, Wirtschaftsinformatik, FS2026
