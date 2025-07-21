import React, { useEffect, useState } from 'react';
import { Steps, Spin, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getPipelineTypeWithStages } from '../../features/projectSlice';

const { Step } = Steps;

const PipelineVisualizer = ({ project, pipelineTypeId }) => {
  const dispatch = useDispatch();
  const { data, stages, loading, error } = useSelector(state => state.projects.selectedPipelineType);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  
  useEffect(() => {
    if (pipelineTypeId) {
      dispatch(getPipelineTypeWithStages(pipelineTypeId));
    }
  }, [dispatch, pipelineTypeId]);
  
  useEffect(() => {
    if (stages.length > 0 && project && project.pipeline_stage_id) {
      // Trouver l'index de l'étape actuelle
      const index = stages.findIndex(stage => stage.id === project.pipeline_stage_id);
      setCurrentStageIndex(index !== -1 ? index : 0);
    }
  }, [stages, project]);
  
  if (loading) {
    return <Spin tip="Chargement du pipeline..." />;
  }
  
  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }
  
  if (!pipelineTypeId) {
    return <Alert message="Ce projet n'a pas de type de pipeline défini" type="warning" showIcon />;
  }
  
  if (stages.length === 0) {
    return <Alert message="Aucune étape n'est définie pour ce type de pipeline" type="info" showIcon />;
  }
  
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);
  
  return (
    <Steps
      current={currentStageIndex}
      labelPlacement="vertical"
      responsive
      size="small"
    >
      {sortedStages.map(stage => (
        <Step 
          key={stage.id} 
          title={stage.name} 
          description={stage.description && stage.description.length > 30 
            ? `${stage.description.substring(0, 30)}...` 
            : stage.description
          } 
        />
      ))}
    </Steps>
  );
};

export default PipelineVisualizer;