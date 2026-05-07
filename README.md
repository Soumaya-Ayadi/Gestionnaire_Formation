# Gestion Formation — Green Building

Application web de gestion de formations continues.  
Spring Boot 3 + PostgreSQL + JWT • React 18 + Recharts

---

## Stack

| Côté            | Technologies                                                                   |
|-----------------|--------------------------------------------------------------------------------|
| Backend         | Spring Boot 3.2, Spring Security, JWT, Hibernate, PostgreSQL, Lombok, Swagger |
| Frontend        | React 18, React Router, Axios, Recharts                                        |
| Base de données | PostgreSQL (tables créées automatiquement par Hibernate)                       |

---

## Démarrage

### 1. Base de données

Créer une base PostgreSQL :

```sql
CREATE DATABASE DevProject;
```

### 2. Backend

```bash
cd backend
# Vérifier application.properties (DB credentials, mail SMTP)
mvn clean install
mvn spring-boot:run
```

Au premier démarrage, Hibernate crée les tables et les comptes par défaut sont créés automatiquement :

| Login         | Mot de passe  | Rôle              |
|---------------|---------------|-------------------|
| `admin`       | `Admin@2025`  | Administrateur    |
| `responsable` | `Resp@2025`   | Responsable       |

> Swagger UI disponible sur : http://localhost:8081/swagger-ui.html

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'app tourne sur : http://localhost:5173

---

## Alimenter la base de données (données de test)

Un script Python de génération de données massives est disponible dans `backend/data_generation/seed_data.py`. Il insère 6 années de données (2020–2026) :

- 500 formateurs
- 2 000 participants
- 600 formations (100/an sur 12 domaines)
- ~30 000 liens formation–participant

### Prérequis

```bash
pip install faker psycopg2-binary passlib
```

### Configuration

Ouvrez `backend/data_generation/seed_data.py` et adaptez les paramètres de connexion en haut du fichier :

```python
DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "DevProject",
    "user":     "postgres",
    "password": "votre_mot_de_passe",
}
```

### Exécution

```bash
cd backend/data_generation
python seed_data.py
```

> ⚠️ Lancez ce script **après** le premier démarrage du backend (les tables doivent exister).

---

## Structure du projet

```
gestion-formation/
├── backend/
│   ├── data_generation/
│   │   └── seed_data.py          # Script de génération de données de test
│   ├── test_postman/
│   │   └── GestionFormation.postman_collection.json
│   └── src/main/java/com/formation/
│       ├── entity/               # Entités Hibernate (tables DB)
│       ├── repository/           # Spring Data JPA repositories
│       ├── service/              # Logique métier
│       ├── controller/           # REST controllers
│       ├── security/             # JWT filter, config Spring Security
│       ├── dto/                  # DTOs (données entrantes)
│       └── DataInitializer       # Seed initial (rôles + comptes par défaut)
└── frontend/
    └── src/
        ├── pages/                # Dashboard, Formations, Participants...
        ├── components/           # Layout, Sidebar
        └── services/             # axios instance, AuthContext, pagination
```

---

## Rôles et accès

| Rôle               | Accès                                                              |
|--------------------|--------------------------------------------------------------------|
| `ROLE_ADMIN`       | Tout : gestion utilisateurs, référentiels, formations, statistiques |
| `ROLE_USER`        | Formations, participants, formateurs, référentiels                 |
| `ROLE_RESPONSABLE` | **Statistiques uniquement**                                        |

---

## Endpoints principaux

```
POST   /api/auth/login              → Connexion (retourne JWT)
POST   /api/auth/create-user        → Créer un compte (ADMIN uniquement)

GET    /api/formations              → Liste (filtre optionnel : ?annee=2024)
POST   /api/formations              → Créer
PUT    /api/formations/{id}         → Modifier
DELETE /api/formations/{id}         → Supprimer
POST   /api/formations/{id}/participants        → Ajouter des participants
DELETE /api/formations/{id}/participants/{pid} → Retirer un participant

GET    /api/participants            → Liste
GET    /api/participants/{id}/formations → Historique des formations
POST   /api/participants            → Créer
PUT    /api/participants/{id}       → Modifier
DELETE /api/participants/{id}       → Supprimer

GET    /api/formateurs              → Liste
POST   /api/formateurs              → Créer (INTERNE ou EXTERNE)
PUT    /api/formateurs/{id}         → Modifier
DELETE /api/formateurs/{id}         → Supprimer

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

Le fichier de collection Postman se trouve dans :

```
backend/test_postman/GestionFormation.postman_collection.json
```

Importez-le dans Postman, puis suivez cet ordre pour tester l'API :

1. **Auth** → Login (le token JWT est sauvegardé automatiquement dans les variables d'environnement)
2. **Référentiels** → Créer domaines, structures, profils
3. **Employeurs** → Créer les employeurs (nécessaire pour les formateurs externes)
4. **Formateurs** → Créer les formateurs (INTERNE ou EXTERNE)
5. **Participants** → Créer les participants
6. **Formations** → Créer les formations en référençant les IDs ci-dessus
7. **Statistiques** → Consulter les tableaux de bord (ADMIN ou RESPONSABLE)

---

## Variables d'environnement

Le backend charge automatiquement un fichier `.env` à la racine du dossier `backend/` (via `spring-dotenv`). Créez-le en vous basant sur l'exemple suivant :

```env
JWT_SECRET=votre_secret_base64_256bits
ADMIN_PASSWORD=Admin@2025
RESP_PASSWORD=Resp@2025
MAIL_USERNAME=votre_email@gmail.com
MAIL_PASSWORD=votre_mot_de_passe_application
```

> Le fichier `.env` est listé dans `.gitignore` et ne sera pas commité.
