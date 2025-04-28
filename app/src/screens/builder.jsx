import { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { imageList } from '../Blocks/spriteMap.jsx';

// Create lookup object for quick tile access by ID
const tileById = imageList.reduce((acc, tile) => {
  acc[tile.id] = tile;
  return acc;
}, {});

const TILE_SIZE = 32;
const GRID_WIDTH = 16;
const GRID_HEIGHT = 16;

// Item options for different block types
const BLOCK_OPTIONS = {
  mystery: [
    { label: 'Auto: Mushroom or Fire Flower', value: 'auto' },
    { label: 'Coin', value: 'coin' },
    { label: '1-Up', value: '1up' },
    { label: 'Star', value: 'star' },
  ],
  brick: [
    { label: 'Auto: Mushroom or Fire Flower', value: 'auto' },
    { label: 'Coin', value: 'coin' },
    { label: 'Star', value: 'star' },
    { label: 'Flower', value: 'flower' },
    { label: 'Mushroom', value: 'mushroom' },
    { label: '1-Up', value: '1up' },
  ],
  undergroundBrick: [
    { label: 'Auto: Mushroom or Fire Flower', value: 'auto' },
    { label: 'Coin', value: 'coin' },
    { label: 'Star', value: 'star' },
    { label: 'Flower', value: 'flower' },
    { label: 'Mushroom', value: 'mushroom' },
    { label: '1-Up', value: '1up' },
  ],
  pipe: [
    { label: 'Plant', value: 'plant' },
    { label: 'Level', value: 'level' },
    { label: 'Plant & Level', value: 'plant_level' },
  ],
  pipeConnection: [],
  platform: [
    { label: 'Up', value: 'up' },
    { label: 'Down', value: 'down' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
  ]
};

// Memoized Tile component
const Tile = memo(({
  rowIndex,
  colIndex,
  tileId,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
  showCoordinates,
  onTileClick
}) => {
  // Handle both string-based and object-based tile IDs
  const getTileInfo = (tileId) => {
    if (!tileId) return null;
    return typeof tileId === 'object' && tileId.id ? tileById[tileId.id] : tileById[tileId];
  };

  const tile = getTileInfo(tileId);
  const isActive = !!tile;

  const handleClick = (e) => {
    if (e.button === 0) {
      e.stopPropagation();
      onTileClick(rowIndex, colIndex, tileId);
    }
  };

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, rowIndex, colIndex)}
      onMouseEnter={() => onMouseEnter(rowIndex, colIndex)}
      onMouseUp={onMouseUp}
      onClick={handleClick}
      style={{
        width: isActive ? tile?.w : TILE_SIZE,
        height: isActive ? tile?.h : TILE_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        lineHeight: 0,
        gridColumn: colIndex + 1,
        gridRow: rowIndex + 1,
      }}
    >
      {isActive && tile && (
        <img
          src={tile.url}
          alt={`tile-${typeof tileId === 'object' ? tileId.id : tileId}`}
          draggable={false}
          className="pointer-events-none select-none"
          style={{
            display: 'block',
            width: `${tile.w}px`,
            height: `${tile.h}px`,
            imageRendering: 'pixelated',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          }}
        />
      )}
      {showCoordinates && (
        <span className="absolute top-0 left-0 text-[10px] px-1 text-white bg-black bg-opacity-50 pointer-events-none">
          {colIndex},{rowIndex}
        </span>
      )}
    </div>
  );
});

// Memoized TileSelector component
const TileSelector = memo(({ selectedTileId, setSelectedTileId, setEraseMode, setSelectedBlockPosition }) => (
  <div
    className="grid overflow-y-auto p-2 border border-white/50 max-h-[50%]"
    style={{
      gridTemplateColumns: 'repeat(auto-fill, 16px)',
      gridAutoRows: '16px',
      gap: '2px',
    }}
  >
    {imageList.map((imageData) => (
      <div
        key={imageData.id}
        className={`relative cursor-pointer border border-white/10${
          selectedTileId === imageData.id ? ' outline outline-2 outline-yellow-400' : ''
        }`}
        style={{
          gridColumnEnd: `span ${imageData.w / 16}`,
          gridRowEnd: `span ${imageData.h / 16}`,
        }}
        onClick={() => {
          setSelectedTileId(imageData.id);
          setEraseMode(false);
          setSelectedBlockPosition(null);

          console.log(imageData);
        }}
      >
        <img
          src={imageData.url}
          alt={`tile-${imageData.id}`}
          className="pointer-events-none w-full h-full object-cover"
          title={imageData.id}
          style={{
            display: 'block',
            width: `${imageData.w}px`,
            height: `${imageData.h}px`,
            imageRendering: 'pixelated',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          }}
        />
      </div>
    ))}
  </div>
));

// Block Editor component
const BlockEditor = ({ selectedBlock, updateBlockContent }) => {
  if (!selectedBlock) return null;

  const getBlockType = () => {
    if (typeof selectedBlock === 'string') {
      if (selectedBlock === 'mystery') return 'mystery';
      if (selectedBlock === 'brick') return 'brick';
      if (selectedBlock === 'undergroundBrick') return 'undergroundBrick';
      if (selectedBlock === 'pipeTop') return 'pipe';
      if (selectedBlock === 'platform') return 'platform';
      if (selectedBlock === 'pipeConnection') return 'pipeConnection';
      return null;
    }

    if (typeof selectedBlock === 'object') {
      if (selectedBlock.id === 'mystery') return 'mystery';
      if (selectedBlock.id === 'brick') return 'brick';
      if (selectedBlock.id === 'undergroundBrick') return 'undergroundBrick';
      if (selectedBlock.id === 'pipeTop') return 'pipe';
      if (selectedBlock.id === 'platform') return 'platform';
      if (selectedBlock === 'pipeConnection') return 'pipeConnection';
    }

    return null;
  };

  const blockType = getBlockType();
  if (!blockType) return null;

  const getContentType = () => {
    return typeof selectedBlock === 'object' && selectedBlock.content ? selectedBlock.content.type : 'none';
  };

  const contentType = getContentType();
  const options = BLOCK_OPTIONS[blockType];
  let title = '';
  switch (blockType) {
    case 'mystery':
      title = 'MYSTERY BLOCK SETTINGS';
      break;
    case 'brick':
      title = 'BRICK BLOCK SETTINGS';
      break;
    case 'pipeTop':
      title = 'PIPE SETTINGS';
      break;
    case 'platform':
      title = 'PLATFORM DIRECTION';
      break;
    case 'pipeConnection':
      title = 'SET EXIT LOCATION';
      break;
    default:
      title = 'Block Settings';
      break;
  }

  return (
    <div className="p-2 bg-neutral-800 text-sm rounded shadow">
      <h3 className={`font-bold ${options.length === 0 ? `mb-10` : `mb-2`}`}>{title}</h3>
      {options.length > 0 ? <select
        className="w-full text-black mb-2 p-1 rounded"
        value={contentType}
        onChange={(e) => updateBlockContent(blockType, e.target.value)}
      >
        <option value="none">Empty</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select> : null}

      {(blockType === 'brick' || blockType === 'undergroundBrick') && contentType === 'coin' && (
        <div className="mt-2">
          <label className="block text-sm mb-1">Coin Count:</label>
          <input
            type="number"
            min="1"
            max="10"
            className="w-full text-black p-1 rounded"
            value={selectedBlock.content?.quantity || 1}
            onChange={(e) => updateBlockContent('brick', 'coin', parseInt(e.target.value, 10))}
          />
        </div>
      )}

      {blockType === 'pipe' && contentType === 'level' && (
        <div className="mt-2">
          <label className="block text-sm mb-1">Load JSON Level:</label>
          <input
            type="text"
            className="w-full text-black p-1 rounded"
            placeholder="e.g level_1-1a"
            onChange={(e) => updateBlockContent('pipeTop', 'level', e.target.value)}
          />
        </div>
      )}

      {blockType === 'pipe' && contentType === 'plant_level' && (
        <div className="mt-2">
          <label className="block text-sm mb-1">Load JSON Level:</label>
          <input
            type="text"
            className="w-full text-black p-1 rounded"
            placeholder="e.g level_1-1a"
            onChange={(e) => updateBlockContent('pipeTop', 'plant_level', e.target.value)}
          />
        </div>
      )}

      {blockType === 'pipeConnection' && (
        <div className="mt-2">
          <label className="block text-sm mb-1">Load JSON Level:</label>
          <input
            id="levelInput0"
            type="text"
            className="w-full text-black p-1 rounded mb-2"
            placeholder="e.g level_1-1a"
          />

          <label className="block text-sm mb-1">Player spawn coordinates:</label>
          <input
            id="levelInput1"
            type="number"
            className="w-full text-black p-1 rounded mb-2"
            placeholder="X"
          />

          <input
            id="levelInput2"
            type="number"
            className="w-full text-black p-1 rounded mb-2"
            placeholder="Y"
          />

          <button
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              const valueLevel = document.getElementById('levelInput0').value;
              const valueX = document.getElementById('levelInput1').value;
              const valueY = document.getElementById('levelInput2').value;
              updateBlockContent('pipeConnection', 'spawn', {
                level: valueLevel,
                x: valueX,
                y: valueY,
              });
            }}
          >
            SET
          </button>
        </div>
      )}

    </div>
  );
};

// Main LevelBuilder Component
const LevelBuilder = ({ onBack }) => {
  const [selectedBlockPosition, setSelectedBlockPosition] = useState(null);
  const [selectedTileId, setSelectedTileId] = useState('ground');
  const [levelData, setLevelData] = useState(Array.from({ length: GRID_HEIGHT }, () => Array(GRID_WIDTH).fill(null)));
  const [scrollPosition, setScrollPosition] = useState(0);
  const [eraseMode, setEraseMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(16);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [middleMouseDragging, setMiddleMouseDragging] = useState(false);
  const [rulerStart, setRulerStart] = useState(null);
  const [rulerEnd, setRulerEnd] = useState(null);
  const [gridWidth, setGridWidth] = useState(levelData[0].length);
  const [placementMode, setPlacementMode] = useState(false);
  const [fileName, setFileName] = useState('mario-level.json');

  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Get selected block based on position
  const selectedBlock = selectedBlockPosition &&
    levelData[selectedBlockPosition.row] &&
    levelData[selectedBlockPosition.row][selectedBlockPosition.col];

  // Update block content (mystery, brick, pipe)
  const updateBlockContent = useCallback((blockType, contentType, customValue = null) => {
    if (!selectedBlockPosition) return;

    const { row, col } = selectedBlockPosition;

    setLevelData(prevData => {
      const newGrid = [...prevData];
      const currentRow = [...newGrid[row]];
      const currentTile = currentRow[col];
      let updatedTile;

      if (typeof currentTile === 'object') {
        // Update existing object tile
        updatedTile = {
          ...currentTile,
          content: contentType === 'none' ? null : {
            type: contentType,
            ...(contentType === 'custom' && customValue ? { customItemId: customValue } : {}),
            ...(contentType === 'coin' && customValue ? { quantity: customValue } : {}),
            ...(contentType === 'level' && customValue ? { level: customValue } : {}),
            ...(contentType === 'spawn' && customValue ? { data: customValue } : {}),
            ...(contentType === 'plant_level' && customValue ? { level: customValue } : {})
          }
        };
      } else if (typeof currentTile === 'string') {
        // Convert string tile to object with content
        updatedTile = {
          id: currentTile,
          content: contentType === 'none' ? null : {
            type: contentType,
            ...(contentType === 'custom' && customValue ? { customItemId: customValue } : {}),
            ...(contentType === 'coin' && customValue ? { quantity: customValue } : {}),
            ...(contentType === 'level' && customValue ? { level: customValue } : {}),
            ...(contentType === 'spawn' && customValue ? { data: customValue } : {}),
            ...(contentType === 'plant_level' && customValue ? { level: customValue } : {})
          }
        };
      }

      if (updatedTile) {
        currentRow[col] = updatedTile;
        newGrid[row] = currentRow;
      }

      return newGrid;
    });
  }, [selectedBlockPosition]);

  // Handle tile selection
  const handleTileClick = useCallback((row, col, tileId) => {
    if (tileId) {
      setSelectedBlockPosition({ row, col });
      setPlacementMode(false);
    }
  }, []);

  // Update scroll position with debouncing
  const handleScrollPositionChange = useCallback((newPosition) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setScrollPosition(Math.max(0, Math.min((gridWidth - visibleColumns) * TILE_SIZE, newPosition)));
    }, 5);
  }, [gridWidth, visibleColumns]);

  // Global event listeners
  useEffect(() => {
    const handleMouseUp = () => {
      setIsMouseDown(false);
      setMiddleMouseDragging(false);
      setRulerStart(null);
      setRulerEnd(null);
    };

    const updateViewportSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        setVisibleColumns(Math.floor(containerWidth / TILE_SIZE));
      }
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', updateViewportSize);
    updateViewportSize();

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', updateViewportSize);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      const scrollAmount = TILE_SIZE * 2;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        handleScrollPositionChange(scrollPosition - scrollAmount);
      }
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        handleScrollPositionChange(scrollPosition + scrollAmount);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollPosition, handleScrollPositionChange]);

  // Mouse wheel handling
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleWheel = (e) => {
      if (e.deltaX !== 0 || e.deltaY !== 0) {
        const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        handleScrollPositionChange(scrollPosition + delta);
        e.preventDefault();
      }
    };

    grid.addEventListener('wheel', handleWheel, { passive: false });
    return () => grid.removeEventListener('wheel', handleWheel);
  }, [scrollPosition, handleScrollPositionChange]);

  // Level operations
  const exportLevel = useCallback(async () => {
    const exportData = { backgroundColor, map: levelData };
    const levelJSON = JSON.stringify(exportData, null, 2);
    const blob = new Blob([levelJSON], { type: 'application/json' });

    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description: 'JSON Files',
          accept: {'application/json': ['.json']},
        }],
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      console.log('File saved successfully');
    } catch (err) {
      console.error('Error saving file:', err);
    }
  }, [backgroundColor, levelData]);

  const importLevel = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (!importedData || !Array.isArray(importedData.map)) {
          alert('Invalid level format!');
          return;
        }

        let processedMap;
        const firstRow = importedData.map[0];
        const firstNonEmptyValue = firstRow.find(value => value !== 0 && value !== null && value !== undefined);
        const isOldFormat = typeof firstNonEmptyValue === 'number';

        if (isOldFormat) {
          const indexToIdMap = {};
          imageList.forEach((img, index) => {
            indexToIdMap[index + 1] = img.id;
          });

          processedMap = importedData.map.map(row =>
            row.map(tileIndex => tileIndex === 0 ? null : indexToIdMap[tileIndex] || null)
          );
        } else {
          processedMap = importedData.map;
        }

        setGridWidth(processedMap[0].length);
        setLevelData(processedMap);
        setSelectedBlockPosition(null);

        if (importedData.backgroundColor) {
          setBackgroundColor(importedData.backgroundColor);
        }
      } catch (error) {
        alert('Error importing level: ' + error.message);
      }
    };
    reader.readAsText(file);
  }, []);

  const clearLevel = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire level?')) {
      setLevelData(Array.from({ length: GRID_HEIGHT }, () => Array(gridWidth).fill(null)));
      setSelectedBlockPosition(null);
    }
  }, [gridWidth]);

  // Tile placement
  const updateTile = useCallback((row, col) => {
    if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= gridWidth) return;

    setLevelData(prev => {
      const newGrid = [...prev];
      const newRow = [...newGrid[row]];

      if (eraseMode) {
        newRow[col] = null;
      } else {
        newRow[col] = selectedTileId === 'mystery' ?
          { id: 'mystery', content: { type: 'auto' } } :
          selectedTileId;
      }

      newGrid[row] = newRow;
      return newGrid;
    });
  }, [eraseMode, selectedTileId, gridWidth]);

  // Mouse event handlers
  const handleTileMouseDown = useCallback((e, rowIndex, colIndex) => {
    if (e.button === 0) {
      setPlacementMode(true);
      setIsMouseDown(true);

      const selectedTile = tileById[selectedTileId];
      const imageSizeW = selectedTile?.w || TILE_SIZE;
      const imageSizeH = selectedTile?.h || TILE_SIZE;
      const tilesWide = imageSizeW / TILE_SIZE;
      const offset = Math.floor(tilesWide / 2);
      const centerCol = colIndex; //tilesWide % 2 === 1 ? (colIndex - offset) : colIndex;
      const newRow = rowIndex * 1; //(rowIndex - (imageSizeH / TILE_SIZE - 1));

      updateTile(newRow, centerCol);
    } else if (e.button === 1) {
      e.preventDefault();
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollPosition;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / TILE_SIZE);
      const row = Math.floor(y / TILE_SIZE);

      setMiddleMouseDragging(true);
      setRulerStart({ row, col });
      setRulerEnd({ row, col });
    }
  }, [scrollPosition, selectedTileId, updateTile]);

  const handleTileMouseEnter = useCallback((rowIndex, colIndex) => {
    if (isMouseDown && placementMode) {
      const selectedTile = tileById[selectedTileId];
      const imageSizeW = selectedTile?.w || TILE_SIZE;
      const imageSizeH = selectedTile?.h || TILE_SIZE;
      const tilesWide = imageSizeW / TILE_SIZE;
      const offset = Math.floor(tilesWide / 2);
      const centerCol = tilesWide % 2 === 1 ? (colIndex - offset) : colIndex;
      const newRow = (rowIndex - (imageSizeH / TILE_SIZE - 1));

      updateTile(newRow, centerCol);
    }
  }, [isMouseDown, placementMode, selectedTileId, updateTile]);

  const handleTileMouseUp = useCallback(() => {
    if (middleMouseDragging) {
      setMiddleMouseDragging(false);
      setRulerStart(null);
      setRulerEnd(null);
    } else {
      setIsMouseDown(false);
      setPlacementMode(false);
    }
  }, [middleMouseDragging]);

  const handleGridMouseMove = useCallback((e) => {
    if (middleMouseDragging && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollPosition;
      const y = e.clientY - rect.top;
      const col = Math.floor(x / TILE_SIZE);
      const row = Math.floor(y / TILE_SIZE);

      if (e.clientX >= window.innerWidth - TILE_SIZE * 2) {
        handleScrollPositionChange(scrollPosition + TILE_SIZE);
      }

      setRulerEnd({ row, col });
    }
  }, [middleMouseDragging, scrollPosition]);

  // Calculate visible range
  const { startCol, endCol } = useMemo(() => {
    const startCol = Math.floor(scrollPosition / TILE_SIZE);
    const endCol = Math.min(startCol + visibleColumns + 1, gridWidth);
    return { startCol, endCol };
  }, [scrollPosition, visibleColumns, gridWidth]);

  const ToolbarButton = ({ onClick, className, children }) => (
    <button
      onClick={onClick}
      className={`px-2 py-2 rounded text-xs ${className || 'bg-neutral-700'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="font-press absolute inset-0 bg-black text-white flex flex-col p-2 select-none overscroll-y-none">
      <div className="flex flex-1 gap-2 h-full">
        <div className="bg-black border-r border-[#0B0B0B] p-2 flex flex-col gap-2 w-80">
          <div className="flex flex-col gap-2 mb-2">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />

            <ToolbarButton
              onClick={() => {
                setEraseMode(!eraseMode);
                setSelectedBlockPosition(null);
              }}
              className={eraseMode ? 'bg-red-600' : 'bg-neutral-700'}
            >
              {eraseMode ? 'ERASE MODE' : 'PLACE MODE'}
            </ToolbarButton>

            <ToolbarButton onClick={() => setShowGrid(!showGrid)}>
              {showGrid ? 'HIDE GRID' : 'SHOW GRID'}
            </ToolbarButton>

            <div className="flex gap-1">
              <ToolbarButton onClick={exportLevel} className="flex-1 bg-neutral-700">
                EXPORT
              </ToolbarButton>

              <label className="px-2 py-2 rounded text-xs bg-neutral-700 cursor-pointer flex-1 text-center">
                IMPORT
                <input
                  type="file"
                  accept=".json"
                  onChange={importLevel}
                  className="hidden"
                />
              </label>
            </div>

            <ToolbarButton
              onClick={() => {
                setLevelData(prevData => {
                  const newData = prevData.map(row => [...row, null]);
                  setGridWidth(newData[0]?.length || 0);
                  return newData;
                });
                setScrollPosition(prev => prev + TILE_SIZE);
              }}
            >
              ADD COLUMN
            </ToolbarButton>

            <ToolbarButton onClick={clearLevel} className="bg-red-700">
              CLEAR
            </ToolbarButton>
          </div>

          <TileSelector
            selectedTileId={selectedTileId}
            setSelectedTileId={setSelectedTileId}
            setEraseMode={setEraseMode}
            setSelectedBlockPosition={setSelectedBlockPosition}
          />
        </div>

        <div className="flex-1 flex flex-col" ref={containerRef}>

          <input
            id="fileName"
            type="text"
            className="w-full text-white p-1 rounded bg-black border-none focus:outline-none focus:ring-0"
            placeholder={fileName}
          />

          <div
            className="relative flex-1 overflow-hidden flex items-center"
            ref={gridRef}
            onMouseMove={handleGridMouseMove}
          >
            <div
              className="absolute top-0 left-0"
              style={{
                transform: `translateX(-${scrollPosition}px)`,
                width: `${gridWidth * TILE_SIZE}px`,
                height: `${GRID_HEIGHT * TILE_SIZE}px`,
                display: 'grid',
                gridTemplateColumns: `repeat(${gridWidth}, ${TILE_SIZE}px)`,
                gridTemplateRows: `repeat(${GRID_HEIGHT}, ${TILE_SIZE}px)`,
                gap: '0px',
                backgroundColor: backgroundColor,
                boxSizing: 'border-box',
              }}
            >
              {middleMouseDragging && rulerStart && rulerEnd && (
                <div
                  className="absolute z-20 pointer-events-none"
                  style={{
                    left: `${Math.min(rulerStart.col, rulerEnd.col) * TILE_SIZE}px`,
                    top: `${Math.min(rulerStart.row, rulerEnd.row) * TILE_SIZE}px`,
                    width: `${(Math.abs(rulerEnd.col - rulerStart.col) + 1) * TILE_SIZE}px`,
                    height: `${(Math.abs(rulerEnd.row - rulerStart.row) + 1) * TILE_SIZE}px`,
                    backgroundColor: 'rgba(255, 0, 255, 0.5)',
                    border: '1px dashed #ff66b2',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: '#000',
                      color: '#fff',
                      fontSize: '10px',
                      padding: '2px 4px',
                    }}
                  >
                    {Math.abs(rulerEnd.col - rulerStart.col) + 1} x {Math.abs(rulerEnd.row - rulerStart.row) + 1}
                  </span>
                </div>
              )}

              {showGrid && (
                <div
                  className="absolute top-0 left-0 pointer-events-none"
                  style={{
                    width: `${gridWidth * TILE_SIZE}px`,
                    height: `${GRID_HEIGHT * TILE_SIZE + 1}px`,
                    backgroundSize: `${TILE_SIZE}px ${TILE_SIZE}px`,
                    backgroundImage: `
                      linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
                    `,
                    zIndex: 10,
                  }}
                />
              )}

              {selectedBlockPosition && (
                <div
                  className="absolute pointer-events-none z-30"
                  style={{
                    left: `${selectedBlockPosition.col * TILE_SIZE}px`,
                    top: `${selectedBlockPosition.row * TILE_SIZE}px`,
                    width: `${TILE_SIZE}px`,
                    height: `${TILE_SIZE}px`,
                    border: '2px solid cyan',
                    boxSizing: 'border-box',
                  }}
                />
              )}

              {/* Render visible tiles */}
              {levelData.map((row, rowIndex) =>
                row.map((tileId, colIndex) => {
                  // Only render tiles near the visible area
                  if (colIndex < startCol - 2 || colIndex > endCol + 2) {
                    return null;
                  }

                  return (
                    <Tile
                      key={`${rowIndex}-${colIndex}`}
                      rowIndex={rowIndex}
                      colIndex={colIndex}
                      tileId={tileId}
                      onMouseDown={handleTileMouseDown}
                      onMouseEnter={handleTileMouseEnter}
                      onMouseUp={handleTileMouseUp}
                      showCoordinates={showCoordinates}
                      onTileClick={handleTileClick}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Block Editor Panel */}
          <BlockEditor selectedBlock={selectedBlock} updateBlockContent={updateBlockContent} />

          {/* Scrollbar */}
          <div className="w-full bg-neutral-900/50 h-4 relative">
            <div
              className="absolute bg-white h-2 rounded-full"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                left: `${(scrollPosition / (gridWidth * TILE_SIZE)) * 100}%`,
                width: `${(visibleColumns / gridWidth) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelBuilder;