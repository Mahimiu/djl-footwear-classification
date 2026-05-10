# Modellvergleich — Footwear Classification

Dieses Dokument dokumentiert den Vergleich zwischen zwei trainierten Modellen für die Schuhklassifikation (Boots, Sandals, Shoes, Slippers) auf Basis des [UT-Zappos50K](https://vision.cs.utexas.edu/projects/finegrained/utzap50k/) Datensatzes.

## Übersicht

Es wurden zwei verschiedene Architekturen aus der ResNet-Familie verglichen, um den Einfluss der Netzwerktiefe auf die Klassifikationsgüte zu untersuchen.

| | ResNet18 | ResNet50 |
|---|---|---|
| Parameter (ca.) | ~11 Mio. | ~25 Mio. |
| Tiefe (Layer) | 18 | 50 |
| Modell-Datei | `models-resnet18/shoeclassifier-0002.params` | `models-resnet50/shoeclassifier-0002.params` |

## Setup

Beide Modelle wurden unter **identischen Bedingungen** trainiert; einziger Unterschied ist die Architektur (`setNumLayers()` in `Models.java`).

| Parameter | Wert |
|---|---|
| Datensatz | `ut-zap50k-images-square-small` |
| Train/Validation Split | 80% / 20% |
| Image Size | 100 × 100 (RGB) |
| Batch Size | 32 |
| Epochs | 2 |
| Loss-Funktion | Softmax Cross-Entropy |
| Optimizer | DJL DefaultTrainingConfig (SGD) |
| Hardware | CPU (Intel, 12 Threads) |
| Framework | DJL 0.36.0 + PyTorch 2.7.1 |

## Ergebnisse

### ResNet18

| Epoch | Train Accuracy | Train Loss | Val Accuracy | Val Loss |
|:---:|:---:|:---:|:---:|:---:|
| 1 | 0.44 | 1.23 | 0.52 | 1.19 |
| 2 | **0.64** | **0.85** | **0.56** | **1.20** |

**Trainingsdauer**: 25 Sekunden

### ResNet50

| Epoch | Train Accuracy | Train Loss | Val Accuracy | Val Loss |
|:---:|:---:|:---:|:---:|:---:|
| 1 | 0.40 | 2.36 | 0.29 | 4.50 |
| 2 | **0.52** | **1.22** | **0.32** | **5.40** |

**Trainingsdauer**: 62 Sekunden

### Direkter Vergleich

| Metrik | ResNet18 | ResNet50 | Sieger |
|---|:---:|:---:|:---:|
| Final Validation Accuracy | **56%** | 32% | 🏆 ResNet18 |
| Final Validation Loss | **1.20** | 5.40 | 🏆 ResNet18 |
| Trainingsdauer | **25 s** | 62 s | 🏆 ResNet18 |
| Train/Val-Loss-Gap (Epoch 2) | 0.35 | 4.18 | 🏆 ResNet18 |

## Interpretation

Auf den ersten Blick könnte man erwarten, dass das tiefere Modell (ResNet50) bessere Ergebnisse liefert. Im vorliegenden Setup ist jedoch das **Gegenteil** der Fall: ResNet18 erreicht eine fast doppelt so hohe Validation Accuracy bei gleichzeitig deutlich niedrigerem Loss.

**Mögliche Ursachen:**

1. **Overfitting bei ResNet50**: Mit ~25 Millionen Parametern hat das Modell ausreichend Kapazität, um die Trainingsdaten quasi auswendig zu lernen. Der grosse Gap zwischen Train Loss (1.22) und Val Loss (5.40) bei Epoch 2 ist ein klassisches Overfitting-Signal.
2. **Zu wenig Epochs**: 2 Epochs sind für ein tiefes Netz wie ResNet50 zu wenig, um die Gewichte stabil zu konvergieren. Die Validation Accuracy fällt sogar von Epoch 1 (0.29) zu Epoch 2 (0.32) nur leicht steigt — ein Hinweis auf instabiles Lernen.
3. **Datensatzgrösse**: Der `square-small`-Subset des UT-Zappos50K ist relativ klein. Tiefe Architekturen profitieren typischerweise von grossen Datensätzen — sind diese zu klein, dominieren kleinere Modelle.
4. **Generalisierung**: ResNet18 zeigt mit einem Train/Val-Gap von 0.35 (Loss) eine wesentlich bessere Generalisierungsfähigkeit als ResNet50 (Gap: 4.18).

## Fazit & Empfehlung

Für das gegebene Problem (4-Klassen-Schuhklassifikation, kleines Dataset, kurze Trainingsdauer) ist **ResNet18 die bessere Wahl**:

- Höhere Accuracy
- Bessere Generalisierung
- Schnelleres Training
- Schnellere Inferenz im Deployment
- Kleinere Modell-Datei → kleineres Docker-Image

**Take-away**: Mehr Tiefe ist nicht automatisch besser. Die Architektur muss zur Komplexität der Aufgabe und zur Grösse des Datensatzes passen. Bei kleinen Datensätzen und einfachen Klassifikationsproblemen sind kompakte Modelle oft überlegen.

## Reproduktion

Die exakten Trainingsläufe können wie folgt reproduziert werden:

1. **Models.java** anpassen:
   - Für ResNet18: `.setNumLayers(18)` in `getModel()`
   - Für ResNet50: `.setNumLayers(50)` in `getModel()`
2. **Training.java** ausführen (`▶️ Run` in VS Code).
3. Resultate werden im Terminal ausgegeben und das Modell wird in `models/shoeclassifier-XXXX.params` gespeichert.

Die in diesem Dokument dokumentierten Trainingsläufe wurden am **10.05.2026** durchgeführt. Die jeweiligen Modelldateien sind in den Verzeichnissen `models-resnet18/` und `models-resnet50/` lokal abgelegt (nicht im Git-Repository, weil binäre Modell-Files inkompatibel mit Versionierung sind).

## Production-Modell

Aktuell läuft auf [Azure](https://djl-footwear-galmmax1-hcduhhgdbnaph3cp.switzerlandnorth-01.azurewebsites.net) das ResNet50-Modell vom 26.04.2026 (`models/shoeclassifier-0002.params`, ~94 MB). Dieses wurde mit identischen Hyperparametern trainiert, lieferte jedoch in informellen Tests gute Klassifikationsergebnisse (z.B. Sandalen: ~95% Confidence). Eine zukünftige Optimierung könnte darin bestehen, ResNet18 mit mehr Epochs (z.B. 10-20) zu trainieren und in Production zu nehmen.
