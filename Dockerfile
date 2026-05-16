# syntax=docker/dockerfile:1.6

# ============================================================
# Stage 1: Build the application (JDK + Maven)
# ============================================================
FROM eclipse-temurin:25-jdk-noble AS builder

WORKDIR /build

# Maven-Wrapper zuerst kopieren (Layer-Cache: pom.xml ändert sich selten)
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Dependencies vorab laden (gecached solange pom.xml gleich bleibt)
RUN ./mvnw dependency:go-offline -B

# Source code und Build
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ============================================================
# Stage 2: Runtime (nur JRE - schlanker und sicherer)
# ============================================================
FROM eclipse-temurin:25-jre-noble

# OCI Image-Metadaten
LABEL org.opencontainers.image.title="DJL Footwear Classification"
LABEL org.opencontainers.image.description="Spring Boot + DJL footwear image classification"
LABEL org.opencontainers.image.source="https://github.com/Mahimiu/djl-footwear-classification"

WORKDIR /app

# Non-Root User anlegen (Security)
RUN groupadd --system spring && useradd --system --gid spring spring
USER spring:spring

# Nur die fertige JAR aus dem Builder kopieren - keine Build-Tools, kein Source
COPY --from=builder --chown=spring:spring /build/target/playground-0.0.1-SNAPSHOT.jar app.jar
COPY --chown=spring:spring models models

# Container-aware JVM-Settings (nutzt nur Memory, das dem Container zugewiesen ist)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
