# Guide de déploiement Hostinger Mutualisé

## 1. Préparation du projet

### Build pour la production
```bash
npm run build
```

### Génération du client Prisma
```bash
npx prisma generate
```

## 2. Configuration Hostinger

### Base de données MySQL
1. Créer une base de données MySQL dans le panel Hostinger
2. Noter les informations de connexion :
   - Host: localhost
   - Database: votre_nom_db
   - Username: votre_username
   - Password: votre_password

### Variables d'environnement
Créer un fichier `.env` sur Hostinger avec :
```
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NEXT_PUBLIC_BASE_URL="https://votre-domaine.com"
NODE_ENV="production"
```

## 3. Upload des fichiers

### Structure des dossiers Hostinger
```
public_html/
├── .next/
├── node_modules/
├── prisma/
├── src/
├── package.json
├── package-lock.json
├── .env
└── server.js
```

### Fichiers à uploader
- Tout le contenu du dossier `out/` (après `npm run build`)
- Le dossier `node_modules/`
- Le fichier `package.json`
- Le fichier `.env` avec vos variables

## 4. Configuration serveur

### Créer server.js
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})
```

## 5. Commandes de déploiement

### Sur votre machine locale
```bash
# Build du projet
npm run build

# Génération Prisma
npx prisma generate

# Création du package
npm pack
```

### Sur Hostinger
```bash
# Installation des dépendances
npm install

# Migration de la base de données
npx prisma db push

# Démarrage du serveur
node server.js
```

## 6. Optimisations Hostinger

### .htaccess pour Next.js
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [QSA,L]
```

### Compression
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
```

## 7. Sécurité

### Protection des fichiers sensibles
```apache
<Files ".env">
    Order allow,deny
    Deny from all
</Files>

<Files "prisma/schema.prisma">
    Order allow,deny
    Deny from all
</Files>
```

## 8. Monitoring

### Logs d'erreur
- Vérifier les logs dans le panel Hostinger
- Monitorer les erreurs Prisma
- Surveiller les performances MySQL

## 9. Backup

### Sauvegarde automatique
- Configurer les backups MySQL dans Hostinger
- Exporter régulièrement les données
- Sauvegarder les fichiers de configuration

