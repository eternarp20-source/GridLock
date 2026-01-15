# GridLock - Nouvelles Fonctionnalités

## 🚀 Accès Invité - Demandes d'Adhésion

### Description
Une nouvelle fonctionnalité a été ajoutée permettant à **n'importe quel visiteur** d'accéder à l'application **sans mot de passe** en tant qu'invité et de soumettre une demande d'adhésion à l'équipe.

### Comment ça marche

#### Pour les Invités (Visiteurs)
1. **Accès à l'application** :
   - Sur l'écran de connexion, cliquez sur le bouton **"👤 Accès Invité"**
   - Vous n'avez pas besoin de mot de passe

2. **Remplir le formulaire de demande** :
   - **Nom Complet** *(obligatoire)*
   - **Email** *(obligatoire)*
   - **Numéro de Téléphone** *(optionnel)*
   - **Rôle Souhaité** *(obligatoire)*
     - Pilote
     - Coach
     - Pilote Réserve
   - **Voiture(s) d'Intérêt** *(optionnel - sélection multiple)*
     - Hypercar
     - LMP2
     - GTE
     - LMP3
     - LMGT3
   - **Message de Présentation** *(obligatoire)*

3. **Soumettre la demande** :
   - Cliquez sur **"📤 Envoyer la Demande"**
   - La demande est immédiatement sauvegardée dans la base de données locale
   - Un message de confirmation s'affiche avec l'adresse email fournie

#### Pour les Managers/Coaches
Les demandes des invités apparaissent dans la section **"📬 Demandes Pilotes"** et peuvent être :
- **Consultées** : Voir tous les détails de la candidature
- **Répondues** : Envoyer une réponse personnalisée
- **Triées** : Par statut (Attente, Résolue) ou urgence

### Données Collectées
Les demandes d'adhésion contiennent :
```javascript
{
  id: 1234567890,              // Timestamp unique
  name: "Jean Dupont",          // Nom du candidat
  email: "jean@email.com",      // Email de contact
  phone: "06 12 34 56 78",      // Téléphone (optionnel)
  role: "pilot",                // Rôle souhaité
  cars: ["hypercar", "lmgt3"],  // Voitures d'intérêt
  message: "Je suis...",        // Message de présentation
  date: "2026-01-15T10:30:00",  // Date de soumission
  statut: "attente",            // Statut (attente/résolue)
  reponse: ""                   // Réponse du manager
}
```

### Localisation du Code

#### HTML (`index.html`)
- **Ligne 31-73** : Modal d'accès invité avec formulaire
- **Bouton** : "👤 Accès Invité" sur le modal de connexion (ligne 21)

#### JavaScript (`app.js`)
- **`guestAccess()`** : Fonction pour ouvrir le modal invité
- **`submitGuestRequest()`** : Fonction pour soumettre la demande
- Les données sont sauvegardées dans `app.data.demandesPilotes`

#### CSS (`styles.css`)
- Styles pour le select multiple (ligne 732-741)
- Styles pour le bouton de fermeture `.btn-close`
- Responsive design compatible mobile

### Validation
- ✅ Tous les champs obligatoires sont vérifiés
- ✅ Validation du format email
- ✅ Sélection multiple des voitures supportée
- ✅ Messages d'erreur clairs en français

### Intégration avec le Système Existant
Les demandes des invités sont **intégrées au système existant** et s'ajoutent automatiquement à :
- `app.data.demandesPilotes` (même tableau que les demandes des pilotes connectés)
- Compteur "Demandes en Attente" du dashboard
- Section "📬 Demandes Pilotes" avec les mêmes fonctionnalités

### Notes d'Implémentation
- Pas de redirection nécessaire - accès immédiat au formulaire
- Aucune authentification requise pour les invités
- Les données sont persistantes (localStorage)
- Compatible avec tous les navigateurs modernes
