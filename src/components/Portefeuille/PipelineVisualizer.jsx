import React from 'react';
import { Steps, Progress, Typography, Alert, Tag, Card } from 'antd';
import { 
  CheckCircleOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  SyncOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/fr';

const { Step } = Steps;
const { Text, Paragraph } = Typography;

moment.locale('fr');

/**
 * Composant pour visualiser un pipeline avec ses étapes et leur historique détaillé
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
  entityStatus
}) => {
  // Déterminer l'étape actuelle
  const effectiveCurrentStage = currentStage ||
    (stages && stages.length > 0 ? stages[0] : null);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Fonction pour formater la date relative
  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';
    return moment(dateString).fromNow();
  };

  // S'il n'y a pas d'étapes, afficher un message
  if (!stages || stages.length === 0) {
    return (
      <div className="pipeline-empty">
        <InfoCircleOutlined style={{ fontSize: 24, color: '#bbb', marginBottom: 8 }} />
        <p>Aucune étape définie dans ce pipeline.</p>
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

  // Trouver l'index de l'étape actuelle
  const currentStageIndex = stages.findIndex(s => s.id === effectiveCurrentStage?.id);

  return (
    <div className="pipeline-visualizer">
      {/* Afficher une alerte si le pipeline est terminé */}
      {isPipelineFinished && (
        <Alert
          message="Pipeline terminé avec succès"
          description={
            <div>
              <p>Toutes les étapes du pipeline ont été complétées.</p>
              <Tag color="success" icon={<TrophyOutlined />}>
                {totalStages} étapes complétées
              </Tag>
            </div>
          }
          type="success"
          icon={<TrophyOutlined />}
          showIcon
          style={{ marginBottom: 24, borderRadius: 8 }}
        />
      )}

      {/* Barre de progression */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text strong>Progression globale</Text>
          <Text strong style={{ color: progressPercent === 100 ? '#52c41a' : '#1890ff' }}>
            {progressPercent}%
          </Text>
        </div>
        <Progress
          percent={progressPercent}
          status={isPipelineFinished ? "success" : "active"}
          strokeColor={{
            '0%': '#667eea',
            '100%': '#764ba2',
          }}
          strokeWidth={12}
          style={{ marginBottom: 8 }}
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {completedStages} sur {totalStages} étapes complétées
        </Text>
      </div>

      {/* Steps avec historique détaillé */}
      <Steps 
        current={isPipelineFinished ? stages.length : currentStageIndex} 
        direction="vertical"
        className="pipeline-steps-detailed"
      >
        {stages.map((stage, index) => {
          // Trouver les informations de progression pour cette étape
          const stageProgression = progression.find(p => p.stage_id === stage.id);
          const isCompleted = stageProgression?.completed || false;
          const isCurrent = stage.id === effectiveCurrentStage?.id && !isPipelineFinished;
          
          let stepStatus;
          if (isCompleted) {
            stepStatus = 'finish';
          } else if (isCurrent) {
            stepStatus = 'process';
          } else {
            stepStatus = 'wait';
          }

          // Calculer la durée dans l'étape
          let durationText = '';
          if (stageProgression?.created_at) {
            if (isCompleted && stageProgression.completed_at) {
              const duration = moment(stageProgression.completed_at).diff(moment(stageProgression.created_at), 'days');
              durationText = `Durée: ${duration} jour${duration > 1 ? 's' : ''}`;
            } else if (isCurrent) {
              const duration = moment().diff(moment(stageProgression.created_at), 'days');
              durationText = `Depuis ${duration} jour${duration > 1 ? 's' : ''}`;
            }
          }

          return (
            <Step
              key={stage.id}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong style={{ fontSize: 15 }}>{stage.name}</Text>
                  {isCompleted && (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Terminée
                    </Tag>
                  )}
                  {isCurrent && (
                    <Tag color="processing" icon={<SyncOutlined spin />}>
                      En cours
                    </Tag>
                  )}
                  {stage.is_final && (
                    <Tag color="gold" icon={<TrophyOutlined />}>
                      Finale
                    </Tag>
                  )}
                </div>
              }
              description={
                <Card 
                  size="small" 
                  style={{ 
                    marginTop: 8,
                    background: isCompleted ? '#f6ffed' : isCurrent ? '#e6f7ff' : '#fafafa',
                    border: `1px solid ${isCompleted ? '#b7eb8f' : isCurrent ? '#91d5ff' : '#d9d9d9'}`,
                    borderRadius: 8
                  }}
                  bodyStyle={{ padding: 12 }}
                >
                  {/* Description de l'étape */}
                  {stage.description && (
                    <Paragraph 
                      style={{ 
                        marginBottom: 12, 
                        color: '#666',
                        fontSize: 13
                      }}
                    >
                      {stage.description}
                    </Paragraph>
                  )}

                  {/* Informations de progression */}
                  {stageProgression && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {/* Date de début */}
                      {stageProgression.created_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CalendarOutlined style={{ color: '#1890ff' }} />
                          <Text style={{ fontSize: 12 }}>
                            <strong>Début:</strong> {formatDate(stageProgression.created_at)}
                            <Text type="secondary" style={{ marginLeft: 6 }}>
                              ({formatRelativeDate(stageProgression.created_at)})
                            </Text>
                          </Text>
                        </div>
                      )}

                      {/* Date de fin si complétée */}
                      {isCompleted && stageProgression.completed_at && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <Text style={{ fontSize: 12, color: '#52c41a' }}>
                            <strong>Complété le:</strong> {formatDate(stageProgression.completed_at)}
                            <Text type="secondary" style={{ marginLeft: 6 }}>
                              ({formatRelativeDate(stageProgression.completed_at)})
                            </Text>
                          </Text>
                        </div>
                      )}

                      {/* Durée */}
                      {durationText && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ClockCircleOutlined style={{ color: isCurrent ? '#1890ff' : '#52c41a' }} />
                          <Text style={{ fontSize: 12, color: isCurrent ? '#1890ff' : '#52c41a' }}>
                            <strong>{durationText}</strong>
                          </Text>
                        </div>
                      )}

                      {/* Notes */}
                      {stageProgression.notes && (
                        <Alert
                          message="Notes"
                          description={stageProgression.notes}
                          type="info"
                          showIcon
                          style={{ 
                            marginTop: 8, 
                            fontSize: 12,
                            padding: '8px 12px'
                          }}
                        />
                      )}
                    </div>
                  )}

                  {/* Si l'étape n'a pas encore été atteinte */}
                  {!stageProgression && !isCurrent && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined /> En attente
                    </Text>
                  )}
                </Card>
              }
              status={stepStatus}
              icon={
                isCompleted ? <CheckCircleOutlined /> : 
                isCurrent ? <SyncOutlined spin /> : 
                <ClockCircleOutlined />
              }
            />
          );
        })}
      </Steps>

      <style jsx>{`
        .pipeline-visualizer {
          padding: 20px 0;
        }
        
        .pipeline-steps-detailed {
          margin-top: 24px;
        }

        .pipeline-steps-detailed .ant-steps-item-title {
          font-size: 15px !important;
          font-weight: 600 !important;
        }

        .pipeline-steps-detailed .ant-steps-item-description {
          margin-top: 8px;
        }

        .pipeline-steps-detailed .ant-steps-item-content {
          min-height: auto !important;
        }
        
        .pipeline-empty {
          text-align: center;
          padding: 60px 24px;
          color: #999;
        }

        .pipeline-empty p {
          margin: 0;
          font-size: 14px;
        }

        /* Personnalisation des icônes */
        .pipeline-steps-detailed .ant-steps-icon {
          font-size: 18px;
        }

        /* Espacement entre les étapes */
        .pipeline-steps-detailed .ant-steps-item {
          padding-bottom: 24px !important;
        }

        /* Couleurs des lignes de connexion */
        .pipeline-steps-detailed .ant-steps-item-finish .ant-steps-item-tail::after {
          background-color: #52c41a !important;
        }

        .pipeline-steps-detailed .ant-steps-item-process .ant-steps-item-tail::after {
          background-color: #1890ff !important;
        }
      `}</style>
    </div>
  );
};

export default PipelineVisualizer;