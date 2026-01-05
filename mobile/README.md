
Lien pour l'API: https://github.com/Gipson62/GaMeet
> [!Note]
> L'API est dans le dossier `api` à la racine du projet.

Ajoutez un fichier `.env` dans le dossier `api` avec le contenu suivant:
> ```toml
> PORT=5432
> USERDB=root
> PASSWORDDB=root
> DBNAME=database
> HOSTDB=postgres
> DATABASE_URL=postgresql://root:root@postgres:5432/database
> JWT_SECRET=JeSuisUnSecretTrèsSûr123!
> PEPPER=UnPepperTrèsSûre!
> ```

Une fois dans le dossier `api`, exécutez ces commandes:
> ```bash
> npm i
> docker compose up --build
> ```

NB: N'oubliez pas de changez votre adresse IP dans le fichier ``src/config/index.js``.
