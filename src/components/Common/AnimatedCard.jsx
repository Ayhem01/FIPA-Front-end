import React from 'react';
import { Card } from 'antd';
import { motion } from 'framer-motion';

const AnimatedCard = ({ 
  children, 
  title, 
  extra, 
  delay = 0, 
  className = '', 
  style = {},
  ...props 
}) => {
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
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      <Card
        title={title}
        extra={extra}
        className={`animated-card ${className}`}
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          border: '1px solid #f0f0f0',
          ...style
        }}
        {...props}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default AnimatedCard;