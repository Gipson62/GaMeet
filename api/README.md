# GaMeet API

## Installation

### 1. Créer le fichier `.env`

Créer un fichier `.env` dans le répertoire `api/` :

```toml
PORT=5432
USERDB=root
PASSWORDDB=root
DBNAME=database
HOSTDB=postgres
DATABASE_URL="postgresql://root:root@postgres:5432/database"
JWT_SECRET=JeSuisUnSecretTrèsSûr123!
PEPPER=UnPepperTrèsSûre!
```


### 2. Démarrer l'API avec Docker Compose

Exécuter la commande suivante depuis le répertoire `api/` :

```bash
docker compose up
``` 
