import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Game from './screens/game.jsx';
import LevelBuilder from "./screens/builder.jsx";

function App() {
  const [menuState, setMenuState] = useState('main');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [showNeuralNetwork, setShowNeuralNetwork] = useState(false);

  const navigate = useNavigate();

  const levels = [
    'LEVEL 1-1',
    'LEVEL 1-2',
    'LEVEL 1-3',
    'LEVEL 1-4',
    'LEVEL 1-5',
    'LEVEL 1-6',
  ];

  const NeuralNetworkVisualization = () => {
    // Define neuron positions
    const inputNeuronPositions = [
      // X starts at 100
      {x: 100, y: 100},
      {x: 100, y: 130},
      {x: 100, y: 160},
      {x: 100, y: 190},

      {x: 100, y: 250},
      {x: 100, y: 280},
      {x: 100, y: 310},
      {x: 100, y: 340},
    ];

    const hiddenNeuronPositions = [
      // X start at 500
      {x: 500, y: 130},
      {x: 500, y: 160},
      {x: 500, y: 190},

      {x: 500, y: 250},
      {x: 500, y: 280},
      {x: 500, y: 310},
    ];

    const outputNeuronPositions = [
      // X start at 900
      {x: 900, y: 160},
      {x: 900, y: 190},
      {x: 900, y: 250},
      {x: 900, y: 280}
    ];

    const inputToHiddenConnections = [];
    inputNeuronPositions.forEach((input, i) => {
      hiddenNeuronPositions.forEach((hidden, j) => {
        inputToHiddenConnections.push(
          <line
            key={`ih-${i}-${j}`}
            x1={input.x}
            y1={input.y}
            x2={hidden.x}
            y2={hidden.y}
            stroke="white"
            strokeWidth="1"
            opacity="0.5"
          />
        );
      });
    });

    const hiddenToOutputConnections = [];
    hiddenNeuronPositions.forEach((hidden, i) => {
      outputNeuronPositions.forEach((output, j) => {
        hiddenToOutputConnections.push(
          <line
            key={`ho-${i}-${j}`}
            x1={hidden.x}
            y1={hidden.y}
            x2={output.x}
            y2={output.y}
            stroke="white"
            strokeWidth="1"
            opacity="0.5"
          />
        );
      });
    });

    return (
      <div className="font-press absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="text-xl mb-0">SUPER MARIO'S BRAIN</div>

        <div className="w-full max-w-6xl h-[300px] relative">
          <svg viewBox="0 0 1000 410" className="w-full h-full">
            {/* Draw all connections first so they appear behind neurons */}
            {inputToHiddenConnections}
            {hiddenToOutputConnections}

            {/* Input Layer Neurons */}
            {inputNeuronPositions.map((pos, i) => (
                <circle key={`input-${i}`} cx={pos.x} cy={pos.y} r="10" fill="white" />
            ))}

            {/* Ellipsis for input layer */}
            <text x="100" y="223" fontSize="10" fill="white" textAnchor="middle">...</text>

            {/* Hidden Layer Neurons */}
            {hiddenNeuronPositions.map((pos, i) => (
                <circle key={`hidden-${i}`} cx={pos.x} cy={pos.y} r="10" fill="white" />
            ))}

            <text x="920" y="163" fontSize="14" fill="white" alignmentBaseline="middle">LEFT</text>
            <text x="920" y="193" fontSize="14" fill="white" alignmentBaseline="middle">RIGHT</text>
            <text x="920" y="253" fontSize="14" fill="white" alignmentBaseline="middle">JUMP</text>
            <text x="920" y="283" fontSize="14" fill="white" alignmentBaseline="middle">NOTHING</text>

            {/* Ellipsis for hidden layer */}
            <text x="500" y="223" fontSize="10" fill="white" textAnchor="middle">...</text>

            {/* Output Layer Neurons */}
            {outputNeuronPositions.map((pos, i) => (
                <circle key={`output-${i}`} cx={pos.x} cy={pos.y} r="10" fill="white" />
            ))}

            {/* Layer labels */}
            <text x="100" y="400" fontSize="15" fill="white" textAnchor="middle">INPUT(231)</text>
            <text x="500" y="400" fontSize="15" fill="white" textAnchor="middle">HIDDEN(50)</text>
            <text x="900" y="400" fontSize="15" fill="white" textAnchor="middle">OUTPUT(4)</text>
          </svg>
        </div>

        <div className="cursor-pointer hover:text-yellow-400 mt-24" onClick={() => {
          setShowNeuralNetwork(false);
          setMenuState('main');
        }}>
          BACK TO MAIN MENU
        </div>
      </div>
    );
  };

  const renderMainMenu = () => (
    <div className="font-press absolute inset-0 flex flex-col items-center justify-center text-white text-sm leading-relaxed tracking-wider space-y-3">
      <div
        className="cursor-pointer hover:text-yellow-400"
        onClick={() => navigate('/game')} // Using navigate function
      >
        START GAME
      </div>
      <div className="cursor-pointer hover:text-yellow-400" onClick={() => setMenuState('levelSelect')}>
        LEVEL SELECT
      </div>
      <div className="cursor-pointer hover:text-yellow-400" onClick={() => setShowNeuralNetwork(true)}>
        NEURAL NETWORK
      </div>
      <Link to="/builder" className="hover:text-yellow-400">LEVEL BUILDER</Link>
    </div>
  );

  const renderLevelSelectMenu = () => (
    <div className="font-press absolute inset-0 flex flex-col items-center justify-center text-white text-sm leading-relaxed tracking-wider space-y-3">
      {levels.map((level, i) => (
        <div key={i} className={`cursor-pointer hover:text-yellow-400 ${selectedLevel === i ? 'text-yellow-400' : ''}`} onClick={() => setSelectedLevel(i)}>
          {level}
        </div>
      ))}
      <div className="cursor-pointer hover:text-yellow-400 pt-10" onClick={() => setMenuState('main')}>
        BACK TO MAIN MENU
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/builder" element={<LevelBuilder />} />
      <Route path="/game" element={<Game />} />
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-black flex items-center justify-center relative">
            {menuState === 'main' && !showNeuralNetwork && renderMainMenu()}
            {menuState === 'levelSelect' && !showNeuralNetwork && renderLevelSelectMenu()}
            {showNeuralNetwork && <NeuralNetworkVisualization />}
          </div>
        }
      />
    </Routes>
  );
}

export default App;