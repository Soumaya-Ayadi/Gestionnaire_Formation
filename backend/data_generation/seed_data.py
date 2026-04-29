"""
Formation Management System - LARGE Scale Data Seeder
======================================================
Generates data for 7 years (2020-2026) with:
  - 500  formateurs
  - 2000 participants
  - 700  formations  (100/year across all 12 domaines)
  - ~35 000+ formation_participant links

Requirements:
    pip install faker psycopg2-binary passlib

Usage:
    python seed_data.py
"""

import random
import hashlib
from datetime import date, timedelta

try:
    from faker import Faker
    import psycopg2
    from psycopg2.extras import execute_values
    from passlib.hash import bcrypt
except ImportError:
    print("Missing dependencies. Run: pip install faker psycopg2-binary passlib")
    exit(1)

# ── Database configuration ───────────────────────────────────────────────────
DB_CONFIG = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "DevProject",   # <-- your DB name
    "user":     "postgres",       # <-- your DB user
    "password": "soumaya",       # <-- your DB password
}

# ── Volume knobs — tweak freely ──────────────────────────────────────────────
START_YEAR = 2020
END_YEAR   = 2026           # ← extended to include 2026

N_STRUCTURES        = 40
N_EMPLOYEURS        = 30
N_FORMATEURS        = 500
N_PARTICIPANTS      = 2000
FORMATIONS_PER_YEAR = 100   # x 7 years = 700 formations total
MIN_PART_PER_FORM   = 15
MAX_PART_PER_FORM   = 60
N_USERS             = 50

# ── Static reference data ────────────────────────────────────────────────────
DOMAINES = [
    "Informatique & Numerique",
    "Management & Leadership",
    "Ressources Humaines",
    "Finance & Comptabilite",
    "Marketing & Communication",
    "Droit & Juridique",
    "Sante & Securite au Travail",
    "Langues Etrangeres",
    "Developpement Personnel",
    "Logistique & Supply Chain",
    "Qualite & ISO",
    "Environnement & Developpement Durable",
]

PROFIL_LIBELLES = [
    "Cadre superieur", "Cadre moyen", "Technicien", "Agent de maitrise",
    "Employe administratif", "Ingenieur", "Directeur", "Consultant",
]

ROLES           = ["ROLE_ADMIN", "ROLE_USER", "ROLE_RESPONSABLE"]
STRUCTURE_TYPES = ["CENTRALE", "REGIONALE"]
FORMATEUR_TYPES = ["INTERNE", "EXTERNE"]
LIEUX = [
    "Tunis", "Sfax", "Sousse", "Bizerte", "Nabeul",
    "Monastir", "Gabes", "Kairouan", "Gafsa", "En ligne",
]

# Titles per domaine
DOMAINE_TITLES = {
    "Informatique & Numerique": [
        "Python pour data scientists", "Developpement web React.js",
        "Cybersecurite & ethical hacking", "Cloud AWS et Azure",
        "DevOps et CI/CD pipelines", "Machine Learning applique",
        "Administration Linux avancee", "Bases de donnees SQL et NoSQL",
        "API REST avec Spring Boot", "Docker et Kubernetes",
        "Intelligence artificielle generative", "Power BI et Tableau",
        "Securite des applications web", "Microservices et architecture cloud",
    ],
    "Management & Leadership": [
        "Leadership transformationnel", "Gestion d'equipes a distance",
        "Management par les objectifs", "Prise de decision strategique",
        "Coaching et accompagnement", "Conduite du changement",
        "Management de la performance", "Intelligence emotionnelle",
        "Management interculturel", "Gestion de crise",
    ],
    "Ressources Humaines": [
        "Recrutement et selection", "Gestion des talents",
        "Droit du travail tunisien", "Evaluation des competences",
        "Formation des formateurs", "GPEC strategique",
        "Gestion des conflits", "Bien-etre au travail",
        "Onboarding et integration", "Digitalisation RH",
    ],
    "Finance & Comptabilite": [
        "Analyse financiere avancee", "Controle de gestion",
        "Comptabilite analytique", "Fiscalite des entreprises",
        "Budget previsionnel", "Audit financier interne",
        "Consolidation des comptes", "Tresorerie et cash management",
        "Normes IFRS", "Reporting financier",
    ],
    "Marketing & Communication": [
        "Marketing digital et SEO", "Communication institutionnelle",
        "Strategie de contenu", "Reseaux sociaux et e-reputation",
        "Techniques de negociation", "Relation client et CRM",
        "Marketing B2B", "Branding et identite visuelle",
        "Storytelling professionnel", "Email marketing",
    ],
    "Droit & Juridique": [
        "Droit des contrats", "Propriete intellectuelle",
        "RGPD et protection des donnees", "Droit des societes",
        "Contentieux commercial", "Droit public des affaires",
        "Droit de la consommation", "Droit social",
    ],
    "Sante & Securite au Travail": [
        "Prevention des risques professionnels", "Secourisme SST",
        "Gestion du stress professionnel", "Ergonomie du poste de travail",
        "Plan d'urgence et evacuation", "Hygiene industrielle",
        "Risques chimiques et biologiques", "Securite incendie",
        "Troubles musculo-squelettiques", "Risques psychosociaux",
    ],
    "Langues Etrangeres": [
        "Anglais des affaires niveau B1", "Anglais des affaires niveau B2",
        "Francais professionnel", "Espagnol commercial",
        "Prise de parole en anglais", "Redaction professionnelle en francais",
        "Anglais technique", "Anglais niveau C1",
    ],
    "Developpement Personnel": [
        "Gestion du temps et priorites", "Prise de parole en public",
        "Assertivite et confiance en soi", "Mindfulness et pleine conscience",
        "Gestion du stress", "Productivite personnelle",
        "Intelligence relationnelle", "Creativite et innovation",
        "PNL appliquee", "Resilience professionnelle",
    ],
    "Logistique & Supply Chain": [
        "Gestion des stocks et entrepots", "Transport et distribution",
        "Achats et approvisionnement", "Lean management",
        "Planification de la production", "Import-export et douanes",
        "ERP SAP pour logisticiens", "Supply chain durable",
        "Gestion des fournisseurs", "Optimisation de la chaine logistique",
    ],
    "Qualite & ISO": [
        "ISO 9001:2015 mise en oeuvre", "Audit qualite interne",
        "Amelioration continue et Kaizen", "Six Sigma Green Belt",
        "Management de la qualite totale", "HACCP alimentaire",
        "ISO 14001 management environnemental", "Certification ISO 45001",
        "Methode 5S en entreprise", "Tableau de bord qualite",
    ],
    "Environnement & Developpement Durable": [
        "RSE et developpement durable", "Bilan carbone des organisations",
        "Eco-conception des produits", "Gestion des dechets industriels",
        "Transition energetique", "Reporting ESG",
        "Economie circulaire", "Green IT",
        "Biodiversite en entreprise", "Financement vert",
    ],
}

POPULAR_DOMAINES = {
    "Informatique & Numerique",
    "Management & Leadership",
    "Ressources Humaines",
    "Finance & Comptabilite",
    "Sante & Securite au Travail",
    "Qualite & ISO",
}

# ── Helpers ──────────────────────────────────────────────────────────────────

def bcrypt_stub(password: str) -> str:
    return bcrypt.hash(password)

def random_date_range(year: int):
    """
    For 2026: only generate dates up to today (April 2026) so the seeder
    doesn't create future-heavy data that all shows as A_VENIR.
    Adjust the month cap as needed.
    """
    today = date.today()
    if year < today.year:
        month = random.randint(1, 12)
    else:
        # current year: cap month at current month so dates are realistic
        month = random.randint(1, today.month)

    day   = random.randint(1, 25)
    start = date(year, month, day)
    duration = random.randint(3, 20)
    end   = start + timedelta(days=duration)

    # Clamp to end of year
    year_end = date(year, 12, 28)
    if end > year_end:
        end = year_end

    # Clamp to today for current year (avoid far-future dates)
    if year == today.year and end > today:
        end = today
    if year == today.year and start > today:
        start = today - timedelta(days=duration)
        end   = today

    return start, end

def formation_state(d1: date, d2: date) -> str:
    today = date.today()
    if today < d1:  return "A_VENIR"
    if today > d2:  return "TERMINEE"
    return "EN_COURS"

def pick_title(domaine: str, used: set) -> str:
    pool = DOMAINE_TITLES.get(domaine, ["Formation specialisee"])
    available = [t for t in pool if t not in used]
    if not available:
        base = random.choice(pool)
        suffix = random.choice(["avance", "pratique", "niveau 2", "approfondissement"])
        return f"{base} - {suffix}"
    title = random.choice(available)
    used.add(title)
    return title

# ── Main seeder ──────────────────────────────────────────────────────────────

def seed(conn):
    fake = Faker("fr_FR")
    Faker.seed(42)
    random.seed(42)

    cur = conn.cursor()

    # 1. Roles
    print("[1/10] Seeding roles...")
    role_ids = {}
    for nom in ROLES:
        cur.execute(
            "INSERT INTO role (nom) VALUES (%s) ON CONFLICT (nom) DO UPDATE SET nom=EXCLUDED.nom RETURNING id",
            (nom,)
        )
        role_ids[nom] = cur.fetchone()[0]
    conn.commit()

    # 2. Domaines
    print("[2/10] Seeding domaines...")
    domaine_map = {}
    for libelle in DOMAINES:
        cur.execute(
            "INSERT INTO domaine (libelle) VALUES (%s) ON CONFLICT (libelle) DO UPDATE SET libelle=EXCLUDED.libelle RETURNING id",
            (libelle,)
        )
        domaine_map[libelle] = cur.fetchone()[0]
    conn.commit()

    # 3. Structures
    print("[3/10] Seeding structures...")
    structure_ids = []
    seen_struct = set()
    while len(structure_ids) < N_STRUCTURES:
        libelle = fake.company()[:80]
        if libelle in seen_struct:
            continue
        seen_struct.add(libelle)
        cur.execute(
            "INSERT INTO structure (libelle, type) VALUES (%s, %s) RETURNING id",
            (libelle, random.choice(STRUCTURE_TYPES))
        )
        structure_ids.append(cur.fetchone()[0])
    conn.commit()

    # 4. Profils
    print("[4/10] Seeding profils...")
    profil_ids = []
    for libelle in PROFIL_LIBELLES:
        cur.execute(
            "INSERT INTO profil (libelle) VALUES (%s) ON CONFLICT (libelle) DO UPDATE SET libelle=EXCLUDED.libelle RETURNING id",
            (libelle,)
        )
        profil_ids.append(cur.fetchone()[0])
    conn.commit()

    # 5. Employeurs
    print("[5/10] Seeding employeurs...")
    employeur_ids = []
    for _ in range(N_EMPLOYEURS):
        cur.execute(
            "INSERT INTO employeur (nom_employeur) VALUES (%s) RETURNING id",
            (fake.company()[:100],)
        )
        employeur_ids.append(cur.fetchone()[0])
    conn.commit()

    # 6. Formateurs
    print(f"[6/10] Seeding {N_FORMATEURS} formateurs...")
    formateur_ids = []
    for _ in range(N_FORMATEURS):
        ftype  = random.choice(FORMATEUR_TYPES)
        emp_id = random.choice(employeur_ids) if ftype == "EXTERNE" else None
        cur.execute(
            "INSERT INTO formateur (nom, prenom, email, tel, type, employeur_id) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
            (fake.last_name(), fake.first_name(), fake.unique.email(), fake.phone_number()[:20], ftype, emp_id)
        )
        formateur_ids.append(cur.fetchone()[0])
    conn.commit()

    # 7. Participants
    print(f"[7/10] Seeding {N_PARTICIPANTS} participants...")
    participant_ids = []
    for _ in range(N_PARTICIPANTS):
        cur.execute(
            "INSERT INTO participant (nom, prenom, email, tel, structure_id, profil_id) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
            (fake.last_name(), fake.first_name(), fake.unique.email(), fake.phone_number()[:20],
             random.choice(structure_ids), random.choice(profil_ids))
        )
        participant_ids.append(cur.fetchone()[0])
    conn.commit()

    # 8. Formations — guaranteed spread per domaine per year
    total_years = END_YEAR - START_YEAR + 1
    print(f"[8/10] Seeding formations ({FORMATIONS_PER_YEAR}/year x {total_years} years = {FORMATIONS_PER_YEAR * total_years} total)...")
    formation_records = []  # (id, domaine_libelle, year)

    for year in range(START_YEAR, END_YEAR + 1):
        # Guarantee 1 slot per domaine, fill the rest weighted
        base_slots  = DOMAINES[:]
        extra_count = FORMATIONS_PER_YEAR - len(DOMAINES)
        weights     = [3 if d in POPULAR_DOMAINES else 1 for d in DOMAINES]
        extra_slots = random.choices(DOMAINES, weights=weights, k=extra_count)
        all_slots   = base_slots + extra_slots
        random.shuffle(all_slots)

        used_titles: dict[str, set] = {}
        for domaine_libelle in all_slots:
            used_titles.setdefault(domaine_libelle, set())
            titre      = pick_title(domaine_libelle, used_titles[domaine_libelle])
            d1, d2     = random_date_range(year)
            etat       = formation_state(d1, d2)
            budget     = round(random.uniform(1000, 80000), 2)
            formateur  = random.choice(formateur_ids) if random.random() > 0.05 else None

            cur.execute(
                """INSERT INTO formation
                   (titre, annee, date_debut, date_fin, budget, lieu, etat, domaine_id, formateur_id)
                   VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id""",
                (titre, year, d1, d2, budget, random.choice(LIEUX), etat,
                 domaine_map[domaine_libelle], formateur)
            )
            fid = cur.fetchone()[0]
            formation_records.append((fid, domaine_libelle, year))

        conn.commit()
        print(f"    {year}: {len(all_slots)} formations inserted")

    # 9. formation_participant — bulk
    print(f"[9/10] Seeding formation_participant links...")
    links = set()
    for (fid, _, _) in formation_records:
        n       = random.randint(MIN_PART_PER_FORM, MAX_PART_PER_FORM)
        chosen  = random.sample(participant_ids, min(n, len(participant_ids)))
        for pid in chosen:
            links.add((fid, pid))

    links_list = list(links)
    batch_size = 5000
    total      = len(links_list)
    for i in range(0, total, batch_size):
        batch = links_list[i : i + batch_size]
        execute_values(
            cur,
            "INSERT INTO formation_participant (formation_id, participant_id) VALUES %s ON CONFLICT DO NOTHING",
            batch
        )
        conn.commit()
        print(f"    {min(i + batch_size, total):>6}/{total} links inserted")

    # 10. Utilisateurs
    print("[10/10] Seeding utilisateurs...")
    for login, pwd, email, role in [
        ("admin",       "Admin@2024",  "admin@formation.tn",       "ROLE_ADMIN"),
        ("responsable", "Resp@2024",   "responsable@formation.tn", "ROLE_RESPONSABLE"),
    ]:
        cur.execute(
            "INSERT INTO utilisateur (login, password, email, role_id, active) VALUES (%s,%s,%s,%s,%s) ON CONFLICT (login) DO NOTHING",
            (login, bcrypt_stub(pwd), email, role_ids[role], True)
        )
    conn.commit()

    # ── Summary ──────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("SEEDING COMPLETE")
    print("=" * 60)
    for table in ["role", "domaine", "structure", "profil", "employeur",
                  "formateur", "participant", "formation",
                  "formation_participant", "utilisateur"]:
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        print(f"  {table:<30} {cur.fetchone()[0]:>7} rows")

    print("\nParticipants per domaine per year:")
    print("-" * 60)
    cur.execute("""
        SELECT d.libelle, f.annee, COUNT(DISTINCT fp.participant_id) AS nb
        FROM formation_participant fp
        JOIN formation f ON fp.formation_id = f.id
        JOIN domaine   d ON f.domaine_id    = d.id
        GROUP BY d.libelle, f.annee
        ORDER BY d.libelle, f.annee
    """)
    prev = None
    for libelle, annee, nb in cur.fetchall():
        if libelle != prev:
            print(f"\n  {libelle}")
            prev = libelle
        print(f"    {annee}: {nb:>5} participants")

    cur.close()


if __name__ == "__main__":
    print(f"Connecting to {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']} ...")
    print(f"Seeding years: {START_YEAR} → {END_YEAR}")
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        seed(conn)
        conn.close()
    except psycopg2.OperationalError as e:
        print(f"\nConnection failed: {e}")
        print("Check DB_CONFIG at the top of the file.")