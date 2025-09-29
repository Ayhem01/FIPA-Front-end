import React from 'react';
import { Steps, Badge, Progress, Typography, Alert } from 'antd';
import { CheckCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Step } = Steps;
const { Text } = Typography;

/**
 * Composant pour visualiser un pipeline avec ses étapes
 * 
 * @param {Array} stages - Liste des étapes
 * @param {Object} currentStage - Étape actuelle
 * @param {Array} progression - Progression dans les étapes
 * @param {String} entityStatus - Statut de l'entité (projet, prospect, etc.)
 */
const PipelineVisualizer = ({ 
  stages = [], 
  currentStage, 
  progression = [],
  entityStatus // Nouveau prop pour le statut de l'entité
}) => {
  // Déterminer l'étape actuelle
  const effectiveCurrentStage = currentStage ||
    (stages && stages.length > 0 ? stages[0] : null);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // S'il n'y a pas d'étapes, afficher un message
  if (!stages || stages.length === 0) {
    return (
      <div className="pipeline-empty">
        Aucune étape définie dans ce pipeline.
      </div>
    );
  }

  // Calculer le pourcentage de progression
  const completedStages = progression?.filter(prog => prog.completed).length || 0;
  const totalStages = stages.length;
  
  // Vérifier si le pipeline est terminé
  const isEntityCompleted = entityStatus === 'completed';
  const isLastStageCompleted = effectiveCurrentStage?.is_final && 
      progression?.some(prog => prog.stage_id === effectiveCurrentStage.id && prog.completed);
  
  const isPipelineFinished = isEntityCompleted || isLastStageCompleted || completedStages === totalStages;
  
  let progressPercent;
  if (isPipelineFinished) {
      progressPercent = 100;
  } else {
      progressPercent = Math.round((completedStages / Math.max(1, totalStages)) * 100);
  }

  return (
    <div className="pipeline-visualizer">
      {/* Afficher une alerte si le pipeline est terminé */}
      {isPipelineFinished && (
        <Alert
          message="Pipeline terminé"
          description="Toutes les étapes du pipeline ont été complétées avec succès."
          type="success"
          icon={<TrophyOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Progress
        percent={progressPercent}
        status={isPipelineFinished ? "success" : "active"}
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
      />

      <Steps 
        current={isPipelineFinished ? stages.length : (effectiveCurrentStage ? effectiveCurrentStage.order - 1 : 0)} 
        direction="vertical"
        className="pipeline-steps"
        status={isPipelineFinished ? "finish" : "process"}
      >
        {stages.map(stage => {
          // Trouver les informations de progression pour cette étape
          const stageProgression = progression.find(p => p.stage_id === stage.id);
          const isCompleted = stage.order < (effectiveCurrentStage?.order || 1) || 
                             (isPipelineFinished && stage.is_final) ||
                             stageProgression?.completed;

          let stepStatus;
          if (isPipelineFinished && stage.is_final) {
            stepStatus = 'finish';
          } else if (isCompleted || stageProgression?.completed) {
            stepStatus = 'finish';
          } else if (stage.id === effectiveCurrentStage?.id && !isPipelineFinished) {
            stepStatus = 'process';
          } else {
            stepStatus = 'wait';
          }

          return (
            <Step
              key={stage.id}
              title={stage.name}
              description={
                <div>
                  <p>{stage.description}</p>
                  {(stageProgression?.completed || (isPipelineFinished && stage.is_final)) && (
                    <Text type="success">
                      <CheckCircleOutlined /> Complété le {formatDate(stageProgression?.created_at || new Date())}
                    </Text>
                  )}
                  {stage.is_final && isPipelineFinished && (
                    <Text type="success" style={{ display: 'block', marginTop: 4 }}>
                      <TrophyOutlined /> Étape finale - Pipeline terminé
                    </Text>
                  )}
                </div>
              }
              status={stepStatus}
            />
          );
        })}
        
        {/* Ajouter une étape finale virtuelle si le pipeline est terminé */}
        {isPipelineFinished && (
          <Step
            title="Pipeline terminé"
            description={
              <div>
                <Text type="success">
                  <TrophyOutlined /> Toutes les étapes ont été complétées avec succès
                </Text>
              </div>
            }
            status="finish"
          />
        )}
      </Steps>

      <style jsx>{`
        .pipeline-visualizer {
          margin: 20px 0;
        }
        
        .pipeline-steps {
          margin-top: 24px;
        }
        
        .pipeline-empty {
          text-align: center;
          padding: 24px;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default PipelineVisualizer;