# Gestion Formation — Green Building

Application web de gestion de formations continue.  
Spring Boot 3 + PostgreSQL + JWT • React 18 + Recharts

---

## Stack

| Côté       | Technologies                                    |
|------------|-------------------------------------------------|
| Backend    | Spring Boot 3.2, Spring Security, JWT, Hibernate, PostgreSQL, Lombok, Swagger |
| Frontend   | React 18, React Router, Axios, Recharts         |
| Base de données | PostgreSQL (tables créées automatiquement par Hibernate) |

---

## Démarrage

### 1. Base de données

Créer une base PostgreSQL :
```sql
CREATE DATABASE gestion_formation;
```

### 2. Backend

```bash
cd backend
# Vérifier application.properties (DB credentials, mail SMTP)
mvn spring-boot:run
```

Au premier démarrage, Hibernate crée les tables et le compte admin est seedé :
- **Login :** `admin`
- **Mot de passe :** `Admin@2025`

Swagger UI disponible sur : http://localhost:8080/swagger-ui.html

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

L'app tourne sur : http://localhost:3000

---

## Structure du projet

```
gestion-formation/
├── backend/
│   └── src/main/java/com/formation/
│       ├── entity/          # Entités Hibernate (tables DB)
│       ├── repository/      # Spring Data JPA repositories
│       ├── service/         # Logique métier
│       ├── controller/      # REST controllers
│       ├── security/        # JWT filter, config Spring Security
│       ├── dto/             # DTOs (données entrantes)
│       └── DataInitializer  # Seed initial (rôles + admin)
├── frontend/
│   └── src/
│       ├── pages/           # Dashboard, Formations, Participants...
│       ├── components/      # Layout, Sidebar
│       └── services/        # axios instance, AuthContext
└── GestionFormation.postman_collection.json
```

---

## Rôles et accès

| Rôle             | Accès                                                   |
|------------------|---------------------------------------------------------|
| `ROLE_ADMIN`     | Tout : gestion utilisateurs, référentiels, formations, stats |
| `ROLE_USER`      | Formations, participants, formateurs                    |
| `ROLE_RESPONSABLE` | Consultation + statistiques uniquement               |

---

## Endpoints principaux

```
POST   /api/auth/login              → Connexion (retourne JWT)
POST   /api/auth/create-user        → Créer un compte (ADMIN)

GET    /api/formations              → Liste (filtre ?annee=2024)
POST   /api/formations              → Créer
PUT    /api/formations/{id}         → Modifier
POST   /api/formations/{id}/participants → Ajouter participants
DELETE /api/formations/{id}/participants/{pid} → Retirer participant

GET    /api/participants            → Liste
GET    /api/participants/{id}/formations → Historique formations
POST   /api/participants            → Créer
PUT    /api/participants/{id}       → Modifier

GET    /api/formateurs              → Liste
POST   /api/formateurs              → Créer (INTERNE ou EXTERNE)

CRUD   /api/domaines
CRUD   /api/profils
CRUD   /api/structures
CRUD   /api/employeurs

GET    /api/statistiques/formations-par-annee
GET    /api/statistiques/participants-par-annee
GET    /api/statistiques/participants-par-structure
GET    /api/statistiques/participants-par-profil
GET    /api/statistiques/formations-par-domaine
GET    /api/statistiques/evolution-participants
```

---

## Tests Postman

Importer `GestionFormation.postman_collection.json` dans Postman.

**Ordre recommandé :**
1. Auth → Login (le token est sauvegardé automatiquement)
2. Créer domaines, structures, profils (référentiels)
3. Créer employeurs si nécessaire
4. Créer formateurs
5. Créer participants
6. Créer formations (avec les IDs ci-dessus)
7. Consulter les statistiques

---

## Validations (contrôles de saisie)

- Login : min 3 caractères, unique
- Nom / Prénom participant : min 2 caractères
- Titre formation : min 3 caractères
- Année : ≥ 2000
- Email : format valide
- Formation : min 4 participants
- Formateur externe : employeur obligatoire
- Mot de passe admin : complexe (défini par l'admin au démarrage)
