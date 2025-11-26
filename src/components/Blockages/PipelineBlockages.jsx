import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, Spin, Alert, Row, Col, Badge, Empty, Typography } from 'antd';
import { motion } from 'framer-motion';
import { InfoCircleOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { fetchBlockagesByEntity } from '../../features/blockageSlice';
import BlockageCard from './BlockageCard';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

// Animations avec framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};


const PipelineBlockages = ({ entityType, entityId, pipelineStages = [], title = "Blocages par étape", onChange }) => {
  const dispatch = useDispatch();
  const { entityBlockages, loading, error, operation } = useSelector(state => state.blockages);
  const [groupedBlockages, setGroupedBlockages] = useState({});
  const [activeTabKey, setActiveTabKey] = useState('all');
  const lastOpRef = useRef(null);
  useEffect(() => {
    const key = JSON.stringify({
      type: operation?.type,
      success: operation?.success,
      id: operation?.id,
      at: operation?.at || operation?.timestamp
    });

    if (operation?.success && key !== lastOpRef.current) {
      lastOpRef.current = key;
      // Notifier le parent
      if (typeof onChange === 'function') {
        onChange(operation);
      }
      // Notifier globalement (si d’autres composants/onglets doivent réagir)
      try {
        window.dispatchEvent(new CustomEvent('blockage:changed', {
          detail: { entityType, entityId, operation }
        }));
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('pipeline-blockages');
          bc.postMessage({ entityType, entityId, operation, at: Date.now() });
          bc.close();
        }
      } catch (_) {}
    }
  }, [operation, onChange, entityType, entityId]);

  // Charger les blocages au chargement ou quand entityType/entityId change
  useEffect(() => {
    if (entityType && entityId) {
      dispatch(fetchBlockagesByEntity({ blockableType: entityType, blockableId: entityId }));
    }
  }, [dispatch, entityType, entityId]);
  
  // Réagir aux opérations réussies
  useEffect(() => {
    if (operation.success) {
      dispatch(fetchBlockagesByEntity({ blockableType: entityType, blockableId: entityId }));
    }
  }, [operation.success, dispatch, entityType, entityId]);
  
  // Grouper les blocages par étape de pipeline
  useEffect(() => {
    if (entityBlockages && entityBlockages.length) {
      const grouped = entityBlockages.reduce((acc, blockage) => {
        const stageId = blockage.pipeline_stageable_id?.toString() || 'unknown';
        if (!acc[stageId]) {
          acc[stageId] = [];
        }
        acc[stageId].push(blockage);
        return acc;
      }, {});
      
      setGroupedBlockages(grouped);
    } else {
      setGroupedBlockages({});
    }
  }, [entityBlockages]);
  
  // Calculer le nombre de blocages actifs
  const countActiveBlockages = (blockages = []) => {
    return blockages.filter(b => b.status === 'actif').length;
  };
  
  // Trouver le nom de l'étape par ID
  const getStageNameById = (stageId) => {
    const stage = pipelineStages.find(s => s.id?.toString() === stageId?.toString());
    return stage ? stage.name : `Étape #${stageId}`;
  };

  // Onglets des étapes avec mémo pour performance
  const stageTabPanes = useMemo(() => {
    return Object.keys(groupedBlockages).map(stageId => (
      <TabPane 
        tab={
          <span className="stage-tab">
            {getStageNameById(stageId)}
            {countActiveBlockages(groupedBlockages[stageId]) > 0 && (
              <Badge 
                count={countActiveBlockages(groupedBlockages[stageId])} 
                className="stage-badge"
              />
            )}
          </span>
        }
        key={stageId}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <BlockageCard
            blockages={groupedBlockages[stageId] || []}
            entityType={entityType}
            entityId={entityId}
            pipelineStageType={entityBlockages[0]?.pipeline_stageable_type || 'pipeline_stage'}
            pipelineStageId={parseInt(stageId)}
            title={`Blocages de l'étape: ${getStageNameById(stageId)}`}
          />
        </motion.div>
      </TabPane>
    ));
  }, [groupedBlockages, entityType, entityId, entityBlockages, getStageNameById]);
  
  // Onglet des blocages actifs
  const activeBlockagesTabPane = useMemo(() => {
    return (
      <TabPane 
        tab={
          <span className="active-blockages-tab">
            Actifs uniquement
            {countActiveBlockages(entityBlockages) > 0 && (
              <Badge 
                count={countActiveBlockages(entityBlockages)} 
                className="active-badge"
              />
            )}
          </span>
        }
        key="active"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row gutter={[16, 16]}>
            {Object.keys(groupedBlockages).map(stageId => {
              const activeBlockages = (groupedBlockages[stageId] || []).filter(b => b.status === 'actif');
              if (activeBlockages.length === 0) return null;
              
              return (
                <Col span={24} key={stageId}>
                  <motion.div variants={itemVariants}>
                    <BlockageCard
                      title={`${getStageNameById(stageId)}`}
                      blockages={activeBlockages}
                      entityType={entityType}
                      entityId={entityId}
                      pipelineStageType={entityBlockages[0]?.pipeline_stageable_type || 'pipeline_stage'}
                      pipelineStageId={parseInt(stageId)}
                    />
                  </motion.div>
                </Col>
              );
            })}
          </Row>
        </motion.div>
      </TabPane>
    );
  }, [groupedBlockages, entityBlockages, entityType, entityId, getStageNameById]);
  
  if (loading && !entityBlockages.length) {
    return (
      <div className="blockages-loader">
        <Spin size="large" />
        <Text className="loading-text">Chargement des blocages...</Text>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert
        message="Erreur lors du chargement des blocages"
        description={error}
        type="error"
        showIcon
        icon={<WarningOutlined />}
        className="blockages-error"
      />
    );
  }
  
  if (!entityBlockages || entityBlockages.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="empty-blockages"
      >
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description={
            <Text className="empty-text">Aucun blocage trouvé pour cette entité</Text>
          }
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="pipeline-blockages"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="blockages-header">
        <Title level={4} className="blockages-title">
          <InfoCircleOutlined className="title-icon" />
          {title}
        </Title>
      </div>
      
      <Tabs 
        defaultActiveKey="all" 
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        type="card"
        className="blockages-tabs"
      >
        <TabPane 
          tab={
            <span className="all-blockages-tab">
              Tous les blocages 
              {countActiveBlockages(entityBlockages) > 0 && (
                <Badge 
                  count={countActiveBlockages(entityBlockages)} 
                  className="all-badge"
                />
              )}
            </span>
          } 
          key="all"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Row gutter={[16, 16]}>
              {Object.keys(groupedBlockages).map(stageId => (
                <Col span={24} key={stageId}>
                  <motion.div variants={itemVariants}>
                    <BlockageCard
                      title={`${getStageNameById(stageId)}`}
                      blockages={groupedBlockages[stageId] || []}
                      entityType={entityType}
                      entityId={entityId}
                      pipelineStageType={entityBlockages[0]?.pipeline_stageable_type || 'pipeline_stage'}
                      pipelineStageId={parseInt(stageId)}
                    />
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </TabPane>
        
        {/* Onglets pour chaque étape du pipeline */}
        {stageTabPanes}
        
        {/* Onglet pour les blocages actifs uniquement */}
        {activeBlockagesTabPane}
      </Tabs>
      
      {loading && entityBlockages.length > 0 && (
        <div className="loading-overlay">
          <Spin size="large" />
        </div>
      )}
      
      {/* CSS intégré pour les styles personnalisés */}
      <style jsx>{`
        .pipeline-blockages {
          background: #ffffff;
          border-radius: 10px;
          padding: 24px;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
          position: relative;
          overflow: hidden;
        }
        
        .pipeline-blockages::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: linear-gradient(90deg, #1890ff, #52c41a);
        }
        
        .blockages-header {
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .blockages-title {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #222;
          margin: 0;
        }
        
        .title-icon {
          margin-right: 8px;
          font-size: 20px;
          color: #1890ff;
        }
        
        .blockages-tabs {
          margin-bottom: 24px;
        }
        
        .blockages-tabs .ant-tabs-tab {
          transition: all 0.3s ease;
          border-radius: 6px 6px 0 0;
          margin-right: 4px;
          padding: 10px 16px;
        }
        
        .blockages-tabs .ant-tabs-tab:hover {
          color: #1890ff;
          background: #f0f7ff;
        }
        
        .blockages-tabs .ant-tabs-tab-active {
          background: #e6f7ff !important;
          border-bottom-color: #e6f7ff !important;
          font-weight: 500;
        }
        
        .blockages-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1890ff !important;
        }
        
        .stage-tab, .all-blockages-tab, .active-blockages-tab {
          display: flex;
          align-items: center;
        }
        
        .stage-badge, .all-badge, .active-badge {
          margin-left: 8px;
          transform: scale(0.9);
        }
        
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }
        
        .blockages-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 0;
        }
        
        .loading-text {
          margin-top: 16px;
          color: #888;
          font-size: 14px;
        }
        
        .blockages-error {
          animation: fadeIn 0.5s;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .empty-blockages {
          padding: 40px;
          background: #fafafa;
          border-radius: 10px;
          text-align: center;
        }
        
        .empty-text {
          color: #888;
          font-size: 14px;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
};

export default PipelineBlockages;