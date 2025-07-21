import React, { useState, useEffect } from 'react';
import axios from '../components/chart/configs/axiosConfig';

export default function Verify2FA({ secret }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(30);
  
  // Compte à rebours pour le code TOTP
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsRemaining = 30 - (currentTime % 30);
      setCountdown(secondsRemaining);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vérifier que le code n'est pas vide
    if (!code.trim()) {
      alert('Veuillez entrer un code.');
      return;
    }
    
    try {
      setLoading(true);
      setStatus(null);
      setErrorMessage('');
      
      // Récupérer le token d'authentification
      const token = localStorage.getItem('token');
      
      if (!token) {
        setErrorMessage('Token non disponible. Veuillez vous connecter.');
        setStatus('error');
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true
      };
      
      console.log('Données envoyées:', { 
        code: parseInt(code),
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      const res = await axios.post(
        '/api/auth/verify2fa',
        { code: parseInt(code) },
        config
      );
      
      // Si on arrive ici, c'est un succès
      setStatus('success');
      localStorage.removeItem('temp_2fa_secret');
      
    } catch (error) {
      if (error.response) {
        // Erreur de réponse du serveur
        console.error("Détails de l'erreur:", error.response.data);
        
        if (error.response.status === 401) {
          // Code 2FA invalide - comportement normal pour un code incorrect
          setStatus('invalid-code');
          setErrorMessage('Code incorrect. Veuillez réessayer.');
        } else {
          // Autres erreurs serveur
          setStatus('error');
          setErrorMessage(error.response.data.message || 'Une erreur est survenue');
        }
      } else {
        // Erreur de réseau ou autres
        setStatus('error');
        setErrorMessage('Problème de connexion au serveur.');
        console.error('Erreur lors de la vérification 2FA:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-2fa">
      {/* Afficher le temps restant pour le code actuel */}
      <div className="totp-countdown">
        <p>Code valide pendant: <span className={countdown < 10 ? "countdown warning" : "countdown"}>{countdown}</span> secondes</p>
        <div className="progress-bar">
          <div className="progress" style={{width: `${(countdown/30)*100}%`}}></div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Entrez le code à 6 chiffres"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            minLength={6}
            maxLength={6}
            pattern="\d*"
            title="Le code doit contenir 6 chiffres"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </div>
        
        {status === 'success' && (
          <div className="success-message">
            2FA activé avec succès!
          </div>
        )}
        
        {status === 'invalid-code' && (
          <div className="warning-message">
            Code incorrect. Vérifiez votre application d'authentification et réessayez.
          </div>
        )}
        
        {status === 'error' && (
          <div className="error-message">
            {errorMessage || 'Une erreur est survenue. Veuillez réessayer.'}
          </div>
        )}
      </form>
    </div>
  );
}