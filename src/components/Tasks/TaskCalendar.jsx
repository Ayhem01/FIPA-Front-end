import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Space, message, Alert, Spin, Row, Col, Dropdown, Menu } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
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

const TaskCalendar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: calendarTasks, loading, error } = useSelector(state => state.tasks.calendarTasks);
  const { type: operationType, loading: operationLoading, success: operationSuccess, error: operationError } = useSelector(state => state.tasks.taskOperation);
  
  const [calendarView, setCalendarView] = useState('dayGridMonth');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
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
    
    dispatch(getCalendarTasks(apiParams));
  };

  const handleEventClick = (info) => {
    const taskId = info.event.id;
    navigate(`/tasks/details/${taskId}`);
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
    
    return (
      <>
        <b>{eventInfo.timeText && `${eventInfo.timeText} · `}</b>
        <i>{statusIcon}{typeIcon}{eventInfo.event.title}</i>
      </>
    );
  };

  const settingsMenu = (
    <Menu>
      <Menu.SubMenu title="Vue">
        <Menu.Item key="month" onClick={() => handleViewChange('dayGridMonth')}>Mois</Menu.Item>
        <Menu.Item key="week" onClick={() => handleViewChange('timeGridWeek')}>Semaine</Menu.Item>
        <Menu.Item key="day" onClick={() => handleViewChange('timeGridDay')}>Jour</Menu.Item>
        <Menu.Item key="list" onClick={() => handleViewChange('listWeek')}>Liste</Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu title="Filtrer par statut">
        <Menu.Item key="all-status" onClick={() => setFilters({...filters, status: 'all'})}>
          Tous les statuts
        </Menu.Item>
        <Menu.Item key="not_started" onClick={() => setFilters({...filters, status: 'not_started'})}>
          Non commencés
        </Menu.Item>
        <Menu.Item key="in_progress" onClick={() => setFilters({...filters, status: 'in_progress'})}>
          En cours
        </Menu.Item>
        <Menu.Item key="completed" onClick={() => setFilters({...filters, status: 'completed'})}>
          Terminés
        </Menu.Item>
        <Menu.Item key="waiting" onClick={() => setFilters({...filters, status: 'waiting'})}>
          En attente
        </Menu.Item>
        <Menu.Item key="deferred" onClick={() => setFilters({...filters, status: 'deferred'})}>
          Reportés
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu title="Filtrer par type">
        <Menu.Item key="all-types" onClick={() => setFilters({...filters, type: 'all'})}>
          Tous les types
        </Menu.Item>
        <Menu.Item key="call" onClick={() => setFilters({...filters, type: 'call'})}>
          Appels
        </Menu.Item>
        <Menu.Item key="meeting" onClick={() => setFilters({...filters, type: 'meeting'})}>
          Réunions
        </Menu.Item>
        <Menu.Item key="email_journal" onClick={() => setFilters({...filters, type: 'email_journal'})}>
          Emails
        </Menu.Item>
        <Menu.Item key="note" onClick={() => setFilters({...filters, type: 'note'})}>
          Notes
        </Menu.Item>
        <Menu.Item key="todo" onClick={() => setFilters({...filters, type: 'todo'})}>
          À faire
        </Menu.Item>
      </Menu.SubMenu>
    </Menu>
  );
  const transformEvents = (tasks) => {
    if (!tasks) return [];
    
    return tasks.map(task => {
      // Créer une copie pour ne pas modifier l'original
      const event = { ...task };
      
      // S'assurer que les dates sont correctement interprétées
      // en spécifiant explicitement qu'elles sont en UTC
      if (event.start) {
        event.start = moment.utc(event.start).format('YYYY-MM-DD[T]HH:mm:ss');
      }
      
      if (event.end) {
        event.end = moment.utc(event.end).format('YYYY-MM-DD[T]HH:mm:ss');
      }
      
      return event;
    });
  };

  if (error) {
    return (
      <div className="calendar-container" style={{ padding: '20px' }}>
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
    <div className="calendar-container" style={{ padding: '20px' }}>
      <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Calendrier des tâches</h2>
        <Space>
          
          
          
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/tasks/create')}
          >
            Nouvelle tâche
          </Button>
        </Space>
      </div>

      <Card>
        <Row gutter={16}>
          <Col xs={24} style={{ marginBottom: 16 }}>
            {(loading || operationLoading) && <Spin />}
            
          </Col>
          
          <Col xs={24}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin, momentTimezonePlugin]}
              initialView={calendarView}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
              }}
              validRange={{
                start: moment().startOf('day').format('YYYY-MM-DD') // Aujourd'hui
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
          </Col>
        </Row>
      </Card>
      
    </div>
  );
};

export default TaskCalendar;