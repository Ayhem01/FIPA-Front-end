import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'antd';
import axios from 'axios';
import { getAuthHeader } from '../../features/taskSlice';
import { debounce } from 'lodash';

const { Option } = Select;

const API_BASE_URL = "http://localhost:8000/api";
const EntrepriseSelect = ({ 
  value, 
  onChange, 
  placeholder = "Sélectionner une entreprise", 
  style = {},
  disabled = false,
  allowClear = true,
  showSearch = true
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Charger les options initiales
  useEffect(() => {
    fetchEntreprises();
  }, []);

  // Fonction pour chercher des entreprises
  const fetchEntreprises = async (search = '') => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/entreprises`;
      if (search) {
        url = `${API_BASE_URL}/entreprises/search/quick?query=${encodeURIComponent(search)}`;
      }
      
      const response = await axios.get(url, getAuthHeader());
      const data = response.data.data || response.data;
      setOptions(data);
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce de la recherche
  const debouncedSearch = debounce((value) => {
    fetchEntreprises(value);
  }, 500);

  // Gestion de la recherche
  const handleSearch = (value) => {
    setSearchText(value);
    debouncedSearch(value);
  };

  return (
    <Select
      showSearch={showSearch}
      value={value}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
      onChange={onChange}
      onSearch={handleSearch}
      filterOption={false}
      loading={loading}
      disabled={disabled}
      allowClear={allowClear}
      notFoundContent={loading ? <Spin size="small" /> : "Aucune entreprise trouvée"}
    >
      {options.map((entreprise) => (
        <Option key={entreprise.id} value={entreprise.id}>
          {entreprise.name}
        </Option>
      ))}
    </Select>
  );
};

export default EntrepriseSelect;