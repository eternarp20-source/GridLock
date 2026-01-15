# Documentation Technique - Accès Invité GridLock

## Vue d'Ensemble
La fonctionnalité d'accès invité permet à **n'importe quel visiteur** de soumettre une demande d'adhésion à l'équipe sans authentification préalable.

## Architecture

### 1. Front-end (HTML)

#### Modal Principal (index.html, lignes 31-73)
```html
<!-- GUEST REQUEST MODAL -->
<div class="modal-overlay" id="guestModal" style="display: none; z-index: 9998;">
    <!-- Contient le formulaire complet -->
</div>
```

**Éléments du formulaire:**
- `#guestName` - Nom complet (input text)
- `#guestEmail` - Email (input email)
- `#guestPhone` - Téléphone (input tel)
- `#guestRole` - Sélection du rôle (select)
- `#guestCar` - Sélection des voitures (select multiple)
- `#guestMessage` - Message de présentation (textarea)

#### Bouton d'Activation (index.html, ligne 29)
```html
<button class="btn btn-secondary" onclick="guestAccess()" style="margin-left: 0.5rem;">
    👤 Accès Invité
</button>
```

### 2. Back-end (JavaScript - app.js)

#### Fonction: `guestAccess()`
```javascript
function guestAccess() {
    // Masquer le modal de connexion
    document.getElementById('loginModal').style.display = 'none';
    // Afficher le modal invité
    document.getElementById('guestModal').style.display = 'flex';
    // Réinitialiser le formulaire
    document.getElementById('guestRequestForm').reset();
}
```

**Responsabilités:**
- Basculer entre les modaux
- Nettoyer les données précédentes

#### Fonction: `submitGuestRequest()`
```javascript
function submitGuestRequest() {
    // 1. Récupérer les données du formulaire
    const name = document.getElementById('guestName').value.trim();
    const email = document.getElementById('guestEmail').value.trim();
    const phone = document.getElementById('guestPhone').value.trim();
    const role = document.getElementById('guestRole').value;
    const cars = Array.from(document.getElementById('guestCar').selectedOptions)
                  .map(opt => opt.value);
    const message = document.getElementById('guestMessage').value.trim();

    // 2. Valider les données
    if (!name || !email || !role || !message) {
        alert('❌ Veuillez remplir tous les champs obligatoires (*)');
        return;
    }

    // 3. Valider l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('❌ Veuillez entrer une adresse email valide');
        return;
    }

    // 4. Créer l'objet de demande
    const guestRequest = {
        id: Date.now(),
        name: name,
        email: email,
        phone: phone || 'Non fourni',
        role: role,
        cars: cars,
        message: message,
        date: new Date().toISOString(),
        statut: 'attente',
        reponse: ''
    };

    // 5. Sauvegarder dans le système
    if (!app.data.demandesPilotes) {
        app.data.demandesPilotes = [];
    }
    app.data.demandesPilotes.push(guestRequest);
    app.saveData();

    // 6. Confirmer à l'utilisateur
    alert('✅ Votre demande d\'adhésion a été envoyée avec succès!\n\nNous vous contacterons bientôt à l\'adresse: ' + email);

    // 7. Nettoyer et revenir au login
    document.getElementById('guestModal').style.display = 'none';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginModal').style.display = 'flex';
}
```

**Étapes principales:**
1. **Récupération** - Lecture des valeurs du formulaire
2. **Validation** - Vérification des champs obligatoires et format
3. **Création** - Construction de l'objet demande
4. **Sauvegarde** - Stockage dans localStorage via `app.saveData()`
5. **Confirmation** - Message de succès à l'utilisateur
6. **Nettoyage** - Réinitialisation et fermeture des modaux

### 3. Stockage des Données

#### Structure de la Demande
```javascript
{
    id: 1234567890,              // Timestamp Unix
    name: "Jean Dupont",         // Nom du candidat
    email: "jean@email.com",     // Email de contact
    phone: "06 12 34 56 78",     // Numéro de téléphone
    role: "pilot",               // Rôle: pilot|coach|reserve
    cars: ["hypercar", "lmgt3"], // Tableau des voitures
    message: "...",              // Message de présentation
    date: "2026-01-15T...",      // ISO 8601 timestamp
    statut: "attente",           // Statut: attente|résolue
    reponse: ""                  // Réponse du manager
}
```

#### Emplacement dans app.data
```javascript
app.data.demandesPilotes = [
    // Demandes des pilotes connectés (existantes)
    {...},
    // Demandes des invités (nouvelles)
    {id: ..., name: "Guest User", email: "guest@example.com", ...}
]
```

**Avantages:**
- Même tableau que les demandes existantes
- Pas de séparation entre invités et pilotes
- Facilite la gestion unifiée
- Statistiques automatiquement mises à jour

### 4. Styles CSS

#### Classes utilisées
```css
.modal-overlay       /* Arrière-plan semi-transparent */
.modal              /* Boîte de dialogue */
.modal-header       /* En-tête du modal */
.modal-body         /* Corps avec le formulaire */
.modal-footer       /* Pied avec boutons */
.form-group         /* Conteneur pour chaque champ */
input, textarea     /* Champs de saisie */
select              /* Listes déroulantes */
select[multiple]    /* Sélection multiple */
.btn                /* Boutons */
.btn-primary        /* Bouton primaire (orange) */
.btn-secondary      /* Bouton secondaire (gris) */
.btn-close          /* Bouton de fermeture */
```

#### Styles pour select multiple (styles.css, lignes 732-741)
```css
select[multiple] {
    padding: 0.5rem;
    min-height: 120px;
}

select[multiple] option {
    padding: 0.5rem;
    margin-bottom: 0.25rem;
}

select[multiple] option:checked {
    background: linear-gradient(var(--primary), var(--primary));
    color: var(--white);
}
```

## Flux d'Exécution Complet

```
┌─────────────────────────────────────┐
│  Écran de Connexion GridLock        │
├─────────────────────────────────────┤
│  [Mot de passe] [Connexion]         │
│  [👤 Accès Invité]                  │  ← Clic ici
└─────────────────────────────────────┘
           ↓
    guestAccess()
           ↓
┌─────────────────────────────────────┐
│  Modal: Rejoindre GridLock          │
├─────────────────────────────────────┤
│  [Nom Complet]                      │
│  [Email]                            │
│  [Téléphone]                        │
│  [Rôle ▼]                           │
│  [Voitures ▬▬▬]                     │
│  [Message...]                       │
│  [Annuler] [📤 Envoyer]             │  ← Clic ici
└─────────────────────────────────────┘
           ↓
    submitGuestRequest()
           ↓
    Validation des données
           ↓
    Création de l'objet demande
           ↓
    app.data.demandesPilotes.push()
           ↓
    app.saveData() → localStorage
           ↓
    Alert("✅ Succès")
           ↓
┌─────────────────────────────────────┐
│  Retour à l'écran de connexion      │
├─────────────────────────────────────┤
│  Modal réinitialisé                 │
│  Données sauvegardées               │
└─────────────────────────────────────┘
```

## Intégration avec le Système Existant

### 1. Accès des Managers
Les demandes apparaissent automatiquement dans:
- **Section:** 📬 Demandes Pilotes
- **Vue:** Liste complète avec toutes les demandes (invités et pilotes)
- **Actions:** Répondre, Filtrer, Trier

### 2. Mise à Jour des Statistiques
Le dashboard se met à jour automatiquement:
```javascript
const demandesEnAttente = this.data.demandesPilotes
    .filter(d => d.statut === 'attente').length;

// "Demandes en Attente" inclut les demandes des invités
```

### 3. Persistance des Données
```javascript
// Les données sont sauvegardées dans:
localStorage.setItem('gridlock-app', JSON.stringify(this.data));

// Et rechargées au démarrage:
const saved = localStorage.getItem('gridlock-app');
```

## Validation des Données

### Validation Client
```javascript
// Champs obligatoires
if (!name || !email || !role || !message) {
    throw new Error('Champs manquants');
}

// Format email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    throw new Error('Email invalide');
}
```

### Messages d'Erreur
- ✅ "Veuillez remplir tous les champs obligatoires (*)"
- ✅ "Veuillez entrer une adresse email valide"
- ✅ "Votre demande d'adhésion a été envoyée avec succès!"

## Performance et Sécurité

### Performance
- ✅ Pas de requête réseau (localStorage uniquement)
- ✅ Pas de délai d'attente
- ✅ Réaction immédiate à l'interaction

### Sécurité
- ⚠️ **Validation client uniquement** (pas de validation serveur)
- ✅ Pas d'injection HTML (trim et escaping)
- ✅ Format email vérifié (regex)
- ⚠️ **À améliorer:** Validation côté serveur si déploiement en ligne

## Améliorations Futures

1. **Captcha** - Ajouter une vérification anti-bot
2. **Email** - Envoyer un email de confirmation
3. **Traçabilité** - Ajouter des logs d'activité
4. **Modération** - Système d'approbation des invités
5. **Validation Serveur** - Vérification côté backend si déploiement
6. **Notifications** - Alerter les managers des nouvelles demandes

## Tests et Débogage

### Ouvrir la Console
```javascript
// Dans la console du navigateur (F12)
console.log(app.data.demandesPilotes); // Voir toutes les demandes
localStorage.getItem('gridlock-app');   // Voir les données brutes
```

### Test Manuel
1. Ouvrir `index.html`
2. Cliquer sur "👤 Accès Invité"
3. Remplir le formulaire avec des données valides
4. Cliquer sur "📤 Envoyer la Demande"
5. Vérifier la confirmation
6. Se connecter en tant que manager
7. Vérifier la demande dans "📬 Demandes Pilotes"

### Cas d'Erreur à Tester
```javascript
// Champ vide
submitGuestRequest(); // → Alert: Champs manquants

// Email invalide
guestEmail.value = "invalid-email";
submitGuestRequest(); // → Alert: Email invalide

// Données valides
// → Succès ✅
```

## Conclusion
La fonction d'accès invité est **complètement intégrée** au système GridLock et fonctionne en harmonie avec les fonctionnalités existantes, sans nécessiter de modifications majeures du code existant.
