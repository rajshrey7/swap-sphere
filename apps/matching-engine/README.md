# Matching Engine Microservice

The **Perfect Match Engine** is an intelligent skill-matching microservice that automatically matches users based on what they offer and what they want to learn.

## Features

- **Hybrid Formula-Based Matching**: Uses a sophisticated algorithm combining:
  - Semantic similarity (bidirectional)
  - Language compatibility
  - Trust scores
- **Semantic Search**: Uses transformer-based embeddings for intelligent skill matching
- **Modular Architecture**: Easy to extend and customize
- **RESTful API**: Clean, well-documented endpoints

## Matching Algorithm

The matching engine uses a weighted formula to calculate match scores:

```
Total Match Score = 
  w1 * (semantic similarity of A's offer → B's want)
+ w2 * (semantic similarity of B's offer → A's want)
+ w3 * (language similarity)
+ w4 * (trust score)
```

### Default Weights

- `w1`: 0.35 - Semantic similarity (A's offer → B's want)
- `w2`: 0.35 - Semantic similarity (B's offer → A's want)
- `w3`: 0.15 - Language similarity
- `w4`: 0.15 - Trust score

## API Endpoints

### Matching

#### `POST /api/matching/find`
Find matches for a user.

**Request Body:**
```json
{
  "userId": "user123",
  "config": {
    "weights": {
      "w1": 0.35,
      "w2": 0.35,
      "w3": 0.15,
      "w4": 0.15
    },
    "minMatchScore": 0.3,
    "maxResults": 50
  }
}
```

**Response:**
```json
{
  "matches": [
    {
      "userA": { ... },
      "userB": { ... },
      "matchScore": {
        "totalScore": 0.85,
        "semanticScoreAtoB": 0.9,
        "semanticScoreBtoA": 0.88,
        "languageScore": 0.8,
        "trustScore": 0.75,
        "breakdown": { ... }
      },
      "matchedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "totalCandidates": 100,
  "processingTime": 250
}
```

#### `POST /api/matching/score`
Calculate match score between two specific users.

**Request Body:**
```json
{
  "userIdA": "user123",
  "userIdB": "user456",
  "weights": { ... }
}
```

### Users

#### `POST /api/users`
Create or update a user profile.

**Request Body:**
```json
{
  "id": "user123",
  "username": "johndoe",
  "email": "john@example.com",
  "languages": ["en", "es"],
  "offers": [
    {
      "id": "skill1",
      "name": "JavaScript",
      "description": "Advanced JavaScript programming",
      "level": "expert",
      "category": "programming"
    }
  ],
  "wants": [
    {
      "id": "skill2",
      "name": "Spanish",
      "level": "beginner",
      "category": "language"
    }
  ],
  "trustScore": 0.85
}
```

#### `GET /api/users/:id`
Get user by ID.

#### `GET /api/users`
Get all users.

#### `DELETE /api/users/:id`
Delete a user.

## Development

### Prerequisites

- Node.js >= 18
- pnpm

### Installation

```bash
cd apps/matching-engine
pnpm install
```

### Build

```bash
pnpm run build
```

### Run

```bash
pnpm run start
```

### Development Mode

```bash
pnpm run dev
```

## Environment Variables

- `MATCHING_ENGINE_PORT` - Port to run the service on (default: 8081)

## Architecture

The service is organized into modular components:

```
src/
├── types/           # TypeScript types and interfaces
├── services/        # Business logic services
│   ├── semantic.service.ts    # Semantic similarity calculations
│   ├── language.service.ts    # Language compatibility
│   └── trust.service.ts       # Trust score calculations
├── core/            # Core matching engine
│   └── matching.engine.ts    # Main matching algorithm
├── repositories/    # Data access layer
│   └── user.repository.ts    # User data management
└── routes/          # API routes
    ├── matching.route.ts       # Matching endpoints
    └── user.route.ts         # User management endpoints
```

## Extending the Service

### Adding a Database

Replace the `UserRepository` implementation with a database-backed version. The interface remains the same, so no changes are needed in other parts of the code.

### Custom Matching Weights

Adjust the weights in the matching config to prioritize different factors:

```typescript
const customWeights = {
  w1: 0.4,  // More weight on semantic matching
  w2: 0.4,
  w3: 0.1,  // Less weight on language
  w4: 0.1   // Less weight on trust
};
```

### Custom Semantic Models

The semantic service uses `@xenova/transformers` with the `Xenova/all-MiniLM-L6-v2` model. You can switch to a different model by modifying `semantic.service.ts`.

## License

ISC

