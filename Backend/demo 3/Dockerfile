# ---- Build stage: compile the jar with Maven ----
# target/ is gitignored, so a fresh clone (which is what Render builds from)
# has no pre-built jar. We must actually run Maven here.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Copy pom.xml first and resolve deps before copying source, so Docker can
# cache the downloaded dependencies layer when only source files change.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Runtime stage: slim JRE, only the built jar ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /build/target/*.jar app.jar

EXPOSE 8080

# MaxRAMPercentage keeps the heap sized sanely on small free-tier containers
# (e.g. Render's 512MB) instead of the JVM's low 25% default.
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
