import { createContext, useContext, useState } from 'react';

// Auto-import all level JSON files
const levelModules = import.meta.glob('../assets/levels/**/*.json');

// Create a context to hold level state and functions
const LevelContext = createContext(undefined);

export const LevelProvider = ({ children }) => {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [levelData, setLevelData] = useState(null);

  // Function to change the level
  const changeLevel = async (levelId) => {
    try {
      levelId = levelId.replace('.json', '');
      const path = `../assets/levels/${levelId}.json`;
      console.log(`Loading level: ${path}`);

      const loader = levelModules[path];
      if (!loader) {
        throw new Error(`Level ${levelId} not found.`);
      }

      const level = await loader();
      setLevelData(level.default || level);
      setCurrentLevel(levelId);
      return true;
    } catch (error) {
      console.error(`Failed to load level ${levelId}:`, error);
      return false;
    }
  };

  return (
    <LevelContext.Provider value={{ currentLevel, levelData, changeLevel }}>
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error('useLevel must be used within a LevelProvider');
  }
  return context;
};

let _changeLevelFn = null;

export const initializeLevelManager = (changeLevelFn) => {
  _changeLevelFn = changeLevelFn;
};

export const setLevel = (levelId) => {
  if (_changeLevelFn) {
    return _changeLevelFn(levelId);
  } else {
    console.error("Level manager not initialized yet");
    return false;
  }
};
