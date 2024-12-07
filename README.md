# Gestion de contrats API

## Description
Cette API est une solution pour gérer des utilisateurs et des contrats. Elle inclut les fonctionnalités suivantes :
- Enregistrement et authentification des utilisateurs avec JWT.
- Gestion des contrats : création, modification, suppression et recherche.
- API RESTful documentée avec Swagger.

## Prérequis
Avant de commencer, assurez-vous que les outils suivants sont installés sur votre machine :
- [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/)
- Facultatif : Python 3.10+ (si vous voulez exécuter sans Docker)

---

## Installation et Lancement

### 1. Clonez le dépôt
```bash
git clone https://github.com/valoup917/tendanz
cd tendanz
```
### 2. Créez un fichier .env
Dans le répertoire property, créez un fichier .env pour configurer les variables d'environnement :
```bash
FLASK_ENV=development
DATABASE_URL=postgresql://username:password@tendanz_db:5432/tendanz_db
JWT_EXPIRATION=3600
SECRET_KEY=your_jwt_secret
PORT=5100
```

### 3. Lancer l'application avec Docker
## Étapes :
a. Construire les images et démarrer les conteneurs :

```bash
docker compose up --build -d
```

b. Accédez aux services :

Swagger UI : http://localhost:5100/swagger

c. Lancer la création des tables de db:

http://localhost:5100/swagger/#/Setup/post_load_db


### 4. Démarrer le frontend 
## Étapes :
a. Accédez au répertoire du frontend :
b. Installez les dépendances :
c. Lancez le serveur de développement :

```bash
cd frontend
npm install
npm run dev
```

d. Accédez au frontend :

L'interface utilisateur est disponible sur http://localhost:3000