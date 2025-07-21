import { Switch } from 'antd';
import i18n from 'i18next'; 
import { useEffect } from 'react';

const LanguageSwitcher = () => {
  const savedLanguage = localStorage.getItem('language') || 'en';

  useEffect(() => {
    i18n.changeLanguage(savedLanguage); 
  }, [savedLanguage]);

  const changeLanguage = (checked) => {
    const language = checked ? 'fr' : 'en';
    i18n.changeLanguage(language);
    localStorage.setItem('language', language); 
  };

  return (
    <div style={{ marginRight: 16 }}>
      <Switch
        checkedChildren="FR"
        unCheckedChildren="EN"
        onChange={changeLanguage}
        defaultChecked={savedLanguage === 'fr'}
      />
    </div>
  );
};

export default LanguageSwitcher;