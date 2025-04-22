import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { imageList } from '../Blocks/spriteMap.jsx';

// Create a lookup object for quick access by ID
const tileById = imageList.reduce((acc, tile) => {
  acc[tile.id] = tile;
  return acc;
}, {});

const mysteryOptions = [
  { label: 'Auto: Mushroom or Fire Flower', value: 'auto' },
  { label: 'Coin', value: 'coin' },
  { label: '1-Up', value: '1up' },
  { label: 'Star', value: 'star' },
  { label: 'Custom Tile...', value: 'custom' },
];

const TILE_SIZE = 32;
const GRID_WIDTH = 192;
const GRID_HEIGHT = 16;

// Memoized Tile component to prevent unnecessary re-renders
// Update the Tile component to handle when tileId is an object
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

    // If tileId is an object with an id property, use that id to look up the tile
    if (typeof tileId === 'object' && tileId.id) {
      return tileById[tileId.id];
    }

    // Otherwise, use tileId directly as a string
    return tileById[tileId];
  };

  const tile = getTileInfo(tileId);
  const isActive = !!tile;

  // Function to handle click on tile (for selection)
  const handleClick = (e) => {
    // Only process left clicks
    if (e.button === 0) {
      // Prevent propagation to avoid triggering other click events
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
        gridColumn: colIndex + 1, // Add explicit positioning
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
const TileSelector = memo(({ selectedTileId, setSelectedTileId, setEraseMode, setSelectedBlockPosition }) => {
  return (
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
              setSelectedBlockPosition(null); // Clear selected block when choosing a new tile
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
  );
});

const LevelBuilder = ({ onBack }) => {
  const [selectedBlockPosition, setSelectedBlockPosition] = useState(null);
  const [selectedTileId, setSelectedTileId] = useState('ground');
  const [levelData, setLevelData] = useState(
    Array.from({ length: GRID_HEIGHT }, () =>
      Array(GRID_WIDTH).fill(null)
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
  const [rulerStart, setRulerStart] = useState(null);
  const [rulerEnd, setRulerEnd] = useState(null);

  const [gridWidth, setGridWidth] = useState(levelData[0].length);
  const [placementMode, setPlacementMode] = useState(false);

  // Get the selected block based on position
  const selectedBlock =
    selectedBlockPosition &&
    levelData[selectedBlockPosition.row] &&
    levelData[selectedBlockPosition.row][selectedBlockPosition.col];

  // Use debouncing for scroll position updates
  const scrollTimeoutRef = useRef(null);

  // Function to handle tile selection (separate from placement)
  const handleTileClick = useCallback((row, col, tileId) => {
    // Only select if we have a tile
    if (tileId) {
      setSelectedBlockPosition({ row, col });

      // If it's a mystery block, ensure we're not in placement mode
      if (typeof tileId === 'object' && tileId.id === 'mystery') {
        setPlacementMode(false);
      } else if (typeof tileId === 'string' && tileId === 'mystery') {
        setPlacementMode(false);
      }
    }
  }, []);

  // Memoize handlers with useCallback
  const handleScrollPositionChange = useCallback((newPosition) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setScrollPosition(Math.max(0, Math.min((gridWidth - visibleColumns) * TILE_SIZE, newPosition)));
    }, 5); // Small delay for debouncing
  }, [gridWidth, visibleColumns]);

  useEffect(() => {
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
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const scrollAmount = TILE_SIZE * 4;
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

    return () => {
      grid.removeEventListener('wheel', handleWheel);
    };
  }, [scrollPosition, handleScrollPositionChange]);

  const exportLevel = useCallback(async () => {
    const exportData = {
      backgroundColor: backgroundColor,
      map: levelData,
    };

    const levelJSON = JSON.stringify(exportData, null, 2);
    const blob = new Blob([levelJSON], { type: 'application/json' });

    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: 'mario-level.json',
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

  const updateMysteryContent = (type, customId = null) => {
    if (!selectedBlockPosition) return;

    setLevelData(prev => {
      const { row, col } = selectedBlockPosition;
      const newGrid = [...prev];
      const newRow = [...newGrid[row]];
      const currentTile = newRow[col];

      if (typeof currentTile === 'object' && currentTile.id === 'mystery') {
        newRow[col] = {
          ...currentTile,
          content: {
            type,
            ...(type === 'custom' && customId ? { customItemId: customId } : {}),
          },
        };
      } else if (currentTile === 'mystery') {
        // Convert string mystery tile to object with content
        newRow[col] = {
          id: 'mystery',
          content: {
            type,
            ...(type === 'custom' && customId ? { customItemId: customId } : {}),
          },
        };
      }

      newGrid[row] = newRow;
      return newGrid;
    });
  };

  const importLevel = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          if (importedData && Array.isArray(importedData.map)) {
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
                row.map(tileIndex => {
                  if (tileIndex === 0) return null;
                  return indexToIdMap[tileIndex] || null;
                })
              );

              console.log('Converted old format map to ID-based format');
            } else {
              processedMap = importedData.map;
            }

            setGridWidth(processedMap[0].length);
            setLevelData(processedMap);
            setSelectedBlockPosition(null); // Clear selected block on import

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
  }, []);

  const clearLevel = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire level?')) {
      setLevelData(Array.from({ length: GRID_HEIGHT }, () => Array(gridWidth).fill(null)));
      setSelectedBlockPosition(null); // Clear selected block on clear
    }
  }, [gridWidth]);

  const updateTile = useCallback((row, col) => {
    if (row < 0 || row >= GRID_HEIGHT || col < 0 || col >= gridWidth) return;

    setLevelData(prev => {
      const newGrid = [...prev];
      const newRow = [...newGrid[row]];
      if (eraseMode) {
        newRow[col] = null;
      } else {
        if (selectedTileId === 'mystery') {
          // Always create mystery blocks as objects with content
          newRow[col] = {
            id: 'mystery',
            content: { type: 'auto' }
          };
        } else {
          // Other tiles are just stored as strings
          newRow[col] = selectedTileId;
        }
      }
      newGrid[row] = newRow;
      return newGrid;
    });
  }, [eraseMode, selectedTileId, gridWidth]);

  const handleTileMouseDown = useCallback((e, rowIndex, colIndex) => {
    if (e.button === 0) {
      // Only place tiles if we're not trying to select them
      setPlacementMode(true);

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
      setPlacementMode(false); // Exit placement mode on mouse up
    }
  }, [middleMouseDragging]);

  const handleGridMouseMove = useCallback((e) => {
    if (middleMouseDragging && gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollPosition;
      const y = e.clientY - rect.top;

      const col = Math.floor(x / TILE_SIZE);
      const row = Math.floor(y / TILE_SIZE);

      setRulerEnd({ row, col });
    }
  }, [middleMouseDragging, scrollPosition]);

  // Calculate visible range - but render all tiles for now to fix placement
  const calculateVisibleRange = useCallback(() => {
    const startCol = Math.floor(scrollPosition / TILE_SIZE);
    const endCol = Math.min(startCol + visibleColumns + 1, gridWidth);
    return { startCol, endCol };
  }, [scrollPosition, visibleColumns, gridWidth]);

  const { startCol, endCol } = calculateVisibleRange();

  // Add visual highlight for selected block
  const getSelectedStyle = useCallback((rowIndex, colIndex) => {
    if (selectedBlockPosition &&
      selectedBlockPosition.row === rowIndex &&
      selectedBlockPosition.col === colIndex) {
      return {
        outlineColor: 'rgba(0, 255, 255, 0.8)',
        outlineStyle: 'solid',
        outlineWidth: '2px',
        outlineOffset: '0px',
        zIndex: 20
      };
    }
    return {};
  }, [selectedBlockPosition]);

  return (
    <div className="font-press absolute inset-0 bg-black text-white flex flex-col p-2 select-none overscroll-y-none">
      <div className="flex flex-1 gap-2 h-full">
        <div className="bg-black border-r border-[#0B0B0B] p-2 flex flex-col gap-2 w-80">
          <div className="flex flex-col gap-2 mb-2">
            <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} />

            <button
              onClick={() => {
                setEraseMode(!eraseMode);
                setSelectedBlockPosition(null); // Clear selection when toggling erase mode
              }}
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

          <TileSelector
            selectedTileId={selectedTileId}
            setSelectedTileId={setSelectedTileId}
            setEraseMode={setEraseMode}
            setSelectedBlockPosition={setSelectedBlockPosition}
          />
        </div>

        <div className="flex-1 flex flex-col" ref={containerRef}>
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

              {/* Selected Block Highlight */}
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

              {/* Render all tiles for now to fix placement issues */}
              {levelData.map((row, rowIndex) =>
                row.map((tileId, colIndex) => {
                  // Only render tiles that are close to the visible area
                  if (colIndex < startCol - 2 || colIndex > endCol + 2) {
                    return null; // Skip tiles far outside the visible area
                  }

                  const tileKey = `${rowIndex}-${colIndex}`;

                  return (
                    <Tile
                      key={tileKey}
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

          {/* Mystery Block Editor Panel */}
          {selectedBlock && (
            typeof selectedBlock === 'object' && selectedBlock.id === 'mystery' || selectedBlock === 'mystery'
          ) && (
            <div className="p-2 bg-neutral-800 text-sm rounded shadow">
              <h3 className="font-bold mb-2">Mystery Block Settings</h3>
              <select
                className="w-full text-black mb-2 p-1 rounded"
                value={
                  typeof selectedBlock === 'object' && selectedBlock.content
                    ? selectedBlock.content.type
                    : 'auto'
                }
                onChange={(e) => updateMysteryContent(e.target.value)}
              >
                {mysteryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {(typeof selectedBlock === 'object' &&
                selectedBlock.content &&
                selectedBlock.content.type === 'custom') && (
                <select
                  className="w-full text-black p-1 rounded"
                  value={selectedBlock.content.customItemId || ''}
                  onChange={(e) => updateMysteryContent('custom', e.target.value)}
                >
                  <option value="">-- Choose Tile --</option>
                  {imageList.map(tile => (
                    <option key={tile.id} value={tile.id}>
                      {tile.id}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

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