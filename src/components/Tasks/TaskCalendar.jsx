import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, Button, Select, Space, message, Alert, Spin, Row, Col, Dropdown, Menu, 
  Avatar, Typography, Badge, Statistic, Tooltip, Empty, Grid
} from 'antd';
import { 
  PlusOutlined, SettingOutlined, CalendarOutlined, FilterOutlined, 
  ReloadOutlined, ArrowLeftOutlined, UserOutlined, InfoCircleOutlined,
  ThunderboltOutlined, ClockCircleOutlined, CheckCircleOutlined,
  ExclamationCircleOutlined, SyncOutlined, FireOutlined, EyeOutlined,
  ArrowUpOutlined, ArrowDownOutlined
} from '@ant-design/icons';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCalendarTasks, moveCalendarTask, resetTaskOperation } from '../../features/taskSlice';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';
import 'moment/locale/fr';

const { Option } = Select;
const { Text, Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// Composant de statistique animée
const AnimatedStatCard = ({ icon, title, value, color, loading, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && value > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      style={{ height: '100%' }}
    >
      <Card 
        className="stat-card-modern"
        style={{
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
          border: `1px solid ${color}30`,
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}
        bodyStyle={{ padding: '20px' }}
      >
        <div className="stat-card-content">
          <div className="stat-header">
            <motion.div 
              className="stat-icon"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                boxShadow: `0 4px 16px ${color}40`
              }}
            >
              {loading ? <SyncOutlined spin /> : icon}
            </motion.div>
          </div>

          <div className="stat-body">
            <Text type="secondary" style={{ fontSize: '12px', fontWeight: 500 }}>
              {title}
            </Text>
            
            <Title level={4} style={{ 
              margin: '4px 0 0 0', 
              color: color,
              fontWeight: 700,
              fontSize: '20px'
            }}>
              {loading ? (
                <SyncOutlined spin />
              ) : (
                <motion.span
                  key={displayValue}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {displayValue}
                </motion.span>
              )}
            </Title>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const TaskCalendar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const screens = useBreakpoint();
  
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
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Calculer les statistiques des tâches
  const getTaskStats = () => {
    if (!calendarTasks || !Array.isArray(calendarTasks)) {
      return { total: 0, completed: 0, inProgress: 0, notStarted: 0, overdue: 0 };
    }

    const total = calendarTasks.length;
    const completed = calendarTasks.filter(t => t.status === 'completed').length;
    const inProgress = calendarTasks.filter(t => t.status === 'in_progress').length;
    const notStarted = calendarTasks.filter(t => t.status === 'not_started').length;
    const overdue = calendarTasks.filter(t => 
      t.status !== 'completed' && moment(t.start).isBefore(moment(), 'day')
    ).length;

    return { total, completed, inProgress, notStarted, overdue };
  };

  const stats = getTaskStats();

  // Fonction pour charger les tâches
  const loadTasks = useCallback((start, end) => {
    console.log('Loading tasks for:', { start, end, filters });
    
    const apiParams = {
      ...filters,
      start,
      end
    };
    
    // Nettoyer les filtres "all"
    if (apiParams.status === 'all') delete apiParams.status;
    if (apiParams.type === 'all') delete apiParams.type;
    if (apiParams.entity_type === 'all') delete apiParams.entity_type;
    
    dispatch(getCalendarTasks(apiParams));
  }, [dispatch, filters]);

  // Chargement initial et lors des changements de filtres
  useEffect(() => {
    if (calendarApi && dateRange.start && dateRange.end) {
      loadTasks(dateRange.start, dateRange.end);
    }
  }, [loadTasks, calendarApi, dateRange.start, dateRange.end]);

  // Gestion des opérations de déplacement
  useEffect(() => {
    if (operationSuccess && operationType === 'move') {
      message.success('Tâche déplacée avec succès');
      dispatch(resetTaskOperation());
      
      if (calendarApi && dateRange.start && dateRange.end) {
        loadTasks(dateRange.start, dateRange.end);
      }
    } else if (operationError && operationType === 'move') {
      message.error(`Erreur lors du déplacement de la tâche: ${operationError}`);
      dispatch(resetTaskOperation());
    }
  }, [operationType, operationSuccess, operationError, dispatch, loadTasks, calendarApi, dateRange]);

  const handleEventClick = (info) => {
    const taskId = info.event.id;
    navigate(`/tasks/${taskId}`);
  };

  const handleDateClick = (info) => {
    const selectedDate = moment(info.dateStr);
    const today = moment().startOf('day');
    
    if (selectedDate.isBefore(today)) {
      message.warning("Vous ne pouvez pas créer de tâche dans le passé");
      return;
    }
    
    localStorage.setItem('newTaskDate', info.dateStr);
    navigate('/tasks/create');
  };

  // Fonction corrigée pour changer la vue
  const handleViewChange = (view) => {
    console.log('Changing view to:', view);
    setCalendarView(view);
    
    // Utiliser setTimeout pour s'assurer que le calendrier est rendu
    setTimeout(() => {
      if (calendarApi) {
        calendarApi.changeView(view);
      }
    }, 0);
  };

  const handleEventDrop = (info) => {
    const { event } = info;
    
    const id = event.id;
    const newStart = event.start.toISOString();
    const newEnd = event.end ? event.end.toISOString() : null;
    const allDay = event.allDay;
    
    dispatch(moveCalendarTask({
      id,
      start: newStart,
      end: newEnd,
      allDay
    }))
    .unwrap()
    .then(() => {
      message.success('Tâche déplacée avec succès');
    })
    .catch(error => {
      console.error("Erreur lors du déplacement:", error);
      message.error("Échec du déplacement de la tâche");
      info.revert();
    });
  };

  // Gestionnaire pour les changements de filtres
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value
    }));
  }, []);

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
    if (type === 'todo') typeIcon = '✅ ';
    
    const entityInfo = entity ? `[${entity.type}: ${entity.name}] ` : '';
    
    return (
      <div style={{ fontSize: '11px', lineHeight: '1.2' }}>
        <b>{eventInfo.timeText && `${eventInfo.timeText} · `}</b>
        <span>{statusIcon}{typeIcon}{entityInfo}{eventInfo.event.title}</span>
      </div>
    );
  };

  const transformEvents = (tasks) => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    return tasks.map(task => {
      let backgroundColor;
      switch (task.type) {
        case 'call': backgroundColor = '#1890ff'; break;
        case 'meeting': backgroundColor = '#722ed1'; break;
        case 'email_journal': backgroundColor = '#13c2c2'; break;
        case 'note': backgroundColor = '#52c41a'; break;
        case 'todo': backgroundColor = '#fa8c16'; break;
        default: backgroundColor = '#1890ff';
      }
      
      if (task.status === 'completed') {
        backgroundColor = backgroundColor + '80';
      }
      
      // Améliorer le formatage des dates
      const startDate = moment(task.start);
      const endDate = task.end ? moment(task.end) : null;
      
      return {
        id: task.id,
        title: task.title || task.name || 'Tâche',
        start: startDate.format('YYYY-MM-DD[T]HH:mm:ss'),
        end: endDate ? endDate.format('YYYY-MM-DD[T]HH:mm:ss') : null,
        allDay: task.allDay || false,
        backgroundColor,
        borderColor: backgroundColor,
        textColor: '#fff',
        extendedProps: {
          type: task.type,
          status: task.status,
          entity: task.entity,
          description: task.description
        }
      };
    });
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  if (error) {
    return (
      <div className="dashboard-container-modern">
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
    <div className="dashboard-container-modern">
      {/* En-tête moderne */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="dashboard-header"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          className="header-background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
          animate={{
            backgroundPosition: ['0px 0px', '60px 60px']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <Row justify="space-between" align="middle" style={{ position: 'relative', zIndex: 1 }}>
          <Col>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 700 }}>
                <CalendarOutlined style={{ marginRight: '16px' }} />
                Calendrier des Tâches
              </Title>
              <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', margin: '8px 0 0 0' }}>
                Planification et suivi des tâches en vue calendrier
              </Paragraph>
            </motion.div>
          </Col>
          <Col>
            <Space>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="large"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    borderRadius: '12px',
                    fontWeight: 600
                  }}
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => navigate('/tasks')}
                >
                  Liste des tâches
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                
                
              </motion.div>
            </Space>
          </Col>
        </Row>
      </motion.div>

      {/* Statistiques des tâches */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CalendarOutlined />}
            title="Total Tâches"
            value={stats.total}
            color="#1890ff"
            loading={loading}
            delay={0}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<CheckCircleOutlined />}
            title="Terminées"
            value={stats.completed}
            color="#52c41a"
            loading={loading}
            delay={1}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<SyncOutlined />}
            title="En Cours"
            value={stats.inProgress}
            color="#1890ff"
            loading={loading}
            delay={2}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ClockCircleOutlined />}
            title="Non Commencées"
            value={stats.notStarted}
            color="#faad14"
            loading={loading}
            delay={3}
          />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <AnimatedStatCard
            icon={<ExclamationCircleOutlined />}
            title="En Retard"
            value={stats.overdue}
            color="#ff4d4f"
            loading={loading}
            delay={4}
          />
        </Col>
      </Row>

      {/* Filtres modernes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card 
          className="filters-card-modern"
          style={{
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginBottom: '24px'
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} lg={4}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ color: '#666', fontSize: '12px' }}>VUE</Text>
              </div>
              <Select 
                value={calendarView} 
                onChange={handleViewChange} 
                style={{ width: '100%' }}
                size="large"
                className="modern-select"
              >
                <Option value="dayGridMonth">
                  <Space>
                    <CalendarOutlined />
                    Mois
                  </Space>
                </Option>
                <Option value="timeGridWeek">
                  <Space>
                    <CalendarOutlined />
                    Semaine
                  </Space>
                </Option>
                <Option value="timeGridDay">
                  <Space>
                    <CalendarOutlined />
                    Jour
                  </Space>
                </Option>
                <Option value="listWeek">
                  <Space>
                    <CalendarOutlined />
                    Liste
                  </Space>
                </Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={8} lg={5}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ color: '#666', fontSize: '12px' }}>STATUT</Text>
              </div>
              <Select 
                value={filters.status} 
                onChange={value => handleFilterChange('status', value)}
                style={{ width: '100%' }}
                size="large"
                className="modern-select"
              >
                <Option value="all">Tous les statuts</Option>
                <Option value="not_started">Non commencés</Option>
                <Option value="in_progress">En cours</Option>
                <Option value="completed">Terminés</Option>
                <Option value="waiting">En attente</Option>
                <Option value="deferred">Reportés</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={8} lg={5}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ color: '#666', fontSize: '12px' }}>TYPE</Text>
              </div>
              <Select 
                value={filters.type} 
                onChange={value => handleFilterChange('type', value)}
                style={{ width: '100%' }}
                size="large"
                className="modern-select"
              >
                <Option value="all">Tous les types</Option>
                <Option value="call">Appels</Option>
                <Option value="meeting">Réunions</Option>
                <Option value="email_journal">Emails</Option>
                <Option value="note">Notes</Option>
                <Option value="todo">À faire</Option>
              </Select>
            </Col>

            <Col xs={24} sm={8} lg={5}>
              <div style={{ marginBottom: '8px' }}>
                <Text strong style={{ color: '#666', fontSize: '12px' }}>ACTIONS</Text>
              </div>
              <Space>
                <Button 
                  icon={<ReloadOutlined />}
                  size="large"
                  className="modern-btn"
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
              </Space>
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* Calendrier principal */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card 
          className="calendar-card-modern"
          style={{
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden'
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <AnimatePresence mode="wait">
            {(loading || operationLoading) ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '500px',
                  flexDirection: 'column'
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  style={{ marginBottom: '16px' }}
                >
                  <SyncOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                </motion.div>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                  Chargement du calendrier...
                </Text>
              </motion.div>
            ) : (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="calendar-container"
              >
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  initialView={calendarView}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                  }}
                  views={{
                    dayGridMonth: {
                      titleFormat: { year: 'numeric', month: 'long' }
                    },
                    timeGridWeek: {
                      titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
                    },
                    timeGridDay: {
                      titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
                    },
                    listWeek: {
                      titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
                    }
                  }}
                  dayCellClassNames={(arg) => {
                    return moment(arg.date).isBefore(moment().startOf('day')) ? 'past-day' : '';
                  }}
                  events={transformEvents(calendarTasks) || []}
                  editable={true}
                  droppable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  eventContent={renderEventContent}
                  eventClick={handleEventClick}
                  dateClick={handleDateClick}
                  eventDrop={handleEventDrop}
                  locale="fr"
                  firstDay={1}
                  buttonText={{
                    today: "Aujourd'hui",
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    list: 'Liste'
                  }}
                  height="auto"
                  slotMinTime="06:00:00"
                  slotMaxTime="22:00:00"
                  businessHours={{
                    daysOfWeek: [1, 2, 3, 4, 5],
                    startTime: '08:00',
                    endTime: '18:00',
                  }}
                  datesSet={(dateInfo) => {
                    const newStart = dateInfo.start.toISOString();
                    const newEnd = dateInfo.end.toISOString();
                    
                    if (dateRange.start !== newStart || dateRange.end !== newEnd) {
                      setDateRange({ start: newStart, end: newEnd });
                    }
                  }}
                  viewDidMount={(info) => {
                    console.log('View mounted:', info.view.type);
                    setCalendarView(info.view.type);
                  }}
                  ref={ref => {
                    if (ref && !calendarApi) {
                      const api = ref.getApi();
                      setCalendarApi(api);
                      console.log('Calendar API set:', api);
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Légende */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        style={{ marginTop: '24px' }}
      >
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <Text strong>Légende des couleurs</Text>
            </div>
          }
          className="legend-card-modern"
          style={{
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          size="small"
        >
          <Row gutter={[16, 8]}>
            <Col xs={12} sm={8} md={4}>
              <Badge color="#1890ff" text="Appel" />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Badge color="#722ed1" text="Réunion" />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Badge color="#13c2c2" text="Email" />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Badge color="#52c41a" text="Note" />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Badge color="#fa8c16" text="À faire" />
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Badge color="#00000080" text="Terminé" />
            </Col>
          </Row>
        </Card>
      </motion.div>

      {/* CSS intégré */}
      <style jsx>{`
        .dashboard-container-modern {
          padding: 24px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .stat-card-modern {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card-modern:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .stat-card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .stat-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .filters-card-modern,
        .calendar-card-modern,
        .legend-card-modern {
          transition: all 0.3s ease;
        }

        .filters-card-modern:hover,
        .calendar-card-modern:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
        }

        .modern-select .ant-select-selector {
          border-radius: 8px !important;
          border: 1px solid #d9d9d9 !important;
          transition: all 0.3s ease !important;
        }

        .modern-select.ant-select-focused .ant-select-selector {
          border-color: #1890ff !important;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        }

        .modern-btn {
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .modern-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .calendar-container {
          min-height: 650px;
        }

        /* FullCalendar Custom Styles */
        .fc {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        }

        .fc-event {
          border-radius: 6px !important;
          font-size: 11px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          font-weight: 500 !important;
          margin: 1px !important;
        }

        .fc-event:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          z-index: 5 !important;
        }

        .fc-toolbar {
          margin-bottom: 20px !important;
          padding: 0 !important;
        }

        .fc-toolbar-title {
          font-size: 24px !important;
          font-weight: 700 !important;
          color: #333 !important;
        }

        .fc-button-primary {
          background: #1890ff !important;
          border-color: #1890ff !important;
          border-radius: 6px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
        }

        .fc-button-primary:hover {
          background: #40a9ff !important;
          border-color: #40a9ff !important;
          transform: translateY(-1px) !important;
        }

        .fc-button-primary:not(:disabled).fc-button-active {
          background: #096dd9 !important;
          border-color: #096dd9 !important;
        }

        .fc-daygrid-day {
          transition: background-color 0.2s ease !important;
        }

        .fc-daygrid-day:hover {
          background-color: #f0f2ff !important;
        }

        .past-day {
          background-color: #f5f5f5 !important;
          color: #bfbfbf !important;
        }

        .fc-day-today {
          background-color: #e6f7ff !important;
        }

        .fc-timegrid-slot {
          height: 40px !important;
        }

        .fc-list-event:hover {
          background-color: #f0f2ff !important;
        }

        /* Amélioration des vues de temps */
        .fc-timegrid-axis {
          color: #666 !important;
          font-size: 11px !important;
        }

        .fc-timegrid-slot-label {
          color: #666 !important;
          font-size: 11px !important;
        }

        .fc-col-header-cell {
          background-color: #fafafa !important;
          border-bottom: 2px solid #1890ff !important;
          font-weight: 600 !important;
        }

        .fc-scrollgrid-section-header {
          background-color: #fafafa !important;
        }

        /* Vue liste améliorée */
        .fc-list-day-side-text {
          color: #1890ff !important;
          font-weight: 600 !important;
        }

        .fc-list-day-text {
          color: #333 !important;
          font-weight: 600 !important;
        }

        .fc-list-event-title {
          color: #333 !important;
          font-weight: 500 !important;
        }

        .fc-list-event-time {
          color: #1890ff !important;
          font-weight: 500 !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .dashboard-container-modern {
            padding: 16px;
          }
          
          .dashboard-header {
            padding: 20px !important;
            text-align: center;
          }
          
          .calendar-container {
            min-height: 500px;
          }

          .fc-toolbar {
            flex-direction: column !important;
            gap: 10px !important;
          }

          .fc-toolbar-chunk {
            display: flex !important;
            justify-content: center !important;
          }

          .fc-button-primary {
            font-size: 10px !important;
            padding: 3px 6px !important;
          }

          .fc-event {
            font-size: 9px !important;
          }
        }

        @media (max-width: 576px) {
          .dashboard-header {
            border-radius: 12px !important;
          }

          .fc-toolbar-title {
            font-size: 18px !important;
          }
        }

        /* Animation pour les événements */
        @keyframes eventPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }

        .fc-event.fc-event-today {
          animation: eventPulse 2s infinite;
        }

        /* Effet de brillance pour les cartes */
        .stat-card-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s;
        }

        .stat-card-modern:hover::before {
          left: 100%;
        }

        /* Amélioration de l'affichage des heures d'affaires */
        .fc-non-business {
          background-color: #f8f8f8 !important;
        }

        .fc-business-hours {
          background-color: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default TaskCalendar;