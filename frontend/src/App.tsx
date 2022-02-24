
import "./Style/Style.css"

import Game from "./Game/Components/Game";
import UI from "./Game/Windows/UI"
import { RootState } from "./Game/Store";
import { useSelector } from "react-redux";

function App() {
  const hasGameStarted = useSelector<RootState>(state => state.game)

  return (
    <div className="app">
      <UI />

      {hasGameStarted && <Game />}
    </div>
  );
}

export default App;
