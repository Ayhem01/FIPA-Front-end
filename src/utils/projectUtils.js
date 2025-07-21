// src/utils/projectUtils.js
import { Tag } from 'antd';
import React from 'react';

// Fonction pour obtenir le tag de statut du projet
export const getProjectStatusTag = (project) => {
  if (project.idea) {
    return <Tag color="blue">Idée</Tag>;
  } else if (project.in_progress) {
    return <Tag color="orange">En cours</Tag>;
  } else if (project.in_production) {
    return <Tag color="green">En production</Tag>;
  }
  return <Tag color="default">Indéfini</Tag>;
};

// Fonction pour obtenir le libellé de statut du projet
export const getProjectStatusLabel = (project) => {
  if (project.idea) {
    return 'Idée';
  } else if (project.in_progress) {
    return 'En cours';
  } else if (project.in_production) {
    return 'En production';
  }
  return 'Indéfini';
};

// Fonction pour obtenir la valeur de statut du projet
export const getProjectStatus = (project) => {
  if (project.idea) {
    return 'idea';
  } else if (project.in_progress) {
    return 'in_progress';
  } else if (project.in_production) {
    return 'in_production';
  }
  return null;
};

// Fonction pour formater les données du formulaire avant l'envoi à l'API
export const formatProjectForSubmit = (values) => {
  return {
    ...values,
    idea: values.status === 'idea',
    in_progress: values.status === 'in_progress',
    in_production: values.status === 'in_production',
    status: undefined // Supprimer ce champ car il n'est pas attendu par l'API
  };
};

// Fonction pour préparer les données du projet pour le formulaire
export const prepareProjectForForm = (project) => {
  if (!project) return null;
  
  let status = 'idea';
  if (project.in_progress) status = 'in_progress';
  if (project.in_production) status = 'in_production';
  
  return {
    ...project,
    status
  };
};