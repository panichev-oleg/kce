import React from "react";
import { styled } from "styled-components";
import "./App.css";
import { ScheduleTable } from "./components/ScheduleTable";

const Title = styled.h2``;

function App() {
  return (
    <div className="App">
      <Title>KCE</Title>
      <ScheduleTable />
    </div>
  );
}

export default App;
