import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Space, message, Alert, Spin, Row, Col, Dropdown, Menu, Avatar, Typography, Badge } from 'antd';
import { 
  PlusOutlined, SettingOutlined, CalendarOutlined, FilterOutlined, 
  ReloadOutlined, ArrowLeftOutlined, UserOutlined, InfoCircleOutlined 
} from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCalendarTasks, moveCalendarTask, resetTaskOperation } from '../../features/taskSlice';
import moment from 'moment';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import 'moment/locale/fr'; // Pour la localisation en français

const { Option } = Select;
const { Text, Title } = Typography;

const TaskCalendar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: calendarTasks, loading, error } = useSelector(state => state.tasks.calendarTasks);
  const { type: operationType, loading: operationLoading, success: operationSuccess, error: operationError } = useSelector(state => state.tasks.taskOperation);
  
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    entity_type: 'all',
    assignee_id: undefined
  });
  const [calendarApi, setCalendarApi] = useState(null);

  // Récupérer la date actuelle du calendrier
  useEffect(() => {
    if (calendarApi) {
      const start = calendarApi.view.activeStart.toISOString();
      const end = calendarApi.view.activeEnd.toISOString();
      loadTasks(start, end);
    }
  }, [calendarApi, filters]);

  useEffect(() => {
    if (operationSuccess && operationType === 'move') {
      message.success('Tâche déplacée avec succès');
      dispatch(resetTaskOperation());
      
      // Rafraîchir les événements du calendrier
      if (calendarApi) {
        const start = calendarApi.view.activeStart.toISOString();
        const end = calendarApi.view.activeEnd.toISOString();
        loadTasks(start, end);
      }
    } else if (operationError && operationType === 'move') {
      message.error(`Erreur lors du déplacement de la tâche: ${operationError}`);
      dispatch(resetTaskOperation());
    }
  }, [operationType, operationSuccess, operationError, dispatch, calendarApi]);

  const loadTasks = (start, end) => {
    const apiParams = {
      ...filters,
      start,
      end
    };
    
    // Supprimer les valeurs 'all' pour l'API
    if (apiParams.status === 'all') delete apiParams.status;
    if (apiParams.type === 'all') delete apiParams.type;
    if (apiParams.entity_type === 'all') delete apiParams.entity_type;
    
    dispatch(getCalendarTasks(apiParams));
  };

  const handleEventClick = (info) => {
    const taskId = info.event.id;
    navigate(`/tasks/${taskId}`);
  };

  const handleDateClick = (info) => {
    const selectedDate = moment(info.dateStr);
    const today = moment().startOf('day');
    
    // Vérifier si la date sélectionnée est dans le passé
    if (selectedDate.isBefore(today)) {
      message.warning("Vous ne pouvez pas créer de tâche dans le passé");
      return; // Arrêter l'exécution si la date est passée
    }
    
    // Continuer avec la date valide
    localStorage.setItem('newTaskDate', info.dateStr);
    navigate('/tasks/create');
  };

  const handleViewChange = (view) => {
    setCalendarView(view);
    if (calendarApi) {
      calendarApi.changeView(view);
    }
  };

  const handleEventDrop = (info) => {
    const { event } = info;
    
    // Préparer les données pour l'API
    const id = event.id;
    const newStart = event.start.toISOString();
    const newEnd = event.end ? event.end.toISOString() : null;
    const allDay = event.allDay;
    
    // Utiliser unwrap() pour gérer la promesse correctement
    dispatch(moveCalendarTask({
      id,
      start: newStart,
      end: newEnd,
      allDay
    }))
    .unwrap()
    .then(() => {
      message.success('Tâche déplacée avec succès');
      
      // Actualiser immédiatement les événements du calendrier
      if (calendarApi) {
        const start = calendarApi.view.activeStart.toISOString();
        const end = calendarApi.view.activeEnd.toISOString();
        loadTasks(start, end);
      }
    })
    .catch(error => {
      console.error("Erreur lors du déplacement:", error);
      message.error("Échec du déplacement de la tâche");
      
      // Annuler le déplacement visuel si l'API échoue
      info.revert();
    });
  };

  const renderEventContent = (eventInfo) => {
    const type = eventInfo.event.extendedProps.type;
    const status = eventInfo.event.extendedProps.status;
    const entity = eventInfo.event.extendedProps.entity;
    
    let statusIcon = '';
    if (status === 'completed') statusIcon = '✓ ';
    if (status === 'in_progress') statusIcon = '⏳ ';
    if (status === 'not_started') statusIcon = '⭕ ';
    if (status === 'waiting') statusIcon = '⏸️ ';
    if (status === 'deferred') statusIcon = '⏭️ ';
    
    let typeIcon = '';
    if (type === 'call') typeIcon = '📞 ';
    if (type === 'meeting') typeIcon = '👥 ';
    if (type === 'email_journal') typeIcon = '📧 ';
    if (type === 'note') typeIcon = '📝 ';
    if (type === 'todo') typeIcon = '✓ ';
    
    // Ajout d'informations sur l'entité si disponible
    const entityInfo = entity ? `[${entity.type}: ${entity.name}] ` : '';
    
    return (
      <>
        <b>{eventInfo.timeText && `${eventInfo.timeText} · `}</b>
        <i>{statusIcon}{typeIcon}{entityInfo}{eventInfo.event.title}</i>
      </>
    );
  };

  const transformEvents = (tasks) => {
    if (!tasks) return [];
    
    return tasks.map(task => {
      // Déterminer la couleur en fonction du type ou du statut
      let backgroundColor;
      switch (task.type) {
        case 'call': backgroundColor = '#1890ff'; break; // bleu
        case 'meeting': backgroundColor = '#722ed1'; break; // violet
        case 'email_journal': backgroundColor = '#13c2c2'; break; // cyan
        case 'note': backgroundColor = '#52c41a'; break; // vert
        case 'todo': backgroundColor = '#fa8c16'; break; // orange
        default: backgroundColor = '#1890ff';
      }
      
      // Rendre les tâches complétées plus transparentes
      if (task.status === 'completed') {
        backgroundColor = backgroundColor + '80'; // Ajoute 50% d'opacité
      }
      
      return {
        ...task,
        backgroundColor,
        borderColor: backgroundColor,
        start: moment.utc(task.start).format('YYYY-MM-DD[T]HH:mm:ss'),
        end: task.end ? moment.utc(task.end).format('YYYY-MM-DD[T]HH:mm:ss') : null
      };
    });
  };

  const viewOptions = [
    { key: 'dayGridMonth', label: 'Mois' },
    { key: 'timeGridWeek', label: 'Semaine' },
    { key: 'timeGridDay', label: 'Jour' },
    { key: 'listWeek', label: 'Liste' }
  ];

  const statusOptions = [
    { key: 'all', label: 'Tous les statuts' },
    { key: 'not_started', label: 'Non commencés' },
    { key: 'in_progress', label: 'En cours' },
    { key: 'completed', label: 'Terminés' },
    { key: 'waiting', label: 'En attente' },
    { key: 'deferred', label: 'Reportés' }
  ];

  const typeOptions = [
    { key: 'all', label: 'Tous les types' },
    { key: 'call', label: 'Appels' },
    { key: 'meeting', label: 'Réunions' },
    { key: 'email_journal', label: 'Emails' },
    { key: 'note', label: 'Notes' },
    { key: 'todo', label: 'À faire' }
  ];

  const entityTypeOptions = [
    { key: 'all', label: 'Toutes les entités' },
    { key: 'invite', label: 'Invités' },
    { key: 'prospect', label: 'Prospects' },
    { key: 'investor', label: 'Investisseurs' },
    { key: 'projet', label: 'Projets' }
  ];

  if (error) {
    return (
      <div className="crm-container" style={{ padding: '20px' }}>
        <Alert
          message="Erreur"
          description={`Impossible de charger les tâches du calendrier: ${error}`}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="crm-container">
      {/* En-tête avec le style CRM */}
      <div className="crm-header">
        <div className="crm-lead-info">
          <div className="crm-avatar">
            <Avatar icon={<CalendarOutlined />} size={42} style={{ backgroundColor: '#1890ff' }} />
          </div>
          <div className="crm-title">
            <div className="crm-lead-label">
              Calendrier des tâches
            </div>
            <div className="crm-lead-actions">
              <span className="crm-count">
                {calendarTasks?.length || 0} tâche(s) affichée(s)
              </span>
            </div>
          </div>
        </div>

        <div className="crm-header-actions">
          <Button 
            className="crm-btn" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/tasks')}
          >
            Liste des tâches
          </Button>
          
          
        </div>
      </div>

      {/* Section des filtres */}
      <div className="crm-meta-info">
        <div className="crm-meta-item">
          <div className="crm-meta-label">VUE:</div>
          <div className="crm-meta-value">
            <Select 
              value={calendarView} 
              onChange={handleViewChange} 
              style={{ width: 120 }}
              size="small"
            >
              {viewOptions.map(option => (
                <Option key={option.key} value={option.key}>{option.label}</Option>
              ))}
            </Select>
          </div>
        </div>
        
        <div className="crm-meta-item">
          <div className="crm-meta-label">STATUT:</div>
          <div className="crm-meta-value">
            <Select 
              value={filters.status} 
              onChange={value => setFilters({...filters, status: value})}
              style={{ width: 140 }}
              size="small"
            >
              {statusOptions.map(option => (
                <Option key={option.key} value={option.key}>{option.label}</Option>
              ))}
            </Select>
          </div>
        </div>
        
        <div className="crm-meta-item">
          <div className="crm-meta-label">TYPE:</div>
          <div className="crm-meta-value">
            <Select 
              value={filters.type} 
              onChange={value => setFilters({...filters, type: value})}
              style={{ width: 130 }}
              size="small"
            >
              {typeOptions.map(option => (
                <Option key={option.key} value={option.key}>{option.label}</Option>
              ))}
            </Select>
          </div>
        </div>
        
        <div className="crm-meta-item">
          <div className="crm-meta-label">ENTITÉ:</div>
          <div className="crm-meta-value">
            <Select 
              value={filters.entity_type} 
              onChange={value => setFilters({...filters, entity_type: value})}
              style={{ width: 150 }}
              size="small"
            >
              {entityTypeOptions.map(option => (
                <Option key={option.key} value={option.key}>{option.label}</Option>
              ))}
            </Select>
          </div>
        </div>
        
        {/* <div className="crm-meta-item">
          <div className="crm-meta-label">ACTIONS:</div>
          <div className="crm-meta-value">
            <Button 
              icon={<ReloadOutlined />} 
              size="small" 
              onClick={() => {
                setFilters({
                  status: 'all',
                  type: 'all',
                  entity_type: 'all',
                  assignee_id: undefined
                });
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </div> */}
      </div>

      {/* Contenu principal avec le calendrier */}
      <div className="crm-content-tabs">
        <Card bordered={false}>
          <Row gutter={16}>
            <Col xs={24}>
              {(loading || operationLoading) && (
                <div className="calendar-loading">
                  <Spin tip="Chargement des tâches..." />
                </div>
              )}
              
              <div className="calendar-container">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, momentTimezonePlugin]}
                  initialView={calendarView}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                  }}
                  dayCellClassNames={(arg) => {
                    // Ajouter une classe pour les jours passés
                    return moment(arg.date).isBefore(moment().startOf('day')) ? 'past-day' : '';
                  }}
                  events={transformEvents(calendarTasks) || []}
                  editable={true}
                  droppable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  timeZone="UTC"
                  eventContent={renderEventContent}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  eventDrop={handleEventDrop}
                  locale="fr" // Pour la localisation en français
                  firstDay={1} // Commencer la semaine le lundi
                  buttonText={{
                    today: "Aujourd'hui",
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    list: 'Liste'
                  }}
                  height="auto"
                  ref={ref => {
                    if (ref) {
                      setCalendarApi(ref.getApi());
                    }
                  }}
                />
              </div>
            </Col>
          </Row>
        </Card>
        
        {/* Légende du calendrier
        <Card title="Légende" className="calendar-legend-card" size="small" style={{ marginTop: '20px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="legend-item">
                <Badge color="#1890ff" text="Appel" />
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="legend-item">
                <Badge color="#722ed1" text="Réunion" />
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="legend-item">
                <Badge color="#13c2c2" text="Email" />
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="legend-item">
                <Badge color="#52c41a" text="Note" />
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="legend-item">
                <Badge color="#fa8c16" text="À faire" />
              </div>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <div className="legend-item">
                <Badge color="#00000080" text="Terminé (transparence)" />
              </div>
            </Col>
          </Row>
        </Card> */}
      </div>

      {/* CSS intégré pour les styles CRM */}
      <style jsx>{`
        .crm-container {
          background-color: #f0f2f5;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          animation: fadeIn 0.3s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .crm-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background-color: white;
          border-bottom: 1px solid #e8e8e8;
        }
        
        .crm-lead-info {
          display: flex;
          align-items: center;
        }
        
        .crm-avatar {
          margin-right: 12px;
        }
        
        .crm-title {
          display: flex;
          flex-direction: column;
        }
        
        .crm-lead-label {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .crm-lead-actions {
          display: flex;
          font-size: 13px;
          color: #888;
        }
        
        .crm-link {
          color: #1890ff;
          margin-right: 16px;
        }
        
        .crm-header-actions {
          display: flex;
          gap: 8px;
        }
        
        .crm-btn {
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        
        .crm-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .crm-meta-info {
          display: flex;
          background-color: white;
          padding: 10px 20px;
          border-bottom: 1px solid #e8e8e8;
          flex-wrap: wrap;
        }
        
        .crm-meta-item {
          margin-right: 20px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .crm-meta-label {
          color: #999;
          font-size: 12px;
          margin-right: 8px;
        }
        
        .crm-meta-value {
          color: #333;
          font-size: 12px;
          display: flex;
          align-items: center;
        }
        
        .crm-content-tabs {
          background-color: white;
          padding: 20px;
        }
        
        .calendar-container {
          margin-top: 16px;
          min-height: 650px;
        }
        
        .calendar-loading {
          display: flex;
          justify-content: center;
          padding: 16px 0;
        }
        
        /* Style pour les événements du calendrier */
        .fc-event {
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        
        .fc-event:hover {
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 5 !important;
        }
        
        /* Style pour les jours passés */
        .past-day {
          background-color: #f5f5f5 !important;
          color: #bfbfbf !important;
        }
        
        /* Style pour la légende */
        .legend-item {
          margin-bottom: 8px;
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .crm-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .crm-header-actions {
            margin-top: 16px;
            width: 100%;
          }
          
          .crm-meta-info {
            flex-direction: column;
          }
          
          .crm-meta-item {
            margin-bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default TaskCalendar;