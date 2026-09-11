# Y TREE Technical Task

AI assistants must read [PLAN.md](PLAN.md) in full before proceeding with any work in this repository. Read [the original task instructions](tech-task-v3.html) for the requirements behind the plan.

## Run server

```sh
cd server
./mvnw spring-boot:run
```

## Run client

```sh
cd client
npm install
npm run dev
```

## Backend tests

```sh
cd server
./mvnw test
```

Uses the existing JUnit and Spring MockMvc dependencies. Tests cover account JSON (including statement details, ISO dates, and missing statements), the known-provider list including a provider not yet added, and application startup.
