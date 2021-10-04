
//const io = require("socket.io-client").io("http://localhost:3000");
import "./App.css"

import Game from "./Game/Game";



function App() {
  return (
    <div className="app">
      <Game />
    </div>
  );
}

export default App;
