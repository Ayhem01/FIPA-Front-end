import React, { useEffect, useState } from 'react';
import axios from '../components/chart/configs/axiosConfig';
import Verify2FA from './Verify2FA';
import { Link, useNavigate } from 'react-router-dom';

export default function Setup2FA() {
  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyEnabled, setAlreadyEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
const [password, setPassword] = useState('');
const [disableLoading, setDisableLoading] = useState(false);
const [disableError, setDisableError] = useState(null);
const [disableSuccess, setDisableSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // D'abord, vérifier si le 2FA est déjà activé
    const checkTwoFactorStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Token non disponible. Veuillez vous connecter.');
          setLoading(false);
          return;
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true
        };
        
        const statusResponse = await axios.get('/api/auth/two-factor-status', config);
        
        if (statusResponse.data.enabled) {
          setAlreadyEnabled(true);
          setLoading(false);
          return;
        }
        
        // Continuer avec le chargement normal si 2FA n'est pas activé
        loadQrAndSecret(token, config);
      } catch (err) {
        console.error('Erreur lors de la vérification du statut 2FA :', err);
        setError('Impossible de vérifier le statut 2FA. Veuillez réessayer.');
        setLoading(false);
      }
    };
    
    const loadQrAndSecret = (token, config) => {
      // Vérifier si nous avons déjà chargé le QR code dans cette session
      const cachedQr = sessionStorage.getItem('temp_2fa_qr');
      const cachedSecret = sessionStorage.getItem('temp_2fa_secret');
      
      if (cachedQr && cachedSecret) {
        // Utiliser le QR code et le secret en cache
        setQr(cachedQr);
        setSecret(cachedSecret);
        setLoading(false);
        return;
      }
      
      // Sinon, charger depuis le serveur
      axios
        .post('/api/auth/enable2fa', {}, config)
        .then((res) => {
          if (res.data && res.data.qr && res.data.secret) {
            // Stocker dans l'état et dans sessionStorage
            setQr(res.data.qr);
            setSecret(res.data.secret);
            sessionStorage.setItem('temp_2fa_qr', res.data.qr);
            sessionStorage.setItem('temp_2fa_secret', res.data.secret);
          } else {
            setError('Réponse incomplète du serveur');
          }
        })
        .catch((err) => {
          console.error('Erreur lors de la récupération du QR code :', err);
          setError('Impossible de configurer 2FA. Veuillez réessayer.');
        })
        .finally(() => {
          setLoading(false);
        });
    };
    
    checkTwoFactorStatus();
  }, []);
  // Ajouter cette fonction dans votre composant Setup2FA
const handleDisable2FA = async () => {
  setDisableLoading(true);
  setDisableError(null);
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setDisableError('Token non disponible. Veuillez vous reconnecter.');
      setDisableLoading(false);
      return;
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true
    };
    
    // Appel à l'API pour désactiver le 2FA
    await axios.post(
      '/api/auth/disable2fa',
      { password },
      config
    );
    setDisableSuccess(true);
    setShowPasswordModal(false);
    
    // Recharger la page ou mettre à jour l'état après 2 secondes
    setTimeout(() => {
      window.location.reload();
      // Ou si vous préférez naviguer:
      // navigate('/profile');
    }, 2000);
  } catch (err) {
    console.error('Erreur lors de la désactivation du 2FA:', err);
    
    if (err.response && err.response.data && err.response.data.message) {
      setDisableError(err.response.data.message);
    } else {
      setDisableError('Une erreur est survenue lors de la désactivation du 2FA.');
    }
  } finally {
    setDisableLoading(false);
  }
};

  return (
    <div className="setup-2fa-container">
      <h2>Configurer l'authentification à deux facteurs (2FA)</h2>
      
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <span>Chargement de la configuration 2FA...</span>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
      
      {alreadyEnabled && (
        <div className="already-enabled">
          <p className="success-message">
            L'authentification à deux facteurs est déjà activée pour votre compte.
          </p>
          <div className="button-group">
            <button 
              className="primary-button" 
              onClick={() => navigate('/profile')}
            >
              Retour au profil
            </button>
            <button 
        className="secondary-button" 
        onClick={() => setShowPasswordModal(true)}  // Ouvrir la modal au lieu de naviguer
      >
        Désactiver le 2FA
      </button>
    </div>
    
    {/* Message de succès si 2FA désactivé */}
    {disableSuccess && (
      <div className="success-message mt-4">
        L'authentification à deux facteurs a été désactivée avec succès. 
        Redirection en cours...
      </div>
    )}
  </div>
        
      )}
      
      {!alreadyEnabled && qr && (
        <div className="qr-container">
          <img src={qr} alt="QR Code" className="qr-code" />
          <p className="instructions">
            Scannez ce QR code avec une application d'authentification 
            comme Google Authenticator ou Authy.
          </p>
        </div>
      )}
      
      {!alreadyEnabled && secret && (
        <div className="secret-key">
          <p><strong>Clé manuelle :</strong> {secret}</p>
          <p className="instructions">
            Si vous ne pouvez pas scanner le QR code, vous pouvez entrer cette clé manuellement 
            dans votre application d'authentification.
          </p>
        </div>
      )}
      
      {!alreadyEnabled && (qr && secret) && (
        <div className="verification-section">
          <h3>Vérification</h3>
          <p>Entrez le code à 6 chiffres fourni par votre application :</p>
          <Verify2FA 
            secret={secret} 
            onSuccess={() => {
              sessionStorage.removeItem('temp_2fa_qr');
              sessionStorage.removeItem('temp_2fa_secret');
            }}
          />
        </div>
      )}
      
      {showPasswordModal && (
          <div className="password-modal-overlay">
            <div className="password-modal">
              <h3>Confirmation requise</h3>
              <p>Pour des raisons de sécurité, veuillez entrer votre mot de passe pour désactiver l'authentification à deux facteurs.</p>
              
              <input
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password-input"
              />
              
              {disableError && (
                <div className="error-message">
                  {disableError}
                </div>
              )}
              
              <div className="button-group">
                <button
                  className="primary-button"
                  onClick={handleDisable2FA}
                  disabled={disableLoading || !password}

                >
                  {disableLoading ? 'Désactivation en cours...' : 'Confirmer'}
                </button>
                <button
          className="secondary-button"
          onClick={() => {
            setShowPasswordModal(false);
            setPassword('');
            setDisableError(null);
          }}
          disabled={disableLoading}
        >
          Annuler
        </button>
      </div>
    </div>
  </div>
)}
      
    </div>
  
  );
  
}








  
