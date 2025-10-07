import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';
import { motion } from 'framer-motion';

const AnimatedStatCard = ({ 
  icon, 
  title, 
  value, 
  color = '#1890ff', 
  loading = false, 
  delay = 0,
  prefix,
  suffix,
  precision = 0,
  className = '',
  style = {},
  ...props 
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        delay: delay * 0.1,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.5,
        delay: (delay * 0.1) + 0.2,
        ease: "easeOut"
      }
    }
  };

  if (loading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card
          className={`stat-card-modern ${className}`}
          style={{
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid #f0f0f0',
            ...style
          }}
        >
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
    >
      <Card
        className={`stat-card-modern ${className}`}
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          ...style
        }}
        {...props}
      >
        <div className="stat-card-content">
          <div className="stat-header">
            <motion.div
              variants={iconVariants}
              className="stat-icon"
              style={{
                fontSize: '24px',
                color: color,
                backgroundColor: `${color}10`,
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {icon}
            </motion.div>
          </div>
          
          <div className="stat-body">
            <Statistic
              title={title}
              value={value}
              precision={precision}
              prefix={prefix}
              suffix={suffix}
              valueStyle={{
                color: color,
                fontSize: '24px',
                fontWeight: 'bold'
              }}
              titleStyle={{
                color: '#8c8c8c',
                fontSize: '14px',
                fontWeight: '500'
              }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default AnimatedStatCard;