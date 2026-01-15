# 🔧 GUIDE DÉBOGAGE - Demandes Invités

## ✅ Ce qui a été corrigé

### Problème Identifié
Les demandes invités n'apparaissaient pas dans la section "📬 Demandes Pilotes" car les noms de propriétés ne correspondaient pas.

### Solution Appliquée
Les propriétés de l'objet demande invité ont été alignées avec le système existant:

**Avant:**
```javascript
{
    name: "Jean",
    message: "Je veux rejoindre..."
}
```

**Après:**
```javascript
{
    nom: "Jean",              // ✅ Changé pour compatibilité
    question: "Je veux...",   // ✅ Changé pour compatibilité
    urgence: "normale",       // ✅ Ajouté
    assigneA: "",            // ✅ Ajouté
    // + autres champs
}
```

---

## 🛠️ Comment Tester

### Étape 1: Ouvrir la Console (F12)
1. Appuyez sur **F12** dans le navigateur
2. Allez sur l'onglet **Console**
3. Vous verrez les messages de débogage

### Étape 2: Soumettre une Demande
1. Cliquez sur "👤 Accès Invité"
2. Remplissez le formulaire:
   - Nom: **TestUser**
   - Discord: **TestUser#1234**
   - Rôle: **Pilote**
   - Message: **Je teste le formulaire**
3. Cliquez "📤 Envoyer la Demande"

### Étape 3: Vérifier la Console
Vous devriez voir des messages comme:
```
📋 Tentative d'envoi de demande invité: {name: "TestUser", discord: "TestUser#1234", ...}
📦 Objet demande créé: {nom: "TestUser", question: "Je teste...", ...}
✅ Demande ajoutée. Total demandes: 1
💾 Données sauvegardées dans localStorage
```

---

## 📍 Où Trouver les Demandes

### Pour les Managers

1. **Ouvrir** index.html
2. **Se connecter** avec le mot de passe manager
   - Mot de passe: `Captain0310`
3. **Aller à**: "📬 Demandes Pilotes" (dans le sidebar)
4. **Voir** toutes les demandes des invités

### Les Demandes Affichent

| Colonne | Contenu |
|---------|---------|
| **Nom** | Nom complet de l'invité |
| **Question** | Les 50 premiers caractères du message |
| **Date** | Quand la demande a été soumise |
| **Urgence** | 🟢 Faible, 🟡 Normale, 🔴 Haute |
| **Statut** | ⏳ En attente, 🔄 En cours, ✅ Résolue, ❌ Rejetée |
| **Réponse** | Message du manager |
| **Assigné à** | Coach ou personne responsable |
| **Actions** | 💬 Répondre, 🔔 Discord, 🗑️ Supprimer |

---

## 🔍 Vérification dans localStorage

### Ouvrir la Console
1. **F12** → Onglet **Console**
2. Tapez cette commande:

```javascript
console.log(app.data.demandesPilotes)
```

**Résultat:** Vous verrez toutes les demandes sauvegardées:

```javascript
[
  {
    id: 1737988800000,
    nom: "Jean Dupont",
    discord: "JeanD#5678",
    role: "pilot",
    question: "Je suis un pilote expérimenté...",
    statut: "attente",
    urgence: "normale",
    reponse: "",
    assigneA: ""
  }
]
```

---

## 🎯 Flux Complet

```
INVITÉ
  │
  ├─ 1. Clique "👤 Accès Invité"
  ├─ 2. Remplit formulaire
  ├─ 3. Clique "📤 Envoyer"
  └─ 4. Console affiche logs ✅
         │
         ↓
STOCKAGE
  │
  ├─ Demande créée
  ├─ localStorage.setItem('gridlock-app', ...)
  ├─ app.data.demandesPilotes.push()
  └─ Alert "✅ Succès" ✅
         │
         ↓
MANAGER
  │
  ├─ Se connecte
  ├─ Va à "📬 Demandes Pilotes"
  ├─ Voit les demandes des invités
  ├─ Peut répondre/assigner/supprimer
  └─ Discord: reçoit la notification
```

---

## ✅ Checklist de Vérification

- [ ] Formulaire se remplit sans erreurs
- [ ] Bouton "📤 Envoyer" cliquable
- [ ] Alert "✅ Succès" s'affiche
- [ ] Console montre les logs (F12)
- [ ] `app.data.demandesPilotes` contient la demande
- [ ] Manager peut voir dans "📬 Demandes Pilotes"
- [ ] Les données persistent (F5 refresh)

---

## 🐛 Dépannage

### Rien ne se passe quand je clique "Envoyer"
**Solution:**
1. Vérifier tous les champs sont remplis (*)
2. Ouvrir la console (F12)
3. Vérifier s'il y a des erreurs en rouge
4. Rafraîchir la page (F5)

### Je ne vois pas la demande après envoi
**Solution:**
1. Se connecter en tant que manager
2. Aller à "📬 Demandes Pilotes"
3. Vérifier que le total dans le dashboard a augmenté
4. Vérifier la console: `console.log(app.data.demandesPilotes)`

### L'app ne se charge pas
**Solution:**
1. Ouvrir DevTools (F12)
2. Vérifier les erreurs
3. Vérifier que tous les fichiers (app.js, index.html, styles.css) sont présents
4. Rafraîchir la page (Ctrl+Shift+R hard refresh)

### localStorage est vide
**Solution:**
1. Vérifier les paramètres du navigateur (ne pas utiliser mode privé/incognito)
2. localStorage doit être activé
3. Vérifier: `localStorage.getItem('gridlock-app')`

---

## 💬 Propriétés de la Demande Invité

```javascript
{
    id: 1737988800000,              // Timestamp unique
    nom: "Jean Dupont",             // Nom invité
    discord: "JeanD#1234",          // Pseudo Discord
    role: "pilot|coach|reserve",    // Rôle souhaité
    cars: ["hypercar", "lmgt3"],    // Voitures d'intérêt
    question: "Je suis...",         // Message de présentation
    dateCreation: "2026-01-15...",  // Date ISO
    date: "2026-01-15...",          // Date ISO (alias)
    statut: "attente",              // attente|en-cours|résolue|rejetée
    urgence: "normale",             // faible|normale|haute
    reponse: "",                    // Réponse du manager
    assigneA: ""                    // Coach assigné
}
```

---

## 🎉 C'est Réparé!

Les demandes invités sont maintenant correctement:
- ✅ Créées
- ✅ Sauvegardées  
- ✅ Affichées aux managers
- ✅ Gérables et répondables

**La fonctionnalité est OPÉRATIONELLE!** 🚀
