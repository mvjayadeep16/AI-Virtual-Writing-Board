/* Application-wide constants */
const VWB_CONSTANTS = {
  PALETTE: [
    '#ffffff','#000000','#5ac8fa','#a06bff','#34d399','#fbbf24','#f87171','#ec4899',
    '#f97316','#10b981','#3b82f6','#8b5cf6','#ef4444','#14b8a6','#eab308','#64748b'
  ],
  BG_TEMPLATES: ['transparent','whiteboard','blackboard','grid','dots','notebook'],
  BRUSH_TOOLS: ['pen','marker','pencil','highlighter','neon','spray','eraser'],
  SHAPE_TOOLS: ['line','rect','circle','arrow','text'],
  DEFAULTS: {
    color: '#5ac8fa',
    size: 6,
    opacity: 1,
    tool: 'pen',
    smoothing: 0.6,
    bg: 'transparent'
  },
  VOICE_COMMANDS: {
    'undo':'undo','redo':'redo','clear':'clear','save':'save','export':'save',
    'next color':'nextColor','previous color':'prevColor',
    'eraser':'eraser','pen':'pen','marker':'marker','pencil':'pencil','highlighter':'highlighter'
  }
};
