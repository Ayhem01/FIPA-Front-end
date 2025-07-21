import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectsByStatusStats } from '../../features/projectSlice';
import { Spin, Alert } from 'antd';

const ProjectStats = () => {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.projects.statistics.projectsByStatus);
  
  useEffect(() => {
    dispatch(fetchProjectsByStatusStats());
  }, [dispatch]);
  
  if (loading) return <Spin size="large" />;
  if (error) return <Alert type="error" message={error} />;
  if (!data) return null;
  
  return (
    <div>
      <h2>Statistiques par statut</h2>
      <p>Total: {data.status_stats.total}</p>
      <p>Idées: {data.status_stats.idea}</p>
      <p>En cours: {data.status_stats.in_progress}</p>
      <p>En production: {data.status_stats.in_production}</p>
      
      <h3>Par étape du pipeline</h3>
      {data.pipeline_stats.map((stat, index) => (
        <p key={index}>{stat.name}: {stat.count}</p>
      ))}
    </div>
  );
};

export default ProjectStats;