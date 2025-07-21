import React, { useEffect, useState } from 'react';
import { Select, Button, Space, Alert, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getPipelineStages, updatePipelineStage } from '../../features/projectSlice';

const { Option } = Select;

const PipelineStageSelector = ({ projectId, currentStageId, pipelineTypeId }) => {
  const dispatch = useDispatch();
  const { pipelineStages } = useSelector((state) => state.projects);
  const { operation } = useSelector((state) => state.projects);
  const [selectedStage, setSelectedStage] = useState(currentStageId);
  
  useEffect(() => {
    if (pipelineTypeId) {
      dispatch(getPipelineStages(pipelineTypeId));
    }
  }, [dispatch, pipelineTypeId]);
  
  useEffect(() => {
    setSelectedStage(currentStageId);
  }, [currentStageId]);
  
  const handleStageChange = (value) => {
    setSelectedStage(value);
  };
  
  const handleSaveStage = () => {
    if (selectedStage !== currentStageId) {
      dispatch(updatePipelineStage({ id: projectId, pipelineStageId: selectedStage }));
    }
  };
  
  if (!pipelineTypeId) {
    return <Alert message="Ce projet n'a pas de type de pipeline défini" type="warning" showIcon />;
  }
  
  if (pipelineStages.loading) {
    return <Spin tip="Chargement des étapes..." />;
  }
  
  if (pipelineStages.error) {
    return <Alert message={pipelineStages.error} type="error" showIcon />;
  }
  
  const isLoading = operation.loading && operation.type === 'pipeline_stage' && operation.targetId === projectId;
  
  return (
    <div>
      <Space>
        <Select
          placeholder="Sélectionner une étape"
          style={{ width: 300 }}
          value={selectedStage}
          onChange={handleStageChange}
          disabled={isLoading}
        >
          {pipelineStages.items.map(stage => (
            <Option key={stage.id} value={stage.id}>{stage.name}</Option>
          ))}
        </Select>
        
        <Button
          type="primary"
          onClick={handleSaveStage}
          disabled={selectedStage === currentStageId}
          loading={isLoading}
        >
          Mettre à jour l'étape
        </Button>
      </Space>
    </div>
  );
};

export default PipelineStageSelector;