import React from "react";
import { Result, Button } from "antd";
import { useNavigate } from "react-router-dom";

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="Accès refusé. Vous n'avez pas les droits pour accéder à cette page."
      extra={<Button type="primary" onClick={() => navigate('/')}>Retour</Button>}
    />
  );
}