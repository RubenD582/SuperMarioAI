import { useState, useRef, useEffect } from 'react';

import  { imageList } from '../Blocks/spriteMap.jsx';

// Create a lookup object for quick access by ID
const tileById = imageList.reduce((acc, tile) => {
  acc[tile.id] = tile;
  return acc;
}, {});

const TILE_SIZE = 32;
const GRID_WIDTH = 192;
const GRID_HEIGHT = 16;

const LevelBuilder = ({ onBack }) => {
  const [selectedTileId, setSelectedTileId] = useState('ground'); // Default selected tile ID
  const [levelData, setLevelData] = useState(
    Array.from({ length: GRID_HEIGHT }, () =>
      Array(GRID_WIDTH).fill(null) // Changed from 0 to null for empty tiles
    )
  );
  const [scrollPosition, setScrollPosition] = useState(0);
  const gridRef = useRef(null);
  const containerRef = useRef(null);
  const [eraseMode, setEraseMode] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(16);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#000000');

  const [middleMouseDragging, setMiddleMouseDragging] = useState(false);
  const [rulerStart, setRulerStart] = useState(null); // { row, col }
  const [rulerEnd, setRulerEnd] = useState(null);     // { row, col }

  const [gridWidth, setGridWidth] = useState(levelData[0].length);

  useEffect(() => {
    console.log(document.cookie);

    const handleMouseUp = () => {
      setIsMouseDown(false);
      setMiddleMouseDragging(false);
      setRulerStart(null);
      setRulerEnd(null);
    };
    window.addEventListener('mouseup', handleMouseUp);

    const updateViewportSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const newVisibleColumns = Math.floor(containerWidth / TILE_SIZE);
        setVisibleColumns(newVisibleColumns);
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', updateViewportSize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const scrollAmount = TILE_SIZE * 4;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        setScrollPosition(prev => Math.max(0, prev - scrollAmount));
      }
      else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        setScrollPosition(prev =>
          Math.min((gridWidth - visibleColumns) * TILE_SIZE, prev + scrollAmount)
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visibleColumns]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleWheel = (e) => {
      if (e.deltaX !== 0 || e.deltaY !== 0) {
        setScrollPosition(prev => {
          const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
          const newPos = prev + delta;
          return Math.max(0, Math.min((gridWidth - visibleColumns) * TILE_SIZE, newPos));
        });

        e.preventDefault();
      }
    };

    grid.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      grid.removeEventListener('wheel', handleWheel);
    };
  }, [gridWidth, visibleColumns]);

  const exportLevel = () => {
    const levelArray = Object.values(levelData);

    const exportData = {
      backgroundColor: backgroundColor,
      map: levelArray,
    };

    const levelJSON = JSON.stringify(exportData, null, 2); // pretty print
    const blob = new Blob([levelJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mario-level.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importLevel = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);

          // Check if the imported data has the expected format
          if (
            importedData &&
            Array.isArray(importedData.map)
          ) {
            // Handle compatibility with old format (number indices)
            let processedMap;

            // Check if the first non-empty tile is a number (old format) or string (new format)
            const firstRow = importedData.map[0];
            const firstNonEmptyValue = firstRow.find(value => value !== 0 && value !== null && value !== undefined);
            const isOldFormat = typeof firstNonEmptyValue === 'number';

            if (isOldFormat) {
              // Create an index-to-id mapping based on original order
              const indexToIdMap = {};
              imageList.forEach((img, index) => {
                // Store 1-based index mapping to id
                indexToIdMap[index + 1] = img.id;
              });

              // Convert old numeric indices to tile IDs
              processedMap = importedData.map.map(row =>
                row.map(tileIndex => {
                  if (tileIndex === 0) return null; // Empty tile
                  // Find the tile id using the index-to-id mapping
                  return indexToIdMap[tileIndex] || null;
                })
              );

              console.log('Converted old format map to ID-based format');
            } else {
              // Already using the new ID format
              processedMap = importedData.map;
            }

            setGridWidth(processedMap[0].length);
            setLevelData(processedMap);

            if (importedData.backgroundColor) {
              setBackgroundColor(importedData.backgroundColor);
            }
          } else {
            alert('Invalid level format!');
          }
        } catch (error) {
          alert('Error importing level: ' + error.message);
        }
      };
      reader.readAsText(file);
    }
  };

  const clearLevel = () => {
    if (window.confirm('Are you sure you want to clear the entire level?')) {
      setLevelData(Array.from({ length: GRID_HEIGHT }, () => Array(gridWidth).fill(null)));
    }
  };

  const updateTile = (row, col) => {
    try {
      const newGrid = [...levelData];
      newGrid[row][col] = eraseMode ? null : selectedTileId;
      setLevelData(newGrid);
    } catch (error) {
      console.log(error);

      const newGrid = [...levelData];
      newGrid[0][0] = eraseMode ? null : selectedTileId;
      setLevelData(newGrid);
    }
  };

  function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function loadFromStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  return (
    <div className="font-press absolute inset-0 bg-black text-white flex flex-col p-2 select-none overscroll-y-none">
      <div className="flex flex-1 gap-2 h-full">
        <div className="bg-black border-r border-[#0B0B0B] p-2 flex flex-col gap-2 w-80">
          <div className="flex flex-col gap-2 mb-2">
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />

            <button
              onClick={() => setEraseMode(!eraseMode)}
              className={`px-2 py-2 rounded text-xs ${eraseMode ? 'bg-red-600' : 'bg-neutral-700'}`}
            >
              {eraseMode ? 'ERASE MODE' : 'PLACE MODE'}
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2 py-2 rounded text-xs bg-neutral-700`}
            >
              {showGrid ? 'HIDE GRID' : 'SHOW GRID'}
            </button>

            <div className="flex gap-1">
              <button
                onClick={exportLevel}
                className="px-2 py-2 rounded text-xs bg-neutral-700 flex-1"
              >
                EXPORT
              </button>

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

            <button
              onClick={() => {
                setLevelData((prevData) => {
                  const newData = prevData.map((row) => [...row, null]); // Add column
                  setGridWidth(newData[0]?.length || 0); // Use updated data
                  return newData;
                });

                setScrollPosition((prev) => prev + TILE_SIZE);
              }}
              className="px-2 py-2 rounded text-xs bg-neutral-700"
            >
              ADD COLUMN
            </button>

            <button
              onClick={clearLevel}
              className="px-2 py-2 rounded text-xs bg-red-700"
            >
              CLEAR
            </button>
          </div>

          <div
            className="grid overflow-y-auto p-2 border border-white/50 max-h-[50%]"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, 16px)',
              gridAutoRows: '16px',
              gap: '2px',
            }}
          >
            {imageList.map((imageData) => {
              const colSpan = imageData.w / 16;
              const rowSpan = imageData.h / 16;

              return (
                <div
                  key={imageData.id}
                  className={`relative cursor-pointer border border-white/10${
                    selectedTileId === imageData.id ? ' outline outline-2 outline-yellow-400' : ''
                  }`}
                  style={{
                    gridColumnEnd: `span ${colSpan}`,
                    gridRowEnd: `span ${rowSpan}`,
                  }}
                  onClick={() => {
                    setSelectedTileId(imageData.id);
                    setEraseMode(false);
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
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col" ref={containerRef}>
          <div
            className="relative flex-1 overflow-hidden flex items-center"
            ref={gridRef}
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
                    backgroundColor: 'rgba(255, 0, 128, 0.5)',
                    border: '1px dashed #ff66b2',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
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


              {/* Grid Lines Overlay */}
              {showGrid ? <div
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
              /> : null}

              {levelData.map((row, rowIndex) =>
                row.map((tileId, colIndex) => {
                  const tile = tileId ? tileById[tileId] : null;
                  const isActive = !!tile;
                  const tileKey = `${rowIndex}-${colIndex}`;

                  return (
                    <div
                      key={tileKey}
                      onMouseDown={(e) => {
                        if (e.button === 0) {
                          const selectedTile = tileById[selectedTileId];
                          const imageSizeW = selectedTile?.w || TILE_SIZE;
                          const imageSizeH = selectedTile?.h || TILE_SIZE;

                          const tilesWide = imageSizeW / TILE_SIZE;
                          const offset = Math.floor(tilesWide / 2);

                          const centerCol = tilesWide % 2 === 1 ? (colIndex - offset) : colIndex;
                          const newRow = (rowIndex - (imageSizeH / TILE_SIZE - 1));

                          setIsMouseDown(true);
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
                      }}
                      onMouseMove={(e) => {
                        if (middleMouseDragging) {
                          const rect = gridRef.current.getBoundingClientRect();
                          const x = e.clientX - rect.left + scrollPosition;
                          const y = e.clientY - rect.top;

                          const col = Math.floor(x / TILE_SIZE);
                          const row = Math.floor(y / TILE_SIZE);

                          setRulerEnd({ row, col });
                        }
                      }}
                      onMouseEnter={() => {
                        if (isMouseDown) {
                          const selectedTile = tileById[selectedTileId];
                          const imageSizeW = selectedTile?.w || TILE_SIZE;
                          const imageSizeH = selectedTile?.h || TILE_SIZE;

                          const tilesWide = imageSizeW / TILE_SIZE;
                          const offset = Math.floor(tilesWide / 2);

                          const centerCol = tilesWide % 2 === 1 ? (colIndex - offset) : colIndex;
                          const newRow = (rowIndex - (imageSizeH / TILE_SIZE - 1));

                          updateTile(newRow, centerCol);
                        }
                      }}
                      onMouseUp={() => {
                        if (middleMouseDragging) {
                          setMiddleMouseDragging(false);
                          setRulerStart(null);
                          setRulerEnd(null);
                        } else {
                          setIsMouseDown(false);
                        }
                      }}
                      style={{
                        width: isActive ? tile.w : TILE_SIZE,
                        height: isActive ? tile.h : TILE_SIZE,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                        padding: 0,
                        margin: 0,
                        boxSizing: 'border-box',
                        lineHeight: 0,
                      }}
                    >
                      {isActive && tile && (
                        <img
                          src={tile.url}
                          alt={`tile-${tileId}`}
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
                })
              )}
            </div>
          </div>

          {/* Scrollbar */}
          <div className="w-full bg-neutral-900/50 h-4 relative">
            <div
              className="absolute bg-white h-2 rounded-full"
              style={{
                top: "50%", // move it down halfway
                transform: "translateY(-50%)", // shift it up half of its height to center
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