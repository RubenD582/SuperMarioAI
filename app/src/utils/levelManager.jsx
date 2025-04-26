import { createContext, useContext, useState } from 'react';

// Create a context to hold level state and functions
const LevelContext = createContext(undefined);

export const LevelProvider = ({ children }) => {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [levelData, setLevelData] = useState(null);

  // Function to change the level
  const changeLevel = async (levelId) => {
    try {
      console.log(`Loading level: ${levelId}`);
      
      const level = await import(`../assets/levels/level_${levelId}.json`);
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