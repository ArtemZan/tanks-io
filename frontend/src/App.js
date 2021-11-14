
import "./Style/Style.css"

import Game from "./Game/Game";
import { GameStateProvider } from "./Game/State";



function App() {
  return (
    <div className="app">
      <GameStateProvider>
        <Game />
      </GameStateProvider>
    </div>
  );
}

export default App;
