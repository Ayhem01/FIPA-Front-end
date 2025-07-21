import moment from 'moment-timezone';

// Configuration du fuseau horaire pour la Tunisie
moment.tz.setDefault('Africa/Tunis');

// Format de date standard pour l'affichage
export const formatDateDisplay = (date) => {
  if (!date) return 'Non définie';
  return moment(date).tz('Africa/Tunis').format('DD/MM/YYYY HH:mm');
};

// Format de date pour l'envoi à l'API
export const formatDateForApi = (date) => {
  if (!date) return null;
  return moment(date).tz('Africa/Tunis').format('YYYY-MM-DD HH:mm:ss');
};

// Convertir une date de l'API vers l'affichage local
export const apiToLocalDate = (apiDate) => {
  if (!apiDate) return null;
  return moment(apiDate).tz('Africa/Tunis').toDate();
};

// Log du fuseau horaire actuel pour le débogage
console.log('Fuseau horaire configuré:', 'Africa/Tunis');
console.log('Heure locale actuelle:', moment().tz('Africa/Tunis').format('YYYY-MM-DD HH:mm:ss'));