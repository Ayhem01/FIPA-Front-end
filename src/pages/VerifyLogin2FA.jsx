import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../components/chart/configs/axiosConfig';

const VerifyLogin2FA = () => {
  // États pour gérer le formulaire et les messages
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes en secondes
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Récupérer le token temporaire et l'email des paramètres d'URL
  // ou du state passé lors de la navigation
  const tempToken = location.state?.tempToken || new URLSearchParams(location.search).get('token');
  const userEmail = location.state?.userEmail || new URLSearchParams(location.search).get('email');
  
  // Vérifier si le token est présent
  useEffect(() => {
    if (!tempToken) {
      setError('Token de vérification manquant. Veuillez vous reconnecter.');
      return;
    }
    
    // Démarrer le compte à rebours pour l'expiration du token
    const timer = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setError('Le token a expiré. Veuillez vous reconnecter.');
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [tempToken]);
  
  // Formater le compte à rebours
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Soumettre le code 2FA
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation basique
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      setError('Le code doit contenir exactement 6 chiffres.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Configurer les en-têtes avec le token temporaire
      const config = {
        headers: {
          'Authorization': `Bearer ${tempToken}`,
          'Content-Type': 'application/json'
        }
      };
      
      // Appeler l'API pour vérifier le code 2FA
      const response = await axios.post('/api/auth/verify-login-2fa', { code: parseInt(code) }, config);
      
      // En cas de succès, stocker le token complet et rediriger
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // Stocker les infos utilisateur si disponibles
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        // Rediriger vers le tableau de bord
        navigate('/dashboard');
        localStorage.removeItem("temp_token");

      }
    } catch (err) {
      console.error('Erreur lors de la vérification du code 2FA:', err);
      
      // Gérer différentes erreurs
      if (err.response) {
        if (err.response.status === 401) {
          setError('Code 2FA invalide. Veuillez réessayer.');
        } else if (err.response.status === 403) {
          setError('Token non valide. Veuillez vous reconnecter.');
        } else {
          setError(err.response.data?.message || 'Une erreur est survenue.');
        }
      } else {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Supprimer le token temporaire et rediriger vers la page de connexion
    localStorage.removeItem('temp_token');
    localStorage.removeItem('user_email');
    navigate('/sign-in');
  };

  return (
    <div className="verify-2fa-container">
      <div className="verify-2fa-card">
        <h2>Vérification à deux facteurs</h2>
        
        {userEmail && (
          <p className="user-email">
            Connecté en tant que: <strong>{userEmail}</strong>
          </p>
        )}
        
        <p className="instructions">
          Veuillez saisir le code à 6 chiffres généré par votre application d'authentification.
        </p>
        
        {countdown > 0 && (
          <div className="countdown">
            <p>Ce code expire dans: <span>{formatCountdown()}</span></p>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="code-input-container">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))}
              placeholder="000000"
              maxLength="6"
              disabled={loading || countdown === 0}
              autoFocus
              className="code-input"
              pattern="\d{6}"
              title="Le code doit contenir 6 chiffres"
              required
            />
          </div>
          
          <div className="button-group">
            <button 
              type="button" 
              onClick={handleCancel}
              className="cancel-button"
              disabled={loading}
              
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="verify-button"
              disabled={loading || code.length !== 6 || countdown === 0}
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
          </div>
        </form>
        
        <div className="help-text">
          <p>Vous n'avez pas accès à votre application d'authentification?</p>
          <button 
            className="link-button" 
            onClick={() => navigate('/help-2fa')}
          >
            Obtenir de l'aide
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyLogin2FA;