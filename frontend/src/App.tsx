
import "./Style/Style.css"

import Game from "./Game/Game";
import UI from "./Game/Windows/UI"
import { RootState } from "./Game/Store";
import { useSelector } from "react-redux";

function App() {
  const hasGameStarted = useSelector<RootState>(state => state.game.hasStarted)

  return (
    <div className="app">
      <UI />

      {hasGameStarted && <Game />}
    </div>
  );
}

export default App;
