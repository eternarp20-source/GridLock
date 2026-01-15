// ==================== CARS LIST ====================
const GRIDLOCK_LOGO = 'https://via.placeholder.com/40/111827/ff6b35?text=GL';

const CARS = {
    hypercar: [
        'Alpine A424 ',
        'Aston Martin Valkyrie AMR LMH Hypercar',
        'BMW M Hybrid V8 ',
        'Cadillac V-Series.R',
        'Ferrari 499P',
        'Glickenhaus SCG 007',
        'Isotta Fraschini Tipo 6-C ',
        'Lamborghini SC63 ',
        'Peugeot 9X8 2023',
        'Peugeot 9X8 2024 ',
        'Porsche 963',
        'Toyota GR010-Hybrid',
        'Vanwall Vandervell 680'
    ],
    lmp2: [
        'Oreca 07 Gibson'
    ],
    gte: [
        'Aston Martin Vantage GTE',
        'Chevrolet Corvette C8.R',
        'Ferrari 488 GTE Evo',
        'Porsche 911 RSR-19'
    ],
    lmp3: [
        'Ligier JS P325',
        'Ginetta G61-LT-P3 Evo ',
        'Duqueine D09 '
    ],
    lmgt3: [
        'Aston Martin Vantage AMR LMGT3 Evo ',
        'BMW M4 LMGT3 ',
        'BMW M4 LMGT3 Evo ',
        'Chevrolet Corvette Z06 LMGT3.R ',
        'Ferrari 296 LMGT3 ',
        'Ford Mustang LMGT3 ',
        'Lamborghini Huracán LMGT3 Evo 2 ',
        'Lexus RC F LMGT3 ',
        'Mercedes-AMG LMGT3',
        'McLaren 720S LMGT3 Evo ',
        'Porsche 911 LMGT3 R (992) '
    ]
};
// ==================== APP STATE ====================
const app = {
    type: null,
    userRole: null,
    userNom: null,  // Stocker le nom du pilote qui s'est connecté // 'manager', 'coach', 'pilot', ou null
    passwords: {
        manager: 'Captain0310',
        coach: 'coach123',
        pilot: 'pilot123'
    },
    data: {
        trainings: [],
        technical: [],
        pilots: [],
        announcements: [],
        raceWeekends: [],
        coaching: [],
        resultatCoaching: [],
        demandesPilotes: []
    },
    activity: [],

    init() {
        this.loadData();
        // Modal affiché par défaut dans le HTML
    },

    authenticate(password) {
        if (password === this.passwords.manager) {
            this.userRole = 'manager';
            return true;
        } else if (password === this.passwords.coach) {
            this.userRole = 'coach';
            return true;
        } else if (password === this.passwords.pilot) {
            this.userRole = 'pilot';
            return true;
        }
        return false;
    },

    loadData() {
        const saved = localStorage.getItem('gridlock-app');
        if (saved) {
            try {
                Object.assign(this.data, JSON.parse(saved));
            } catch (e) {
                console.error('Load error:', e);
            }
        }
        
        // Charger les mots de passe
        const savedPasswords = localStorage.getItem('gridlock-passwords');
        if (savedPasswords) {
            try {
                Object.assign(this.passwords, JSON.parse(savedPasswords));
            } catch (e) {
                console.error('Password load error:', e);
            }
        }

        // Charger le nom du pilot
        const savedUserNom = localStorage.getItem('gridlock-userNom');
        if (savedUserNom) {
            this.userNom = savedUserNom;
        }
    },

    saveData() {
        localStorage.setItem('gridlock-app', JSON.stringify(this.data));
        this.updateStats();
        this.render();
    },

    updateStats() {
        const totalDemandes = this.data.demandesPilotes.length;
        const demandesEnAttente = this.data.demandesPilotes.filter(d => d.statut === 'attente').length;
        const demandesUrgentes = this.data.demandesPilotes.filter(d => d.urgence === 'haute').length;
        const demandesResolues = this.data.demandesPilotes.filter(d => d.statut === 'résolue').length;

        document.getElementById('stat-trainings').textContent = this.data.trainings.length;
        document.getElementById('stat-technical').textContent = this.data.technical.length;
        document.getElementById('stat-pilots').textContent = this.data.pilots.length;
        document.getElementById('stat-sessions').textContent = totalDemandes;
        
        // Stats avancées
        if (document.getElementById('stat-demandes-attente')) {
            document.getElementById('stat-demandes-attente').textContent = demandesEnAttente;
        }
        if (document.getElementById('stat-demandes-urgentes')) {
            document.getElementById('stat-demandes-urgentes').textContent = demandesUrgentes;
        }
        if (document.getElementById('stat-demandes-resolues')) {
            document.getElementById('stat-demandes-resolues').textContent = demandesResolues;
        }
        if (document.getElementById('stat-coaching-sessions')) {
            document.getElementById('stat-coaching-sessions').textContent = this.data.coaching.length;
        }
    },

    render() {
        this.renderTrainings();
        this.renderTechnical();
        this.renderPilots();
        this.renderAnnouncements();
        this.renderRaceWeekends();
        this.renderDemandesPilotes();
        this.renderMesDemandes();
        this.renderCoaching();
        this.renderResultatCoaching();
        this.renderActivity();
        this.updateStats();
    },

    renderTrainings() {
        const table = document.getElementById('trainings-table');
        if (this.data.trainings.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">📅</div><div class="empty-text">Aucun training</div></div></td></tr>';
            return;
        }

        table.innerHTML = this.data.trainings.map((t, i) => `
            <tr>
                <td><strong>${this.escape(t.title)}</strong></td>
                <td>${this.escape(t.circuit)}</td>
                <td>${new Date(t.date).toLocaleDateString('fr-FR')}</td>
                <td>${this.escape(t.car)}</td>
                <td>
                    <button class="btn" onclick="app.sendTrainingToDiscord(${i})" style="background: rgba(99, 102, 241, 0.15); color: var(--secondary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.deleteTraining(${i})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    renderTechnical() {
        const table = document.getElementById('technical-table');
        if (this.data.technical.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">Aucune note</div></div></td></tr>';
            return;
        }

        table.innerHTML = this.data.technical.map((t, i) => `
            <tr>
                <td><strong>${this.escape(t.title)}</strong></td>
                <td>${this.escape(t.circuit)}</td>
                <td>${this.escape(t.car)}</td>
                <td>${t.tags.map(tag => `<span class="badge primary">#${tag}</span>`).join('')}</td>
                <td>
                    <button class="btn" onclick="app.deleteTechnical(${i})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    renderPilots() {
        const table = document.getElementById('pilots-table');
        if (this.data.pilots.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">👥</div><div class="empty-text">Aucun pilote</div></div></td></tr>';
            return;
        }

        const roleIcons = { pilot: '🏎️', reserve: '🔄', coach: '🎓', manager: '📋' };
        table.innerHTML = this.data.pilots.map((p, i) => `
            <tr>
                <td><strong>${this.escape(p.name)}</strong></td>
                <td>${(p.roles || []).map(r => `<span class="badge success">${roleIcons[r]} ${r.charAt(0).toUpperCase() + r.slice(1)}</span>`).join('')}</td>
                <td>${(p.cars || []).map(c => `<div style="font-size: 0.85rem;">${this.escape(c)}</div>`).join('')}</td>
                <td><span class="badge primary">Actif</span></td>
                <td>
                    <button class="btn" onclick="app.sendPilotToDiscord(${i})" style="background: rgba(99, 102, 241, 0.15); color: var(--secondary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.deletePilot(${i})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    renderAnnouncements() {
        const table = document.getElementById('announcements-table');
        if (this.data.announcements.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">📢</div><div class="empty-text">Aucune annonce</div></div></td></tr>';
            return;
        }

        const importanceColors = { high: 'danger', medium: 'warning', low: 'primary' };
        const importanceLabels = { high: '🔴 Urgent', medium: '🟡 Normal', low: '🟢 Info' };

        table.innerHTML = this.data.announcements.map((a, i) => `
            <tr>
                <td><strong>${this.escape(a.title)}</strong></td>
                <td>${this.escape(a.message)}</td>
                <td>${new Date(a.date).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge ${importanceColors[a.importance]}">${importanceLabels[a.importance]}</span></td>
                <td>
                    <button class="btn" onclick="app.sendAnnouncementToDiscord(${i})" style="background: rgba(99, 102, 241, 0.15); color: var(--secondary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.deleteAnnouncement(${i})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    renderActivity() {
        const table = document.getElementById('activity-table');
        const recent = [...this.activity].reverse().slice(0, 10);
        
        if (recent.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--gray-400);">Aucune activité</td></tr>';
            return;
        }

        const roleEmojis = { manager: '👨‍💼', coach: '🎓', pilot: '✈️', système: '⚙️' };

        table.innerHTML = recent.map(a => `
            <tr>
                <td><strong>${a.type}</strong></td>
                <td>${this.escape(a.description)}</td>
                <td>${a.dateFormatted}</td>
                <td>${roleEmojis[a.user] || '⚙️'} ${this.escape(a.user)}</td>
                <td><span class="badge success">✓</span></td>
            </tr>
        `).join('');
    },

    renderRaceWeekends() {
        const table = document.getElementById('race-weekend-table');
        if (this.data.raceWeekends.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">🏁</div><div class="empty-text">Aucune race-weekend</div></div></td></tr>';
            return;
        }

        table.innerHTML = this.data.raceWeekends.map((r, i) => `
            <tr>
                <td><strong>${this.escape(r.title)}</strong></td>
                <td>${this.escape(r.circuit)}</td>
                <td>${new Date(r.startDate).toLocaleDateString('fr-FR')}</td>
                <td>${this.escape(r.class)}</td>
                <td>
                    <button class="btn" onclick="app.sendRaceWeekendToDiscord(${i})" style="background: rgba(99, 102, 241, 0.15); color: var(--secondary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.deleteRaceWeekend(${i})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    renderDemandesPilotes() {
        const table = document.getElementById('demandes-pilotes-table');
        if (this.data.demandesPilotes.length === 0) {
            table.innerHTML = '<tr><td colspan="8" style="text-align: center;"><div class="empty-state"><div class="empty-icon">📬</div><div class="empty-text">Aucune demande de pilote</div></div></td></tr>';
            return;
        }

        const urgenceEmojis = { faible: '🟢', normale: '🟡', haute: '🔴' };
        const urgenceLabels = { faible: 'Faible', normale: 'Normale', haute: 'Haute' };
        const statutEmojis = { attente: '⏳', 'en-cours': '🔄', 'résolue': '✅', 'rejetée': '❌' };
        const statutLabels = { attente: 'En attente', 'en-cours': 'En cours', 'résolue': 'Résolue', 'rejetée': 'Rejetée' };
        const coaches = this.getCoachesForAssign();

        table.innerHTML = this.data.demandesPilotes.map((d, i) => `
            <tr>
                <td><strong>${this.escape(d.nom)}</strong></td>
                <td>${this.escape(d.question.substring(0, 50))}...</td>
                <td>${new Date(d.dateCreation || d.date).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge primary">${urgenceEmojis[d.urgence]} ${urgenceLabels[d.urgence]}</span></td>
                <td>
                    <select onchange="app.updateDemandeStatut(${i}, this.value)" style="padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--gray-300);">
                        <option value="attente" ${d.statut === 'attente' ? 'selected' : ''}>⏳ En attente</option>
                        <option value="en-cours" ${d.statut === 'en-cours' ? 'selected' : ''}>🔄 En cours</option>
                        <option value="résolue" ${d.statut === 'résolue' ? 'selected' : ''}>✅ Résolue</option>
                        <option value="rejetée" ${d.statut === 'rejetée' ? 'selected' : ''}>❌ Rejetée</option>
                    </select>
                </td>
                <td style="max-width: 200px; font-size: 0.875rem; color: var(--gray-700); overflow: hidden; text-overflow: ellipsis;"><div style="max-height: 60px; overflow-y: auto;">${d.reponse || '⏳ Pas de réponse'}</div></td>
                <td>
                    <select onchange="app.assignDemande(${i}, this.value)" style="padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--gray-300); font-size: 0.875rem;">
                        <option value="">Non assignée</option>
                        ${coaches.map(c => `<option value="${c}" ${d.assigneA === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <button class="btn" onclick="app.openReponseModal(${i})" style="background: rgba(100, 150, 255, 0.15); color: var(--primary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.sendDemandeToDiscord(${i})" style="background: rgba(88, 101, 242, 0.15); color: #5865F2; border: none; margin-right: 0.5rem;">🔔</button>
                    <button class="btn" onclick="app.deleteDemandesPilote(${i})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    renderMesDemandes() {
        const table = document.getElementById('mes-demandes-table');
        if (!this.userNom) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">ℹ️</div><div class="empty-text">Soumet une demande d\'abord pour voir ton historique</div></div></td></tr>';
            return;
        }

        const mesDemandesFiltered = this.data.demandesPilotes.filter(d => d.nom === this.userNom);
        
        if (mesDemandesFiltered.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">📬</div><div class="empty-text">Aucune demande pour le moment</div></div></td></tr>';
            return;
        }

        const urgenceEmojis = { faible: '🟢', normale: '🟡', haute: '🔴' };
        const urgenceLabels = { faible: 'Faible', normale: 'Normale', haute: 'Haute' };
        const statutEmojis = { attente: '⏳', 'en-cours': '🔄', 'résolue': '✅', 'rejetée': '❌' };

        table.innerHTML = mesDemandesFiltered.map((d) => `
            <tr>
                <td>${this.escape(d.question.substring(0, 50))}...</td>
                <td>${new Date(d.dateCreation || d.date).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge primary">${urgenceEmojis[d.urgence]} ${urgenceLabels[d.urgence]}</span></td>
                <td><span style="padding: 0.25rem 0.75rem; background: ${d.statut === 'attente' ? 'rgba(107, 114, 128, 0.15)' : d.statut === 'en-cours' ? 'rgba(245, 158, 11, 0.15)' : d.statut === 'résolue' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)'}; border-radius: 0.375rem; color: ${d.statut === 'attente' ? 'var(--gray-700)' : d.statut === 'en-cours' ? '#f59e0b' : d.statut === 'résolue' ? '#22c55e' : '#ef4444'};">${statutEmojis[d.statut]} ${d.statut === 'en-cours' ? 'En cours' : d.statut === 'résolue' ? 'Résolue' : d.statut === 'rejetée' ? 'Rejetée' : 'En attente'}</span></td>
                <td><div style="max-width: 200px; overflow-y: auto; max-height: 100px; font-size: 0.875rem; color: var(--gray-700);">${d.reponse ? this.escape(d.reponse) : '⏳ En attente de réponse'}</div></td>
            </tr>
        `).join('');
    },

    renderCoaching() {
        const table = document.getElementById('coaching-table');
        if (this.data.coaching.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">🎓</div><div class="empty-text">Aucune session de coaching</div></div></td></tr>';
            return;
        }

        table.innerHTML = this.data.coaching.map((c, i) => `
            <tr>
                <td><strong>${this.escape(c.title)}</strong></td>
                <td>${this.escape(c.pilot)}</td>
                <td>${new Date(c.date).toLocaleDateString('fr-FR')}</td>
                <td>${c.duration}h</td>
                <td>
                    <button class="btn" onclick="app.sendCoachingToDiscord(${i})" style="background: rgba(99, 102, 241, 0.15); color: var(--secondary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.deleteCoaching(${i})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    renderResultatCoaching() {
        const table = document.getElementById('resultat-coaching-table');
        if (this.data.resultatCoaching.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="empty-state"><div class="empty-icon">📊</div><div class="empty-text">Aucun résultat de coaching</div></div></td></tr>';
            return;
        }

        table.innerHTML = this.data.resultatCoaching.map((r, i) => `
            <tr>
                <td><strong>${this.escape(r.pilot)}</strong></td>
                <td>${r.improvement}%</td>
                <td>${new Date(r.date).toLocaleDateString('fr-FR')}</td>
                <td>${this.escape(r.feedback.substring(0, 50))}...</td>
                <td>
                    <button class="btn" onclick="app.sendResultatCoachingToDiscord(${i})" style="background: rgba(99, 102, 241, 0.15); color: var(--secondary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.deleteResultatCoaching(${i})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `).join('');
    },

    addActivity(type, description, user = null) {
        this.activity.push({
            type,
            description,
            user: user || app.userRole || 'Système',
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            })
        });
        // Limiter à 100 dernières activités
        if (this.activity.length > 100) {
            this.activity.shift();
        }
    },

    addTraining(data) {
        this.data.trainings.push(data);
        this.addActivity('Training', `${data.title} ajouté`);
        this.saveData();
        // Envoyer automatiquement à Discord
        const newIndex = this.data.trainings.length - 1;
        setTimeout(() => this.sendTrainingToDiscord(newIndex), 500);
    },

    deleteTraining(i) {
        if (confirm('Supprimer?')) {
            this.data.trainings.splice(i, 1);
            this.saveData();
        }
    },

    addTechnical(data) {
        this.data.technical.push(data);
        this.addActivity('Technique', `${data.title} documenté`);
        this.saveData();
    },

    deleteTechnical(i) {
        if (confirm('Supprimer?')) {
            this.data.technical.splice(i, 1);
            this.saveData();
        }
    },

    addPilot(data) {
        this.data.pilots.push(data);
        this.addActivity('Pilote', `${data.name} ajouté`);
        this.saveData();
        // Envoyer automatiquement à Discord
        const newIndex = this.data.pilots.length - 1;
        setTimeout(() => this.sendPilotToDiscord(newIndex), 500);
    },

    deletePilot(i) {
        if (confirm('Supprimer?')) {
            this.data.pilots.splice(i, 1);
            this.saveData();
        }
    },

    addAnnouncement(data) {
        this.data.announcements.push(data);
        this.addActivity('Annonce', `${data.title} publiée`);
        this.saveData();
        // Envoyer automatiquement à Discord
        const newIndex = this.data.announcements.length - 1;
        setTimeout(() => this.sendAnnouncementToDiscord(newIndex), 500);
    },

    deleteAnnouncement(i) {
        if (confirm('Supprimer?')) {
            this.data.announcements.splice(i, 1);
            this.saveData();
        }
    },

    addRaceWeekend(data) {
        this.data.raceWeekends.push(data);
        this.addActivity('Race-Weekend', `${data.title} ajouté`);
        this.saveData();
        // Envoyer automatiquement à Discord
        const newIndex = this.data.raceWeekends.length - 1;
        setTimeout(() => this.sendRaceWeekendToDiscord(newIndex), 500);
    },

    deleteRaceWeekend(i) {
        if (confirm('Supprimer?')) {
            this.data.raceWeekends.splice(i, 1);
            this.saveData();
        }
    },

    addCoaching(data) {
        this.data.coaching.push(data);
        this.addActivity('Coaching', `Session avec ${data.pilot} ajoutée`);
        this.saveData();
        // Envoyer automatiquement à Discord
        const newIndex = this.data.coaching.length - 1;
        setTimeout(() => this.sendCoachingToDiscord(newIndex), 500);
    },

    deleteCoaching(i) {
        if (confirm('Supprimer?')) {
            this.data.coaching.splice(i, 1);
            this.saveData();
        }
    },

    addDemandesPilote(data) {
        if (!this.data.demandesPilotes) {
            this.data.demandesPilotes = [];
        }
        // Ajouter les propriétés par défaut
        const demandeComplete = {
            ...data,
            statut: 'attente',  // attente, en-cours, résolue, rejetée
            reponse: '',
            commentaires: [],
            assigneA: null,  // Assigné à quel coach?
            dateCreation: new Date().toISOString(),
            dateReponse: null
        };
        this.data.demandesPilotes.push(demandeComplete);
        this.addActivity('Demande Pilote', `Nouvelle demande de ${data.nom}`);
        this.saveData();
        console.log('Demande ajoutée:', demandeComplete);
        console.log('Total demandes:', this.data.demandesPilotes.length);
    },

    deleteDemandesPilote(i) {
        if (confirm('Supprimer cette demande?')) {
            this.data.demandesPilotes.splice(i, 1);
            this.saveData();
        }
    },

    updateDemandeStatut(i, newStatut) {
        this.data.demandesPilotes[i].statut = newStatut;
        if (newStatut !== 'attente') {
            this.data.demandesPilotes[i].dateReponse = new Date().toISOString();
        }
        this.addActivity('Demande Pilote', `Statut mis à jour: ${this.data.demandesPilotes[i].nom}`);
        this.saveData();
        this.render();
    },

    openReponseModal(i) {
        const demande = this.data.demandesPilotes[i];
        const modal = document.getElementById('reponseModal');
        document.getElementById('reponseModalTitle').textContent = `Réponse pour: ${demande.nom}`;
        document.getElementById('reponseModalContent').innerHTML = `
            <div class="form-group">
                <label>Demande de ${demande.nom}</label>
                <p style="background: var(--gray-100); padding: 1rem; border-radius: 0.375rem; color: var(--gray-700);">${this.escape(demande.question)}</p>
            </div>
            <div class="form-group">
                <label>Votre Réponse/Note</label>
                <textarea id="reponseText" placeholder="Écrivez votre réponse..." style="min-height: 150px;">${demande.reponse || ''}</textarea>
            </div>
            <div class="form-group">
                <label>💬 Commentaires</label>
                <div id="commentsContainer" style="background: var(--gray-50); padding: 1rem; border-radius: 0.375rem; max-height: 200px; overflow-y: auto; margin-bottom: 1rem;">
                    ${this.getCommentsHTML(i)}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <input type="text" id="newCommentInput" placeholder="Ajouter un commentaire..." style="flex: 1; padding: 0.5rem; border: 1px solid var(--gray-300); border-radius: 0.375rem;">
                    <button class="btn btn-secondary" onclick="app.addCommentToModal(${i})">Ajouter</button>
                </div>
            </div>
        `;
        document.getElementById('reponseModalSaveBtn').onclick = () => this.saveReponse(i);
        modal.style.display = 'flex';
    },

    addCommentToModal(demandeIndex) {
        const commentInput = document.getElementById('newCommentInput');
        const text = commentInput.value.trim();
        
        if (!text) {
            alert('❌ Veuillez écrire un commentaire!');
            return;
        }

        this.addComment(demandeIndex, text);
        commentInput.value = '';
        
        // Rafraîchir l'affichage des commentaires
        const container = document.getElementById('commentsContainer');
        container.innerHTML = this.getCommentsHTML(demandeIndex);
        alert('✅ Commentaire ajouté!');
    },

    assignDemande(demandeIndex, coachName) {
        if (coachName) {
            this.data.demandesPilotes[demandeIndex].assigneA = coachName;
            this.addActivity('Assignation', `Demande assignée à ${coachName}`);
            this.saveData();
            alert(`✅ Demande assignée à ${coachName}!`);
        }
    },

    getCoachesForAssign() {
        // Récupérer les noms uniques des coaches à partir des sessions de coaching
        const coaches = new Set();
        this.data.coaching.forEach(c => {
            if (c.coach) coaches.add(c.coach);
        });
        return Array.from(coaches);
    },

    exportDemandesAsCSV() {
        const demandes = this.data.demandesPilotes;
        if (demandes.length === 0) {
            alert('❌ Aucune demande à exporter!');
            return;
        }

        // En-têtes
        const headers = ['Pilote', 'Demande', 'Date', 'Urgence', 'Statut', 'Assignée à', 'Réponse'];
        const rows = demandes.map(d => [
            d.nom,
            d.question,
            new Date(d.dateCreation || d.date).toLocaleDateString('fr-FR'),
            d.urgence,
            d.statut,
            d.assigneA || 'Non assignée',
            d.reponse || 'En attente'
        ]);

        // Créer le CSV
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',') + '\n';
        });

        // Télécharger
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `demandes-pilotes-${new Date().toLocaleDateString('fr-FR')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('✅ Demandes exportées en CSV!');
    },

    exportDemandessAsPDF() {
        const demandes = this.data.demandesPilotes;
        if (demandes.length === 0) {
            alert('❌ Aucune demande à exporter!');
            return;
        }

        // Créer un document HTML temporaire
        let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Demandes Pilotes - GridLock</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #ff6b35; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #ff6b35; color: white; padding: 10px; text-align: left; }
        td { border: 1px solid #ddd; padding: 8px; }
        tr:nth-child(even) { background: #f9f9f9; }
        .badge { padding: 3px 8px; border-radius: 3px; font-size: 12px; }
        .high { background: #ffebee; color: #c62828; }
        .medium { background: #fff3e0; color: #e65100; }
        .low { background: #f1f8e9; color: #558b2f; }
    </style>
</head>
<body>
    <h1>📬 Rapport des Demandes Pilotes - GridLock</h1>
    <p>Généré le: ${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    <table>
        <thead>
            <tr>
                <th>Pilote</th>
                <th>Demande</th>
                <th>Date</th>
                <th>Urgence</th>
                <th>Statut</th>
                <th>Assignée à</th>
                <th>Réponse</th>
            </tr>
        </thead>
        <tbody>`;

        demandes.forEach(d => {
            const urgenceClass = d.urgence === 'haute' ? 'high' : d.urgence === 'normale' ? 'medium' : 'low';
            html += `
            <tr>
                <td><strong>${d.nom}</strong></td>
                <td>${d.question.substring(0, 100)}</td>
                <td>${new Date(d.dateCreation || d.date).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge ${urgenceClass}">${d.urgence.toUpperCase()}</span></td>
                <td>${d.statut.toUpperCase()}</td>
                <td>${d.assigneA || 'Non assignée'}</td>
                <td>${d.reponse ? d.reponse.substring(0, 50) + '...' : 'En attente'}</td>
            </tr>`;
        });

        html += `
        </tbody>
    </table>
</body>
</html>`;

        // Utiliser window.print() pour PDF
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        alert('✅ Préparez-vous à exporter en PDF via le dialogue d\'impression!');
    },

    saveReponse(i) {
        const reponseText = document.getElementById('reponseText').value;
        if (!reponseText.trim()) {
            alert('⚠️ Veuillez entrer une réponse');
            return;
        }
        
        this.data.demandesPilotes[i].reponse = reponseText;
        this.data.demandesPilotes[i].statut = 'en-cours';  // Update status when response is added
        this.data.demandesPilotes[i].dateReponse = new Date().toISOString();
        this.addActivity('Demande Pilote', `Réponse ajoutée pour: ${this.data.demandesPilotes[i].nom}`);
        this.saveData();
        
        // Force refresh the "Mes Demandes" tab if it's visible
        if (document.getElementById('mes-demandes-tab').style.display !== 'none') {
            this.renderMesDemandes();
        }
        
        document.getElementById('reponseModal').style.display = 'none';
        this.render();
        alert('✅ Réponse enregistrée!');
    },

    addComment(demandeIndex, commentText) {
        if (!commentText.trim()) return;
        
        if (!this.data.demandesPilotes[demandeIndex].commentaires) {
            this.data.demandesPilotes[demandeIndex].commentaires = [];
        }

        this.data.demandesPilotes[demandeIndex].commentaires.push({
            user: this.userRole || 'Anonyme',
            text: commentText,
            timestamp: new Date().toISOString(),
            userNom: this.userNom || this.userRole
        });

        this.addActivity('Commentaire', `Commentaire ajouté par ${this.userRole}`);
        this.saveData();
    },

    getCommentsHTML(demandeIndex) {
        const comments = this.data.demandesPilotes[demandeIndex].commentaires || [];
        if (comments.length === 0) {
            return '<p style="color: var(--gray-500); font-size: 0.875rem;">Aucun commentaire pour le moment</p>';
        }

        return comments.map(c => `
            <div style="padding: 0.75rem; background: var(--gray-50); border-radius: 0.375rem; margin-bottom: 0.5rem;">
                <div style="font-weight: 500; color: var(--primary); font-size: 0.875rem;">${this.escape(c.userNom || c.user)}</div>
                <div style="color: var(--gray-700); font-size: 0.875rem;">${this.escape(c.text)}</div>
                <div style="color: var(--gray-400); font-size: 0.75rem;">${new Date(c.timestamp).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
        `).join('');
    },

    filterDemandesPilotes() {
        const filterUrgence = document.getElementById('filterUrgence').value;
        const filterStatut = document.getElementById('filterStatut').value;
        
        const table = document.getElementById('demandes-pilotes-table');
        const urgenceEmojis = { faible: '🟢', normale: '🟡', haute: '🔴' };
        const urgenceLabels = { faible: 'Faible', normale: 'Normale', haute: 'Haute' };

        let filtered = this.data.demandesPilotes.filter(d => {
            const urgenceMatch = !filterUrgence || d.urgence === filterUrgence;
            const statutMatch = !filterStatut || d.statut === filterStatut;
            return urgenceMatch && statutMatch;
        });

        if (filtered.length === 0) {
            table.innerHTML = '<tr><td colspan="6" style="text-align: center;"><div class="empty-state"><div class="empty-icon">📬</div><div class="empty-text">Aucune demande ne correspond aux filtres</div></div></td></tr>';
            return;
        }

        table.innerHTML = filtered.map((d, idx) => {
            const actualIdx = this.data.demandesPilotes.indexOf(d);
            return `
            <tr>
                <td><strong>${this.escape(d.nom)}</strong></td>
                <td>${this.escape(d.question.substring(0, 50))}...</td>
                <td>${new Date(d.dateCreation || d.date).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge primary">${urgenceEmojis[d.urgence]} ${urgenceLabels[d.urgence]}</span></td>
                <td>
                    <select onchange="app.updateDemandeStatut(${actualIdx}, this.value)" style="padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--gray-300);">
                        <option value="attente" ${d.statut === 'attente' ? 'selected' : ''}>⏳ En attente</option>
                        <option value="en-cours" ${d.statut === 'en-cours' ? 'selected' : ''}>🔄 En cours</option>
                        <option value="résolue" ${d.statut === 'résolue' ? 'selected' : ''}>✅ Résolue</option>
                        <option value="rejetée" ${d.statut === 'rejetée' ? 'selected' : ''}>❌ Rejetée</option>
                    </select>
                </td>
                <td>
                    <button class="btn" onclick="app.openReponseModal(${actualIdx})" style="background: rgba(100, 150, 255, 0.15); color: var(--primary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.sendDemandeToDiscord(${actualIdx})" style="background: rgba(88, 101, 242, 0.15); color: #5865F2; border: none; margin-right: 0.5rem;">🔔</button>
                    <button class="btn" onclick="app.deleteDemandesPilote(${actualIdx})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `;
        }).join('');
    },

    resetFiltresDemandesPilotes() {
        document.getElementById('filterUrgence').value = '';
        document.getElementById('filterStatut').value = '';
        this.sortColumn = null;
        this.sortOrder = 'asc';
        this.renderDemandesPilotes();
    },

    sortDemandesPilotes(column) {
        if (this.sortColumn === column) {
            // Inverser l'ordre si on clique sur la même colonne
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortOrder = 'asc';
        }

        const filterUrgence = document.getElementById('filterUrgence').value;
        const filterStatut = document.getElementById('filterStatut').value;

        let toSort = this.data.demandesPilotes.filter(d => {
            const urgenceMatch = !filterUrgence || d.urgence === filterUrgence;
            const statutMatch = !filterStatut || d.statut === filterStatut;
            return urgenceMatch && statutMatch;
        });

        toSort.sort((a, b) => {
            let aVal, bVal;

            switch(column) {
                case 'date':
                    aVal = new Date(a.dateCreation || a.date);
                    bVal = new Date(b.dateCreation || b.date);
                    break;
                case 'urgence':
                    const urgencePriority = { haute: 3, normale: 2, faible: 1 };
                    aVal = urgencePriority[a.urgence] || 0;
                    bVal = urgencePriority[b.urgence] || 0;
                    break;
                case 'statut':
                    const statutPriority = { attente: 4, 'en-cours': 3, résolue: 2, rejetée: 1 };
                    aVal = statutPriority[a.statut] || 0;
                    bVal = statutPriority[b.statut] || 0;
                    break;
                default:
                    return 0;
            }

            if (this.sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        // Afficher les résultats triés
        const table = document.getElementById('demandes-pilotes-table');
        const urgenceEmojis = { faible: '🟢', normale: '🟡', haute: '🔴' };
        const urgenceLabels = { faible: 'Faible', normale: 'Normale', haute: 'Haute' };

        if (toSort.length === 0) {
            table.innerHTML = '<tr><td colspan="6" style="text-align: center;"><div class="empty-state"><div class="empty-icon">📬</div><div class="empty-text">Aucune demande ne correspond aux filtres</div></div></td></tr>';
            return;
        }

        table.innerHTML = toSort.map((d) => {
            const actualIdx = this.data.demandesPilotes.indexOf(d);
            return `
            <tr>
                <td><strong>${this.escape(d.nom)}</strong></td>
                <td>${this.escape(d.question.substring(0, 50))}...</td>
                <td>${new Date(d.dateCreation || d.date).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge primary">${urgenceEmojis[d.urgence]} ${urgenceLabels[d.urgence]}</span></td>
                <td>
                    <select onchange="app.updateDemandeStatut(${actualIdx}, this.value)" style="padding: 0.5rem; border-radius: 0.375rem; border: 1px solid var(--gray-300);">
                        <option value="attente" ${d.statut === 'attente' ? 'selected' : ''}>⏳ En attente</option>
                        <option value="en-cours" ${d.statut === 'en-cours' ? 'selected' : ''}>🔄 En cours</option>
                        <option value="résolue" ${d.statut === 'résolue' ? 'selected' : ''}>✅ Résolue</option>
                        <option value="rejetée" ${d.statut === 'rejetée' ? 'selected' : ''}>❌ Rejetée</option>
                    </select>
                </td>
                <td>
                    <button class="btn" onclick="app.openReponseModal(${actualIdx})" style="background: rgba(100, 150, 255, 0.15); color: var(--primary); border: none; margin-right: 0.5rem;">💬</button>
                    <button class="btn" onclick="app.sendDemandeToDiscord(${actualIdx})" style="background: rgba(88, 101, 242, 0.15); color: #5865F2; border: none; margin-right: 0.5rem;">🔔</button>
                    <button class="btn" onclick="app.deleteDemandesPilote(${actualIdx})" style="background: rgba(239, 68, 68, 0.15); color: var(--danger); border: none;">🗑️</button>
                </td>
            </tr>
        `;
        }).join('');
    },

    sendDemandeToDiscord(index) {
        const demande = this.data.demandesPilotes[index];
        const webhook = document.getElementById('webhook-demandes-pilotes').value;
        
        if (!webhook) {
            alert('❌ Configurez le webhook Demandes Pilotes d\'abord!');
            return;
        }

        const urgenceColors = { faible: 3066993, normale: 16776960, haute: 15158332 }; // Green, Yellow, Red
        const urgenceEmojis = { faible: '🟢', normale: '🟡', haute: '🔴' };
        const statutEmojis = { attente: '⏳', 'en-cours': '🔄', 'résolue': '✅', 'rejetée': '❌' };

        const embed = {
            title: `❓ Nouvelle Demande de ${demande.nom}`,
            description: `**Demande Pilote** - Le Mans Ultimate Esports`,
            color: urgenceColors[demande.urgence],
            fields: [
                { name: '👤 Pilote', value: `**${demande.nom}**`, inline: true },
                { name: '🆘 Urgence', value: `${urgenceEmojis[demande.urgence]} ${demande.urgence.charAt(0).toUpperCase() + demande.urgence.slice(1)}`, inline: true },
                { name: '📋 Demande', value: demande.question, inline: false },
                { name: '⏳ Statut', value: `${statutEmojis[demande.statut]} ${demande.statut === 'en-cours' ? 'En cours' : demande.statut === 'résolue' ? 'Résolue' : demande.statut === 'rejetée' ? 'Rejetée' : 'En attente'}`, inline: true },
                { name: '📅 Date', value: new Date(demande.dateCreation || demande.date).toLocaleDateString('fr-FR'), inline: true }
            ],
            footer: { 
                text: 'GridLock™ | Le Mans Ultimate Esports',
                icon_url: GRIDLOCK_LOGO
            },
            timestamp: new Date().toISOString()
        };

        // Ajouter la réponse si elle existe
        if (demande.reponse) {
            embed.fields.push({ name: '💬 Réponse Manager', value: demande.reponse, inline: false });
        }

        this.sendDiscordMessage(webhook, embed, 'Demande Pilote');
    },

    addResultatCoaching(data) {
        this.data.resultatCoaching.push(data);
        this.addActivity('Résultat Coaching', `Résultat pour ${data.pilot} ajouté`);
        this.saveData();
        // Envoyer automatiquement à Discord
        const newIndex = this.data.resultatCoaching.length - 1;
        setTimeout(() => this.sendResultatCoachingToDiscord(newIndex), 500);
    },

    deleteResultatCoaching(i) {
        if (confirm('Supprimer?')) {
            this.data.resultatCoaching.splice(i, 1);
            this.saveData();
        }
    },

    sendTrainingToDiscord(index) {
        const training = this.data.trainings[index];
        const webhook = document.getElementById('webhook-trainings').value;
        
        if (!webhook) {
            alert('❌ Configurez le webhook Trainings d\'abord!');
            return;
        }

        const date = new Date(training.date);
        const formattedDate = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

        const embed = {
            title: `🏁 ${training.title}`,
            description: `**Training Session** - Le Mans Ultimate Esports`,
            color: 16737075, // Orange (#ff6b35)
            fields: [
                { name: '🏁 Circuit', value: `**${training.circuit}**`, inline: true },
                { name: '🚗 Voiture', value: `**${training.car}**`, inline: true },
                { name: '📅 Date', value: `${formattedDate}`, inline: false },
                { name: '⏰ Heure', value: `**${formattedTime}**`, inline: true },
                { name: '🎯 Objectif', value: training.objective || '✅ Améliorer les performances générales', inline: false },
                { name: '📊 État', value: '🟢 Confirmé', inline: true }
            ],
            thumbnail: {
                url: 'https://via.placeholder.com/100?text=Training'
            },
            footer: { 
                text: 'GridLock™ | Le Mans Ultimate Esports',
                icon_url: GRIDLOCK_LOGO
            },
            timestamp: new Date().toISOString()
        };

        this.sendDiscordMessage(webhook, embed, 'Training');
    },

    sendPilotToDiscord(index) {
        const pilot = this.data.pilots[index];
        const webhook = document.getElementById('webhook-pilots').value;
        
        if (!webhook) {
            alert('❌ Configurez le webhook Pilots d\'abord!');
            return;
        }

        const roleEmojis = { pilot: '🏎️', reserve: '🔄', coach: '🎓', manager: '📋' };
        const roleNames = { pilot: 'Pilote', reserve: 'Réserve', coach: 'Coach', manager: 'Manager' };
        const roleColors = { pilot: 16737075, reserve: 3447003, coach: 10181046, manager: 15105570 };

        const roles = (pilot.roles || []).length > 0 ? pilot.roles : ['pilot'];
        const rolesDisplay = roles.map(r => `${roleEmojis[r]} **${roleNames[r]}**`).join(', ');
        const primaryColor = roleColors[roles[0]];
        const carsDisplay = (pilot.cars || []).length > 0 ? pilot.cars.map(c => `• ${c}`).join('\n') : '📍 À confirmer';

        const embed = {
            title: `👥 ${pilot.name}`,
            description: `**Nouvelle Addition à l'Équipe** - Le Mans Ultimate Esports`,
            color: primaryColor,
            fields: [
                { name: '📋 Rôles', value: rolesDisplay, inline: true },
                { name: '🚗 Voitures', value: carsDisplay, inline: false },
                { name: '✅ Statut', value: '🟢 Actif', inline: true },
                { name: '📝 Notes', value: pilot.notes || '✨ Bienvenue dans l\'équipe!', inline: false }
            ],
            thumbnail: {
                url: 'https://via.placeholder.com/100?text=' + encodeURIComponent(pilot.name.split(' ')[0])
            },
            footer: { 
                text: 'GridLock™ | Le Mans Ultimate Esports',
                icon_url: GRIDLOCK_LOGO
            },
            timestamp: new Date().toISOString()
        };

        this.sendDiscordMessage(webhook, embed, 'Pilot');
    },

    sendAnnouncementToDiscord(index) {
        const announcement = this.data.announcements[index];
        const webhook = document.getElementById('webhook-announcements').value;
        
        if (!webhook) {
            alert('❌ Configurez le webhook Annonces d\'abord!');
            return;
        }

        const importanceEmojis = { high: '🔴', medium: '🟡', low: '🟢' };
        const importanceNames = { high: 'Urgent', medium: 'Normal', low: 'Info' };
        const importanceColors = { high: 16711680, medium: 16776960, low: 65280 };

        const embed = {
            title: `${importanceEmojis[announcement.importance]} ${announcement.title}`,
            description: announcement.message,
            color: importanceColors[announcement.importance],
            fields: [
                { name: '📋 Importance', value: `**${importanceNames[announcement.importance]}**`, inline: true },
                { name: '📅 Date', value: new Date(announcement.date).toLocaleDateString('fr-FR'), inline: true },
                { name: '👥 Pour', value: announcement.target || 'Toute l\'équipe', inline: false }
            ],
            footer: { 
                text: 'GridLock™ | Le Mans Ultimate Esports',
                icon_url: GRIDLOCK_LOGO
            },
            timestamp: new Date().toISOString()
        };

        this.sendDiscordMessage(webhook, embed, 'Announcement');
    },

    sendRaceWeekendToDiscord(index) {
        const raceWeekend = this.data.raceWeekends[index];
        const webhook = document.getElementById('webhook-race-weekend').value;
        
        if (!webhook) {
            alert('❌ Configurez le webhook Race-Weekend d\'abord!');
            return;
        }

        const startDate = new Date(raceWeekend.startDate);
        const endDate = raceWeekend.endDate ? new Date(raceWeekend.endDate) : null;
        const formattedStartDate = startDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const formattedEndDate = endDate ? endDate.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
        const dateRange = endDate ? `${formattedStartDate} - ${formattedEndDate}` : formattedStartDate;

        const embed = {
            title: `🏁 ${raceWeekend.title}`,
            description: `**Race-Weekend** - Le Mans Ultimate Esports`,
            color: 16711680, // Red (#ff0000)
            fields: [
                { name: '🏁 Circuit', value: `**${raceWeekend.circuit}**`, inline: true },
                { name: '🏎️ Classe', value: `**${raceWeekend.class}**`, inline: true },
                { name: '📅 Dates', value: dateRange, inline: false },
                { name: '📝 Description', value: raceWeekend.description || '✨ Bienvenue à la race-weekend!', inline: false }
            ],
            thumbnail: {
                url: GRIDLOCK_LOGO
            },
            footer: { 
                text: 'GridLock™ | Le Mans Ultimate Esports',
                icon_url: GRIDLOCK_LOGO
            },
            timestamp: new Date().toISOString()
        };

        this.sendDiscordMessage(webhook, embed, 'Race-Weekend');
    },

    sendCoachingToDiscord(index) {
        const coaching = this.data.coaching[index];
        const webhook = document.getElementById('webhook-coaching').value;
        
        if (!webhook) {
            alert('❌ Configurez le webhook Coaching d\'abord!');
            return;
        }

        const date = new Date(coaching.date);
        const formattedDate = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const embed = {
            title: `🎓 ${coaching.title}`,
            description: `**Session de Coaching** - Le Mans Ultimate Esports`,
            color: 10181046, // Purple (#9b59b6)
            fields: [
                { name: '👤 Pilote', value: `**${coaching.pilot}**`, inline: true },
                { name: '⏱️ Durée', value: `**${coaching.duration}h**`, inline: true },
                { name: '📅 Date', value: formattedDate, inline: false },
                { name: '📝 Focus', value: coaching.focus || 'Amélioration générale', inline: false },
                { name: '💡 Notes', value: coaching.notes || 'À compléter après la session', inline: false }
            ],
            footer: { 
                text: 'GridLock™ | Le Mans Ultimate Esports',
                icon_url: GRIDLOCK_LOGO
            },
            timestamp: new Date().toISOString()
        };

        this.sendDiscordMessage(webhook, embed, 'Coaching');
    },

    sendResultatCoachingToDiscord(index) {
        const resultat = this.data.resultatCoaching[index];
        const webhook = document.getElementById('webhook-resultat-coaching').value;
        
        if (!webhook) {
            alert('❌ Configurez le webhook Résultats Coaching d\'abord!');
            return;
        }

        const date = new Date(resultat.date);
        const formattedDate = date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const improvementColor = resultat.improvement >= 10 ? 65280 : (resultat.improvement >= 5 ? 16776960 : 16711680);

        const embed = {
            title: `📊 Résultat Coaching - ${resultat.pilot}`,
            description: `**Amélioration de Performance** - Le Mans Ultimate Esports`,
            color: improvementColor,
            fields: [
                { name: '👤 Pilote', value: `**${resultat.pilot}**`, inline: true },
                { name: '📈 Amélioration', value: `**+${resultat.improvement}%**`, inline: true },
                { name: '📅 Date', value: formattedDate, inline: false },
                { name: '🏎️ Zone d\'amélioration', value: resultat.improvementArea || 'Général', inline: true },
                { name: '⭐ Feedback', value: resultat.feedback, inline: false }
            ],
            footer: { 
                text: 'GridLock™ | Le Mans Ultimate Esports',
                icon_url: GRIDLOCK_LOGO
            },
            timestamp: new Date().toISOString()
        };

        this.sendDiscordMessage(webhook, embed, 'Résultat Coaching');
    },

    sendDiscordMessage(webhook, embed, type) {
        const payload = {
            username: 'GridLock',
            avatar_url: 'https://via.placeholder.com/40?text=%E2%9A%A1',
            embeds: [embed]
        };

        // Essayer directement d'abord
        fetch(webhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok || response.status === 204) {
                alert(`✅ Message ${type} envoyé sur Discord!`);
                console.log(`📤 Message ${type} envoyé:`, payload);
            } else if (response.status === 404) {
                alert(`❌ Webhook invalide (404). Vérifiez l'URL du webhook ${type}`);
            } else if (response.status === 403) {
                // Si 403, essayer avec proxy
                tryWithProxy(webhook, payload, type);
            } else {
                alert(`❌ Erreur Discord (${response.status}). Vérifiez le webhook.`);
            }
        })
        .catch(error => {
            // Si erreur CORS, essayer avec proxy
            tryWithProxy(webhook, payload, type);
        });

        function tryWithProxy(webhook, payload, type) {
            const proxies = [
                'https://thingproxy.freeboard.io/fetch/',
                'https://api.allorigins.win/raw?url='
            ];

            let proxyIndex = 0;

            function attemptProxy() {
                if (proxyIndex >= proxies.length) {
                    alert(`❌ Impossible d'envoyer le message. Le webhook Discord ne répond pas.`);
                    return;
                }

                const proxy = proxies[proxyIndex];
                const targetUrl = proxy + encodeURIComponent(webhook);

                fetch(targetUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (response.ok || response.status === 204) {
                        alert(`✅ Message ${type} envoyé sur Discord!`);
                        console.log(`📤 Message ${type} envoyé via proxy:`, payload);
                    } else {
                        proxyIndex++;
                        attemptProxy();
                    }
                })
                .catch(() => {
                    proxyIndex++;
                    attemptProxy();
                });
            }

            attemptProxy();
        }
    },

    updateDiscordLists() {
        // Trainings Discord List
        const trainingList = document.getElementById('trainings-discord-list');
        if (this.data.trainings.length === 0) {
            trainingList.innerHTML = '<div style="text-align: center; color: var(--gray-400);">Aucun training</div>';
        } else {
            trainingList.innerHTML = this.data.trainings.map((t, i) => `
                <button class="btn btn-secondary" onclick="app.sendTrainingToDiscord(${i})" style="justify-content: space-between; text-align: left;">
                    <span>${this.escape(t.title)}</span>
                    <span>→</span>
                </button>
            `).join('');
        }

        // Pilots Discord List
        const pilotList = document.getElementById('pilots-discord-list');
        if (this.data.pilots.length === 0) {
            pilotList.innerHTML = '<div style="text-align: center; color: var(--gray-400);">Aucun pilote</div>';
        } else {
            pilotList.innerHTML = this.data.pilots.map((p, i) => `
                <button class="btn btn-secondary" onclick="app.sendPilotToDiscord(${i})" style="justify-content: space-between; text-align: left;">
                    <span>${this.escape(p.name)}</span>
                    <span>→</span>
                </button>
            `).join('');
        }
    },

    escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

// ==================== UI FUNCTIONS ====================
function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.getElementById(tab + '-tab').style.display = 'block';
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        trainings: 'Trainings',
        technical: 'Notes Techniques',
        pilots: 'Équipe',
        'race-weekend': 'Race-Weekend',
        'demande-pilote': 'Demande Pilote',
        'demandes-pilotes': 'Demandes Pilotes',
        coaching: 'Coaching',
        'resultat-coaching': 'Résultats Coaching',
        discord: 'Discord Integration'
    };
    document.getElementById('pageTitle').textContent = titles[tab];

    if (tab === 'discord') {
        app.updateDiscordLists();
        loadWebhooks();
    }
}

function showAddModal(type = 'training') {
    app.type = type;
    const titles = {
        training: 'Ajouter Training',
        technical: 'Ajouter Note Technique',
        pilot: 'Ajouter Pilote',
        announcement: 'Ajouter Annonce',
        'race-weekend': 'Ajouter Race-Weekend',
        coaching: 'Ajouter Session Coaching',
        'resultat-coaching': 'Ajouter Résultat Coaching'
    };
    document.getElementById('modalTitle').textContent = titles[type];

    let fields = '';
    if (type === 'training') {
        fields = `
            <div class="form-group">
                <label>Titre</label>
                <input type="text" id="f-title" placeholder="Training Le Mans" required>
            </div>
            <div class="form-group">
                <label>Circuit</label>
                <input type="text" id="f-circuit" placeholder="Le Mans" required>
            </div>
            <div class="form-group">
                <label>Voiture</label>
                <input type="text" id="f-car" placeholder="Ferrari 296 GT3" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="datetime-local" id="f-date" required>
            </div>
            <div class="form-group">
                <label>Objectif</label>
                <textarea id="f-objective" placeholder="..."></textarea>
            </div>
        `;
    } else if (type === 'technical') {
        fields = `
            <div class="form-group">
                <label>Titre</label>
                <input type="text" id="f-title" placeholder="Setup optimal" required>
            </div>
            <div class="form-group">
                <label>Circuit</label>
                <input type="text" id="f-circuit" placeholder="Le Mans" required>
            </div>
            <div class="form-group">
                <label>Voiture</label>
                <input type="text" id="f-car" placeholder="Ferrari 296 GT3" required>
            </div>
            <div class="form-group">
                <label>Contenu</label>
                <textarea id="f-content" placeholder="..." required></textarea>
            </div>
            <div class="form-group">
                <label>Tags</label>
                <input type="text" id="f-tags" placeholder="setup, tyres, fuel">
            </div>
        `;
    } else if (type === 'pilot') {
        fields = `
            <div class="form-group">
                <label>Nom</label>
                <input type="text" id="f-name" placeholder="Juan Manuel Córdoba" required>
            </div>
            <div class="form-group">
                <label>Rôles (plusieurs possibles)</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="f-role-pilot" value="pilot">
                        <span>🏎️ Pilote</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="f-role-reserve" value="reserve">
                        <span>🔄 Réserve</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="f-role-coach" value="coach">
                        <span>🎓 Coach</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input type="checkbox" id="f-role-manager" value="manager">
                        <span>📋 Manager</span>
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label>Voitures (plusieurs possibles)</label>
                <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--gray-200); border-radius: 0.5rem; padding: 1rem;">
                    ${Object.entries(CARS).map(([category, cars]) => `
                        <div style="margin-bottom: 1rem;">
                            <div style="font-weight: 600; color: var(--secondary); margin-bottom: 0.5rem; text-transform: uppercase;">${category}</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-left: 0.5rem;">
                                ${cars.map((car, idx) => `
                                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem;">
                                        <input type="checkbox" id="f-car-${category}-${idx}" value="${car}">
                                        <span>${car}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="f-notes" placeholder="..."></textarea>
            </div>
        `;
    } else if (type === 'announcement') {
        fields = `
            <div class="form-group">
                <label>Titre</label>
                <input type="text" id="f-title" placeholder="Maintenance prévue" required>
            </div>
            <div class="form-group">
                <label>Message</label>
                <textarea id="f-message" placeholder="Détails de l'annonce..." required></textarea>
            </div>
            <div class="form-group">
                <label>Importance</label>
                <select id="f-importance" required>
                    <option value="low">🟢 Info (Faible)</option>
                    <option value="medium">🟡 Normal (Moyen)</option>
                    <option value="high">🔴 Urgent (Élevée)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Pour (optionnel)</label>
                <input type="text" id="f-target" placeholder="Pilotes, Tous, etc...">
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="f-date" required>
            </div>
        `;
    } else if (type === 'race-weekend') {
        fields = `
            <div class="form-group">
                <label>Titre</label>
                <input type="text" id="f-title" placeholder="24h du Mans" required>
            </div>
            <div class="form-group">
                <label>Circuit</label>
                <input type="text" id="f-circuit" placeholder="Le Mans" required>
            </div>
            <div class="form-group">
                <label>Classe</label>
                <input type="text" id="f-class" placeholder="Hypercar" required>
            </div>
            <div class="form-group">
                <label>Date de début</label>
                <input type="date" id="f-startDate" required>
            </div>
            <div class="form-group">
                <label>Date de fin (optionnel)</label>
                <input type="date" id="f-endDate">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="f-description" placeholder="Détails de la race-weekend..."></textarea>
            </div>
        `;
    } else if (type === 'coaching') {
        fields = `
            <div class="form-group">
                <label>Titre</label>
                <input type="text" id="f-title" placeholder="Coaching Tour de Qualif" required>
            </div>
            <div class="form-group">
                <label>Pilote</label>
                <input type="text" id="f-pilot" placeholder="Nom du pilote" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="f-date" required>
            </div>
            <div class="form-group">
                <label>Durée (heures)</label>
                <input type="number" id="f-duration" placeholder="1.5" step="0.5" required>
            </div>
            <div class="form-group">
                <label>Focus de la session</label>
                <input type="text" id="f-focus" placeholder="Ex: Freinage tardif en virage 3" required>
            </div>
            <div class="form-group">
                <label>Notes</label>
                <textarea id="f-notes" placeholder="Observations et recommandations..."></textarea>
            </div>
        `;
    } else if (type === 'resultat-coaching') {
        fields = `
            <div class="form-group">
                <label>Pilote</label>
                <input type="text" id="f-pilot" placeholder="Nom du pilote" required>
            </div>
            <div class="form-group">
                <label>Amélioration (%)</label>
                <input type="number" id="f-improvement" placeholder="10" required>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="f-date" required>
            </div>
            <div class="form-group">
                <label>Zone d'amélioration</label>
                <input type="text" id="f-improvementArea" placeholder="Ex: Apex consistency" required>
            </div>
            <div class="form-group">
                <label>Feedback détaillé</label>
                <textarea id="f-feedback" placeholder="Résumé des progrès et recommandations..." required></textarea>
            </div>
        `;
    }

    document.getElementById('formFields').innerHTML = fields;
    document.getElementById('addModal').classList.add('show');
}

function closeModal() {
    document.getElementById('addModal').classList.remove('show');
}

function submitForm() {
    if (app.type === 'training') {
        app.addTraining({
            title: document.getElementById('f-title').value,
            circuit: document.getElementById('f-circuit').value,
            car: document.getElementById('f-car').value,
            date: document.getElementById('f-date').value,
            objective: document.getElementById('f-objective').value
        });
    } else if (app.type === 'technical') {
        app.addTechnical({
            title: document.getElementById('f-title').value,
            circuit: document.getElementById('f-circuit').value,
            car: document.getElementById('f-car').value,
            content: document.getElementById('f-content').value,
            tags: document.getElementById('f-tags').value.split(',').map(t => t.trim()).filter(t => t)
        });
    } else if (app.type === 'pilot') {
        const roles = [];
        if (document.getElementById('f-role-pilot').checked) roles.push('pilot');
        if (document.getElementById('f-role-reserve').checked) roles.push('reserve');
        if (document.getElementById('f-role-coach').checked) roles.push('coach');
        if (document.getElementById('f-role-manager').checked) roles.push('manager');
        
        if (roles.length === 0) {
            alert('⚠️ Sélectionnez au moins un rôle!');
            return;
        }

        // Récupérer les voitures sélectionnées
        const cars = [];
        Object.entries(CARS).forEach(([category, carList]) => {
            carList.forEach((car, idx) => {
                const checkbox = document.getElementById(`f-car-${category}-${idx}`);
                if (checkbox && checkbox.checked) {
                    cars.push(car);
                }
            });
        });

        app.addPilot({
            name: document.getElementById('f-name').value,
            roles: roles,
            cars: cars,
            notes: document.getElementById('f-notes').value
        });
    } else if (app.type === 'announcement') {
        app.addAnnouncement({
            title: document.getElementById('f-title').value,
            message: document.getElementById('f-message').value,
            importance: document.getElementById('f-importance').value,
            target: document.getElementById('f-target').value,
            date: document.getElementById('f-date').value
        });
    } else if (app.type === 'race-weekend') {
        app.addRaceWeekend({
            title: document.getElementById('f-title').value,
            circuit: document.getElementById('f-circuit').value,
            class: document.getElementById('f-class').value,
            startDate: document.getElementById('f-startDate').value,
            endDate: document.getElementById('f-endDate').value || null,
            description: document.getElementById('f-description').value
        });
    } else if (app.type === 'coaching') {
        app.addCoaching({
            title: document.getElementById('f-title').value,
            pilot: document.getElementById('f-pilot').value,
            date: document.getElementById('f-date').value,
            duration: parseFloat(document.getElementById('f-duration').value),
            focus: document.getElementById('f-focus').value,
            notes: document.getElementById('f-notes').value
        });
    } else if (app.type === 'resultat-coaching') {
        app.addResultatCoaching({
            pilot: document.getElementById('f-pilot').value,
            improvement: parseFloat(document.getElementById('f-improvement').value),
            date: document.getElementById('f-date').value,
            improvementArea: document.getElementById('f-improvementArea').value,
            feedback: document.getElementById('f-feedback').value
        });
    }
    closeModal();
}

function handleSubmit(e) {
    e.preventDefault();
    submitForm();
}

function savePasswords() {
    if (app.userRole !== 'manager') {
        alert('❌ Seul un manager peut changer les mots de passe!');
        return;
    }
    
    const newManagerPassword = document.getElementById('password-manager').value;
    const newCoachPassword = document.getElementById('password-coach').value;
    
    if (!newManagerPassword || !newCoachPassword) {
        alert('⚠️ Les deux champs sont requis!');
        return;
    }
    
    if (newManagerPassword.length < 6 || newCoachPassword.length < 6) {
        alert('⚠️ Les mots de passe doivent faire au moins 6 caractères!');
        return;
    }
    
    app.passwords.manager = newManagerPassword;
    app.passwords.coach = newCoachPassword;
    
    localStorage.setItem('gridlock-passwords', JSON.stringify(app.passwords));
    alert('✅ Mots de passe mis à jour avec succès!');
    
    // Réinitialiser les champs
    document.getElementById('password-manager').value = '';
    document.getElementById('password-coach').value = '';
}

function loadPasswords() {
    if (app.userRole === 'manager') {
        // Afficher les mots de passe actuels (optionnel, pour vérification)
        document.getElementById('password-manager').placeholder = app.passwords.manager;
        document.getElementById('password-coach').placeholder = app.passwords.coach;
    }
}

function saveWebhooks() {
    const trainings = document.getElementById('webhook-trainings').value;
    const pilots = document.getElementById('webhook-pilots').value;
    const announcements = document.getElementById('webhook-announcements').value;
    const raceWeekend = document.getElementById('webhook-race-weekend').value;
    const coaching = document.getElementById('webhook-coaching').value;
    const resultatCoaching = document.getElementById('webhook-resultat-coaching').value;
    const demandesPilotes = document.getElementById('webhook-demandes-pilotes').value;
    
    localStorage.setItem('gridlock-webhooks', JSON.stringify({ trainings, pilots, announcements, raceWeekend, coaching, resultatCoaching, demandesPilotes }));
    alert('✅ Webhooks sauvegardés!');
}

function loadWebhooks() {
    const saved = localStorage.getItem('gridlock-webhooks');
    if (saved) {
        const { trainings, pilots, announcements, raceWeekend, coaching, resultatCoaching, demandesPilotes } = JSON.parse(saved);
        document.getElementById('webhook-trainings').value = trainings || '';
        document.getElementById('webhook-pilots').value = pilots || '';
        document.getElementById('webhook-announcements').value = announcements || '';
        document.getElementById('webhook-race-weekend').value = raceWeekend || '';
        document.getElementById('webhook-coaching').value = coaching || '';
        document.getElementById('webhook-resultat-coaching').value = resultatCoaching || '';
        document.getElementById('webhook-demandes-pilotes').value = demandesPilotes || '';
    }
}

// ==================== LOGIN FUNCTIONS ====================
function logout() {
    app.userRole = null;
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('loginPassword').focus();
    console.log('Déconnexion effectuée');
}

function guestAccess() {
    // Ouvrir le modal pour les invités
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('guestModal').style.display = 'flex';
    
    // Réinitialiser le formulaire
    document.getElementById('guestRequestForm').reset();
}

function closeGuestModal() {
    // Fermer le modal invité et revenir au login
    document.getElementById('guestModal').style.display = 'none';
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('guestRequestForm').reset();
}

function submitGuestRequest() {
    const name = document.getElementById('guestName').value.trim();
    const discord = document.getElementById('guestDiscord').value.trim();
    const onDiscord = document.querySelector('input[name="guestOnDiscord"]:checked')?.value;
    const role = document.getElementById('guestRole').value;
    
    // Récupérer les voitures cochées
    const carCheckboxes = document.querySelectorAll('.guestCar:checked');
    const cars = Array.from(carCheckboxes).map(cb => cb.value);
    
    const message = document.getElementById('guestMessage').value.trim();

    console.log('📋 Tentative d\'envoi de demande invité:', {name, discord, onDiscord, role, cars, message});

    // Validation
    if (!name || !discord || !onDiscord || !role || !message) {
        alert('❌ Veuillez remplir tous les champs obligatoires (*)');
        console.error('Validation échouée - champs manquants:', {name, discord, onDiscord, role, message});
        return;
    }

    if (cars.length === 0) {
        alert('❌ Veuillez sélectionner au moins une classe de voiture');
        return;
    }

    // Récupérer le webhook depuis la config
    const webhookUrl = document.getElementById('webhook-demandes-invites')?.value;
    
    if (!webhookUrl) {
        alert('❌ Le webhook des demandes d\'invités n\'est pas configuré. Contactez l\'administrateur.');
        console.error('Webhook webhook-demandes-invites non configuré');
        return;
    }

    // Créer le message pour Discord
    const embed = {
        color: 0xFF6B35,
        title: `🚀 Nouvelle Demande d'Adhésion - ${name}`,
        fields: [
            {
                name: '👤 Pseudo Discord',
                value: discord,
                inline: true
            },
            {
                name: '✅ Sur Discord?',
                value: onDiscord === 'oui' ? '✅ Oui' : '❌ Non',
                inline: true
            },
            {
                name: '🎯 Rôle Souhaité',
                value: role === 'pilot' ? '🏎️ Pilote' : role === 'coach' ? '🎓 Coach' : '🔄 Pilote Réserve',
                inline: true
            },
            {
                name: '🏁 Classes de Voiture',
                value: cars.map(c => {
                    const labels = {
                        'hypercar': '🚗 Hypercar',
                        'lmp2': '⚡ LMP2',
                        'gte': '🏆 GTE',
                        'lmp3': '💨 LMP3',
                        'lmgt3': '🎯 LMGT3'
                    };
                    return labels[c] || c;
                }).join(', '),
                inline: false
            },
            {
                name: '💬 Message de Présentation',
                value: message.substring(0, 1024),
                inline: false
            },
            {
                name: '📅 Date',
                value: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR'),
                inline: true
            }
        ],
        footer: {
            text: 'GridLock - Demande d\'adhésion invité'
        }
    };

    console.log('📦 Message Discord créé:', embed);

    // Envoyer via webhook Discord
    app.sendDiscordMessage(webhookUrl, embed, 'Demande Invité');
    
    // Fermer le modal
    document.getElementById('guestModal').style.display = 'none';
    
    // Réinitialiser le formulaire et revenir au login
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('guestRequestForm').reset();
    
    alert('✅ Votre demande d\'adhésion a été envoyée avec succès!\n\nNous vous contacterons bientôt sur Discord: ' + discord);
}

function submitLogin() {
    const password = document.getElementById('loginPassword').value;
    
    if (app.authenticate(password)) {
        // Recharger les données depuis localStorage pour s'assurer qu'on a les plus récentes
        app.loadData();
        
        document.getElementById('loginModal').style.display = 'none';
        
        // Contrôler l'accès aux onglets selon le rôle
        const navItems = document.querySelectorAll('.nav-item');
        
        if (app.userRole === 'coach') {
            // Coach: accès UNIQUEMENT à Coaching et Résultats Coaching
            navItems.forEach(item => {
                const tabName = item.getAttribute('data-tab');
                // Afficher uniquement Coaching et Résultats Coaching
                if (tabName === 'coaching' || tabName === 'resultat-coaching') {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
            // Rediriger vers l'onglet Coaching
            setTimeout(() => switchTab('coaching'), 100);
        } else if (app.userRole === 'pilot') {
            // Pilot: accès UNIQUEMENT à Demande Pilote et Mes Demandes
            navItems.forEach(item => {
                const tabName = item.getAttribute('data-tab');
                // Afficher uniquement Demande Pilote et Mes Demandes
                if (tabName === 'demande-pilote' || tabName === 'mes-demandes') {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
            // Rediriger vers l'onglet Demande Pilote
            setTimeout(() => switchTab('demande-pilote'), 100);
        } else if (app.userRole === 'manager') {
            // Manager: accès à TOUS les onglets
            navItems.forEach(item => {
                item.style.display = 'flex';
            });
        }
        
        app.render();
        const roleLabels = { manager: 'Manager', coach: 'Coach', pilot: 'Pilote' };
        const displayRole = roleLabels[app.userRole];
        
        // Mettre à jour l'affichage du rôle
        document.getElementById('userDisplayRole').textContent = displayRole;
        
        alert(`✅ Connecté en tant que ${displayRole}!`);
    } else {
        alert('❌ Mot de passe incorrect!');
        document.getElementById('loginPassword').value = '';
    }
}

function handleLogin(e) {
    e.preventDefault();
    submitLogin();
}

function handleGlobalSearch(query) {
    if (!query.trim()) {
        // Réinitialiser si la recherche est vide
        app.render();
        return;
    }

    const q = query.toLowerCase();
    const results = {
        trainings: [],
        technical: [],
        pilots: [],
        announcements: [],
        demandesPilotes: [],
        coaching: [],
        resultatCoaching: []
    };

    // Chercher dans trainings
    app.data.trainings.forEach((t, i) => {
        if (t.date.toLowerCase().includes(q) || t.type.toLowerCase().includes(q)) {
            results.trainings.push(i);
        }
    });

    // Chercher dans technical
    app.data.technical.forEach((t, i) => {
        if (t.notes.toLowerCase().includes(q) || t.topic.toLowerCase().includes(q)) {
            results.technical.push(i);
        }
    });

    // Chercher dans pilots
    app.data.pilots.forEach((p, i) => {
        if (p.name.toLowerCase().includes(q) || p.car.toLowerCase().includes(q)) {
            results.pilots.push(i);
        }
    });

    // Chercher dans announcements
    app.data.announcements.forEach((a, i) => {
        if (a.title.toLowerCase().includes(q) || a.text.toLowerCase().includes(q)) {
            results.announcements.push(i);
        }
    });

    // Chercher dans demandesPilotes
    app.data.demandesPilotes.forEach((d, i) => {
        if (d.nom.toLowerCase().includes(q) || d.question.toLowerCase().includes(q)) {
            results.demandesPilotes.push(i);
        }
    });

    // Chercher dans coaching
    app.data.coaching.forEach((c, i) => {
        if (c.title.toLowerCase().includes(q) || c.pilot.toLowerCase().includes(q)) {
            results.coaching.push(i);
        }
    });

    // Chercher dans resultatCoaching
    app.data.resultatCoaching.forEach((r, i) => {
        if (r.pilot.toLowerCase().includes(q) || r.notes.toLowerCase().includes(q)) {
            results.resultatCoaching.push(i);
        }
    });

    // Afficher les résultats
    displaySearchResults(results, q);
}

function displaySearchResults(results, query) {
    let html = '<div style="padding: 2rem;"><h2 style="margin-bottom: 2rem;">🔍 Résultats de recherche pour: "<strong>' + query + '</strong>"</h2>';
    let hasResults = false;

    if (results.demandesPilotes.length > 0) {
        hasResults = true;
        html += '<h3 style="margin-top: 2rem; margin-bottom: 1rem;">📬 Demandes Pilotes</h3>';
        html += '<div style="display: grid; gap: 1rem;">';
        results.demandesPilotes.forEach(i => {
            const d = app.data.demandesPilotes[i];
            html += `<div style="padding: 1rem; border: 1px solid var(--gray-300); border-radius: 0.375rem; cursor: pointer; background: var(--gray-50); hover: background: var(--gray-100);" onclick="switchTab('demandes-pilotes')">
                <strong>${app.escape(d.nom)}</strong> - ${app.escape(d.question.substring(0, 100))}...
            </div>`;
        });
        html += '</div>';
    }

    if (results.announcements.length > 0) {
        hasResults = true;
        html += '<h3 style="margin-top: 2rem; margin-bottom: 1rem;">📢 Annonces</h3>';
        html += '<div style="display: grid; gap: 1rem;">';
        results.announcements.forEach(i => {
            const a = app.data.announcements[i];
            html += `<div style="padding: 1rem; border: 1px solid var(--gray-300); border-radius: 0.375rem; cursor: pointer; background: var(--gray-50); hover: background: var(--gray-100);" onclick="switchTab('announcements')">
                <strong>${app.escape(a.title)}</strong>
            </div>`;
        });
        html += '</div>';
    }

    if (results.coaching.length > 0) {
        hasResults = true;
        html += '<h3 style="margin-top: 2rem; margin-bottom: 1rem;">🎓 Coaching</h3>';
        html += '<div style="display: grid; gap: 1rem;">';
        results.coaching.forEach(i => {
            const c = app.data.coaching[i];
            html += `<div style="padding: 1rem; border: 1px solid var(--gray-300); border-radius: 0.375rem; cursor: pointer; background: var(--gray-50); hover: background: var(--gray-100);" onclick="switchTab('coaching')">
                <strong>${app.escape(c.title)}</strong> - ${app.escape(c.pilot)}
            </div>`;
        });
        html += '</div>';
    }

    if (!hasResults) {
        html += '<div style="padding: 2rem; text-align: center; color: var(--gray-500);">Aucun résultat trouvé</div>';
    }

    html += '</div>';
    
    // Afficher dans une zone de résultats temporaire
    const mainContent = document.querySelector('.content');
    if (mainContent) {
        mainContent.innerHTML = html;
    }
}

function clearSearch() {
    document.getElementById('globalSearch').value = '';
    app.render();
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('open');
}

function handleDemandeSubmit(e) {
    e.preventDefault();
    console.log('Form submitted');
    
    const nom = document.getElementById('demande-nom').value;
    const question = document.getElementById('demande-question').value;
    const urgence = document.getElementById('demande-urgence').value;
    
    if (!nom || !question) {
        alert('❌ Veuillez remplir tous les champs!');
        return;
    }
    
    console.log('Données:', { nom, question, urgence });
    
    const newDemande = {
        nom,
        question,
        urgence,
        date: new Date().toISOString()
    };
    
    app.addDemandesPilote(newDemande);
    
    // Stocker le nom du pilote dans localStorage
    app.userNom = nom;
    localStorage.setItem('gridlock-userNom', nom);
    
    // Réinitialiser le formulaire
    document.getElementById('demandeForm').reset();
    
    // Envoyer automatiquement vers Discord après un court délai
    setTimeout(() => {
        const lastIndex = app.data.demandesPilotes.length - 1;
        app.sendDemandeToDiscord(lastIndex);
    }, 300);
    
    // Rediriger vers le dashboard après l'envoi
    alert('✅ Votre demande a été envoyée avec succès!');
    setTimeout(() => switchTab('mes-demandes'), 500);
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!window.app) {
        console.error('App object not found');
        return;
    }
    app.init();
    console.log('✅ GridLock app initialized');
});
