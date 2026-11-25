const games = [
  { id:'mime', icon:'🎭', name:'Mime express', group:'Ambiance', seconds:60, gear:'Des papiers et un bol', rules:'Préparez des mots ou expressions sur des papiers. À tour de rôle, un membre de chaque équipe les fait deviner en mimant, sans parler. Un point par mot trouvé dans le temps imparti.' },
  { id:'tour', icon:'🏗️', name:'La tour impossible', group:'Adresse', seconds:90, gear:'Le même nombre de gobelets par équipe', rules:'Construisez la tour de gobelets la plus haute possible. À la fin du chrono, comptez les étages de chaque tour qui tient debout. Un point par étage.' },
  { id:'panier', icon:'🎯', name:'Panier papier', group:'Adresse', seconds:45, gear:'Du papier et une corbeille', rules:'Tracez une ligne à deux mètres de la corbeille. Chaque équipe dispose du même nombre de boules de papier et joue à tour de rôle. Un point par panier marqué.' },
  { id:'lettre', icon:'🔤', name:'La lettre interdite', group:'Réflexion', seconds:60, gear:'Papier et stylo par équipe', rules:'Annoncez une catégorie, par exemple les animaux, et une lettre interdite, par exemple E. Chaque équipe écrit le plus de réponses possibles sans cette lettre. Un point par réponse valide et unique dans sa liste.' },
  { id:'memoire', icon:'🧠', name:'Mémoire flash', group:'Réflexion', seconds:45, gear:'Dix petits objets et un torchon', rules:'Montrez les dix objets à tout le monde pendant 20 secondes, puis recouvrez-les. Lancez le chrono pour que les équipes écrivent les objets dont elles se souviennent. Un point par objet correctement nommé.' },
  { id:'dessin', icon:'✏️', name:'Dessine à l’aveugle', group:'Ambiance', seconds:60, gear:'Papier, stylos et mots à dessiner', rules:'Le dessinateur ferme les yeux et dessine un mot choisi par la personne qui anime. Son équipe essaie de deviner. Changez de mot après chaque bonne réponse. Un point par mot trouvé.' },
  { id:'mots', icon:'💬', name:'Trois mots chrono', group:'Ambiance', seconds:60, gear:'Des papiers et un bol', rules:'Tirez un mot et donnez jusqu’à trois mots-indices, sans utiliser de mot de la même famille. L’équipe propose une réponse par tirage. Un point par bonne réponse.' },
  { id:'trio', icon:'🎵', name:'Fredonne-moi ça', group:'Ambiance', seconds:60, gear:'Une liste de chansons connues du groupe', rules:'À tour de rôle, un membre fredonne une chanson sans prononcer les paroles. Son équipe doit retrouver le titre. Un point par titre trouvé.' },
];

const manualPresets = ['Beer pong', 'Bras de fer'];

const storageKey = 'derniere-manche-v1';
const fresh = () => ({teams:[], rounds:[], custom:[], active:null, finished:false});
let state = fresh();
try { state = JSON.parse(localStorage.getItem(storageKey)) || fresh(); } catch {}
let storageIssue = false;
function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); storageIssue = false; }
  catch { storageIssue = true; }
}
const app = document.querySelector('#app');
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const id = () => crypto.randomUUID();
const teams = () => state.teams.map(team => ({...team, total:state.rounds.reduce((total, round) => total + (round.points[team.id] || 0), 0)})).sort((a,b) => b.total - a.total);
const allGames = () => [...games, ...state.custom];
const currentGame = () => {
  const round = state.rounds.find(item => item.id === state.active?.edit);
  if (round?.manual) return { name: round.name, icon: '', rules: '' };
  return allGames().find(game => game.id === state.active?.game);
};
const available = () => !state.active && !state.finished && state.teams.length >= 2;
const link = (hash, label, secondary = '') => `<a class="button ${secondary}" href="#${hash}">${label}</a>`;
function standings() {
  if (!state.teams.length) return '<p class="muted">Ajoute tes équipes pour les voir ici.</p>';
  let rank = 1;
  return teams().map((team, index, sorted) => {
    if (index && team.total !== sorted[index - 1].total) rank = index + 1;
    return `<div class="scoreline"><span><b class="place">${rank}</b> ${esc(team.name)}</span><strong>${team.total} pts</strong></div>`;
  }).join('');
}
function home() {
  const locked = state.active || state.rounds.length || state.finished;
  const game = currentGame();
  const primary = game ? link('manche','Reprendre la manche')
    : state.finished ? link('classement','Voir le podium')
    : available() ? link('jeux','Choisir un défi')
    : '<button data-action="focus-team">Créer une équipe</button>';
  const title = state.finished ? 'Place au podium' : 'À vous de jouer';
  return `<section class="home-hero">
    <div class="intro">
      <span class="eyebrow">OLYMPIADES DE SOIRÉE</span>
      <h1>${title}<span>&#8239;!</span></h1>
      <div class="actions">${primary}${available() ? link('manuel','Saisir un résultat','secondary') : ''}</div>
    </div>
    <div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="disc"></div><div class="spark"></div></div>
  </section>
  <div class="session-bar"><span><strong>${state.teams.length}</strong> ${state.teams.length === 1 ? 'équipe' : 'équipes'}</span><span><strong>${state.rounds.length}</strong> ${state.rounds.length === 1 ? 'manche jouée' : 'manches jouées'}</span>${link('classement','Classement','text-link')}</div>
  <div class="grid home-grid"><section class="panel stack"><div><h2>Les équipes</h2><p class="muted">${locked ? 'La composition est fixée une fois les épreuves lancées.' : 'De 2 à 8 équipes, sur le téléphone qui anime.'}</p></div>
  ${state.teams.map(team => `<div class="team"><span>${esc(team.name)}</span>${locked ? '' : `<button class="ghost" data-remove="${team.id}" aria-label="Retirer ${esc(team.name)}">Retirer</button>`}</div>`).join('')}
  ${!locked && state.teams.length < 8 ? document.querySelector('#teamForm').innerHTML : ''}</section>
  <section class="panel"><h2>Scores en direct</h2>${standings()}</section></div>`;
}
function library() {
  return `<section class="hero"><h1>Défis<span>.</span></h1><p>Choisis une épreuve, crée tes règles ou saisis le résultat d’un jeu joué sur place.</p></section>
  ${state.teams.length < 2 ? `<section class="panel stack"><p>Ajoute au moins deux équipes pour lancer un défi.</p><div>${link('soiree','Configurer les équipes')}</div></section>` : ''}
  ${state.active ? `<section class="panel">${link('manche','Reprendre la manche en cours')}</section>` : ''}
  ${state.finished ? '<section class="panel">La soirée est terminée.</section>' : ''}
  ${available() ? `<section class="panel manual-banner"><div><h2>Épreuve libre</h2><p class="muted">Beer pong, bras de fer ou un jeu de ton choix.</p></div>${link('manuel','Saisir un résultat')}</section>` : ''}
  ${state.finished ? '' : `<details class="panel"><summary>Créer un défi personnalisé</summary><form id="custom" class="stack">
  <div><label for="game-name">Nom du défi</label><input id="game-name" name="name" maxlength="50" required></div>
  <div><label for="rules">Règles et barème</label><textarea id="rules" name="rules" maxlength="500" required></textarea></div>
  <div><label for="seconds">Durée en secondes</label><input id="seconds" name="seconds" type="number" min="5" max="3600" value="60" required></div>
  <div><button>Ajouter le défi</button></div></form></details>`}
  <div class="grid" style="margin-top:14px">${allGames().map(game => `<article class="game"><div class="game-meta"><span class="game-icon" aria-hidden="true">${game.icon}</span><span class="tag">${game.group} · ${game.seconds} s</span></div><h3>${esc(game.name)}</h3><p>${esc(game.rules)}</p><p class="muted">${esc(game.gear)}</p><button data-play="${game.id}" ${available() ? '' : 'disabled'}>Lancer le défi</button></article>`).join('')}</div>`;
}
function ranking() {
  const leaders = teams().filter((team, _, sorted) => team.total === sorted[0]?.total);
  const result = leaders.map(t => esc(t.name)).join(' et ');
  return `<section class="hero"><span class="eyebrow">${state.finished ? 'Résultat final' : 'Scores des équipes'}</span><h1>${state.finished ? 'Podium' : 'Classement'}<span>.</span></h1><p>${state.finished ? (leaders.length > 1 ? 'Victoire ex æquo pour ' : 'Victoire pour ') + result + ' !' : 'Les points de chaque manche s’additionnent.'}</p></section>
  <section class="panel podium"><h2>Classement</h2>${standings()}</section>
  <section class="panel stack"><h2>Historique des manches</h2>
  ${[...state.rounds].reverse().map(round => `<details><summary>${esc(round.name)}</summary>${state.teams.map(t => `<div class="scoreline"><span>${esc(t.name)}</span><strong>${round.points[t.id]} pts</strong></div>`).join('')}${!state.finished && !state.active ? `<button class="secondary" data-edit="${round.id}">Corriger les scores</button>` : ''}</details>`).join('') || '<p class="muted">Les résultats apparaîtront après ta première manche.</p>'}</section>
  <div class="actions" style="margin-top:14px">${available() ? link('manuel','Saisir un résultat','secondary') : ''}${!state.finished && state.rounds.length && !state.active ? '<button data-action="finish">Afficher le podium final</button>' : ''}${state.teams.length ? '<button class="ghost" data-action="reset">Nouvelle soirée</button>' : ''}</div>`;
}
function remaining() {
  const active = state.active;
  return Math.max(0, active.end ? Math.ceil((active.end - Date.now()) / 1000) : active.left);
}
function timeLabel(seconds) {
  return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0');
}
function pointsFields(points = {}) {
  return state.teams.map(team => `<label class="team"><span>${esc(team.name)}</span><input class="score-input" type="number" inputmode="numeric" name="${team.id}" min="0" max="999" step="1" value="${points[team.id] ?? 0}" required></label>`).join('');
}
function manualView() {
  if (!available()) {
    const page = state.active ? 'manche' : state.finished ? 'classement' : 'soiree';
    return `<section class="hero"><h1>Saisir un résultat<span>.</span></h1><p>${state.active ? 'Enregistre la manche en cours pour ajouter un autre résultat.' : state.finished ? 'La soirée est terminée.' : 'Ajoute au moins deux équipes pour saisir un résultat.'}</p><div class="actions">${link(page,'Continuer')}</div></section>`;
  }
  return `<section class="hero"><span class="eyebrow">Épreuve libre</span><h1>Saisir un résultat<span>.</span></h1><p>Les points s’ajoutent au classement et la manche apparaît dans l’historique.</p></section>
  <form id="manual" class="panel stack">
    <div><label for="manual-name">Nom de l’épreuve</label><input id="manual-name" name="name" maxlength="50" placeholder="Ex. Lancer d’anneaux" required></div>
    <div class="actions">${manualPresets.map(name => `<button type="button" class="secondary" data-preset="${name}">${name}</button>`).join('')}</div>
    <fieldset><legend>Points par équipe</legend>${pointsFields()}</fieldset>
    <div class="actions"><button>Enregistrer les scores</button>${link('jeux','Annuler','ghost')}</div>
  </form>`;
}
function roundView() {
  const game = currentGame();
  if (!game) return `<section class="panel stack"><h1>Aucune manche en cours.</h1><div>${link('jeux','Voir les défis')}</div></section>`;
  const edit = state.rounds.find(round => round.id === state.active.edit);
  return `<section class="hero"><span class="eyebrow">${edit ? 'Correction des scores' : game.group}</span><h1>${game.icon} ${esc(game.name)}</h1>${game.rules ? `<p>${esc(game.rules)}</p>` : ''}</section>
  ${edit ? '' : `<section class="panel stack"><h2>Chrono</h2><div class="timer" id="timer">${timeLabel(remaining())}</div><p id="timer-status" class="muted" role="status">${remaining() ? game.gear : 'Temps écoulé !'}</p>
  <div class="actions"><button id="timer-toggle" data-action="timer" ${remaining() ? '' : 'disabled'}>${state.active.end && remaining() ? 'Pause' : 'Démarrer'}</button><button class="secondary" data-action="restart">Relancer le chrono</button></div></section>`}
  <section class="panel"><h2>Points de la manche</h2><form id="points" class="stack">${pointsFields(edit?.points)}
  <div class="actions"><button>Enregistrer les scores</button><button type="button" class="ghost" data-action="cancel">${edit ? 'Annuler la correction' : 'Abandonner la manche'}</button></div></form></section>`;
}
function render() {
  const page = location.hash.slice(1);
  app.innerHTML = (storageIssue ? '<p class="error" role="alert">La sauvegarde locale est indisponible. Garde cet onglet ouvert pour conserver les scores.</p>' : '') +
    (page === 'jeux' ? library() : page === 'classement' ? ranking() : page === 'manche' ? roundView() : page === 'manuel' ? manualView() : home());
  for (const item of document.querySelectorAll('nav a')) {
    if (item.hash === (['manche', 'manuel'].includes(page) ? '#jeux' : '#' + (page || 'soiree'))) item.setAttribute('aria-current','page');
    else item.removeAttribute('aria-current');
  }
}
function update(page) {
  save();
  if (page && location.hash !== '#' + page) location.hash = page;
  else render();
}
function readPoints(data) {
  return Object.fromEntries(state.teams.map(team => [team.id, Number(data.get(team.id))]));
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0,0); });
app.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const data = new FormData(form);
  if (form.id === 'add-team') {
    const input = form.elements.name;
    const name = input.value.trim();
    if (!name || state.teams.some(team => team.name.toLocaleLowerCase('fr') === name.toLocaleLowerCase('fr'))) {
      input.setCustomValidity(name ? 'Ce nom est déjà utilisé.' : 'Saisis un nom d’équipe.');
      input.reportValidity();
      return;
    }
    state.teams.push({id:id(), name});
    update();
    document.querySelector('#team-name')?.focus();
  }
  if (form.id === 'custom') {
    const name = data.get('name').trim();
    const rules = data.get('rules').trim();
    if (!name || !rules) {
      const input = form.elements[name ? 'rules' : 'name'];
      input.setCustomValidity('Ce champ doit contenir du texte.');
      input.reportValidity();
      return;
    }
    state.custom.unshift({id:id(), name, rules, seconds:Number(data.get('seconds')), icon:'✦', group:'Personnalisé', gear:''});
    update();
  }
  if (form.id === 'manual' && available()) {
    const name = data.get('name').trim();
    if (!name) {
      const input = form.elements.name;
      input.setCustomValidity('Saisis un nom d’épreuve.');
      input.reportValidity();
      return;
    }
    state.rounds.push({id:id(), name, manual:true, points:readPoints(data)});
    update('classement');
  }
  if (form.id === 'points' && state.active) {
    const points = readPoints(data);
    const edit = state.rounds.find(round => round.id === state.active.edit);
    if (edit) edit.points = points;
    else state.rounds.push({id:id(), game:state.active.game, name:currentGame().name, points});
    state.active = null;
    update('classement');
  }
});
app.addEventListener('input', event => event.target.setCustomValidity?.(''));
app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  const { action, remove, play, edit, preset } = button.dataset;
  if (action === 'focus-team') {
    const input = document.querySelector('#team-name');
    input.scrollIntoView({ block: 'center' });
    input.focus({ preventScroll: true });
  }
  if (preset && manualPresets.includes(preset)) {
    const input = document.querySelector('#manual-name');
    input.value = preset;
    input.setCustomValidity('');
  }
  if (remove && !state.active && !state.rounds.length && !state.finished) {
    state.teams = state.teams.filter(team => team.id !== remove);
    update();
  }
  if (play && available()) {
    const game = allGames().find(game => game.id === play);
    state.active = {game:play, left:game.seconds, end:null};
    update('manche');
  }
  if (edit && !state.active && !state.finished) {
    const round = state.rounds.find(round => round.id === edit);
    state.active = {game:round.game, edit, left:0, end:null};
    update('manche');
  }
  if (action === 'reset' && confirm('Commencer une nouvelle soirée et effacer les équipes et scores actuels ?')) {
    state = {...fresh(), custom:state.custom};
    update('soiree');
  }
  if (action === 'finish') {
    state.finished = true;
    update();
  }
  if (action === 'cancel' && (state.active.edit || confirm('Abandonner la manche en cours ?'))) {
    const destination = state.active.edit ? 'classement' : 'jeux';
    state.active = null;
    update(destination);
  }
  if (action === 'timer') {
    const seconds = remaining();
    if (state.active.end) {
      state.active.left = seconds;
      state.active.end = null;
    } else state.active.end = Date.now() + seconds * 1000;
    save();
    button.textContent = state.active.end ? 'Pause' : 'Démarrer';
  }
  if (action === 'restart') {
    state.active.left = currentGame().seconds;
    state.active.end = Date.now() + state.active.left * 1000;
    save();
    const toggle = document.querySelector('#timer-toggle');
    toggle.disabled = false;
    toggle.textContent = 'Pause';
    document.querySelector('#timer-status').textContent = currentGame().gear;
  }
});
setInterval(() => {
  const timer = document.querySelector('#timer');
  if (!timer || !state.active?.end) return;
  const seconds = remaining();
  timer.textContent = timeLabel(seconds);
  if (seconds) return;
  state.active.end = null;
  state.active.left = 0;
  save();
  document.querySelector('#timer-status').textContent = 'Temps écoulé !';
  const toggle = document.querySelector('#timer-toggle');
  toggle.disabled = true;
  toggle.textContent = 'Démarrer';
}, 200);
render();
