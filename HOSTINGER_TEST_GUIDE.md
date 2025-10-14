# 🚀 Guide de Test avec Base de Données Hostinger

## Vision du Projet
1. **Phase 1** : Tester le formulaire avec la base de données Hostinger (développement local)
2. **Phase 2** : Déployer l'app complète sur Hostinger

## 📋 Étapes de Configuration

### 1. Configuration de la Connexion
```bash
# Exécuter le script de configuration
./scripts/setup-hostinger-connection.sh
```
Ce script vous demandera :
- Nom d'utilisateur de votre base de données Hostinger
- Mot de passe de votre base de données Hostinger  
- Nom de votre base de données Hostinger

### 2. Test de la Connexion
```bash
# Tester la connexion et synchroniser le schéma
./scripts/test-hostinger-connection.sh
```

### 3. Démarrage du Serveur
```bash
# Démarrer le serveur de développement
npm run dev
```

## 🧪 Tests à Effectuer

### Test 1 : Formulaire Acheteur
1. Aller sur `http://localhost:3000/contact`
2. Remplir le formulaire avec :
   - Nom complet
   - Téléphone (avec indicatif pays)
   - Email
   - Budget
   - Message
3. Cocher "Accompagnement confidentiel"
4. Cliquer sur "Envoyer en toute discrétion"

### Test 2 : Formulaire Vendeur
1. Aller sur `http://localhost:3000/contact?type=sell`
2. Remplir le formulaire avec :
   - Nom complet
   - Téléphone (avec indicatif pays)
   - Email
   - Estimation du bien
   - Message
3. Cocher "Accompagnement confidentiel"
4. Cliquer sur "Envoyer en toute discrétion"

### Test 3 : Vérification Dashboard
1. Aller sur `http://localhost:3000/dashboard`
2. Se connecter avec vos identifiants admin
3. Vérifier que les nouveaux contacts apparaissent avec :
   - ✅ Drapeaux des pays
   - ✅ Statuts modifiables
   - ✅ Informations complètes

### Test 4 : Vérification Base de Données
```bash
# Ouvrir Prisma Studio pour voir les données
npx prisma studio
```

## 🎯 Résultats Attendus

- ✅ Les données s'enregistrent dans votre base Hostinger
- ✅ Le dashboard affiche les nouveaux contacts avec drapeaux
- ✅ Les statuts sont modifiables sans erreur
- ✅ Les formulaires fonctionnent parfaitement

## 🚀 Phase Suivante : Déploiement

Une fois tous les tests validés, nous déploierons l'app complète sur Hostinger avec :
- Configuration de production
- Optimisations de performance
- Sécurité renforcée
- Monitoring

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez vos informations de connexion Hostinger
2. Assurez-vous que votre base de données est accessible
3. Consultez les logs du serveur pour les erreurs


