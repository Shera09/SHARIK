'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PenTool,
  Eraser,
  Type,
  Square,
  Circle,
  Minus,
  StickyNote,
  Image,
  Download,
  Share2,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Hand,
  Trash2,
  Users,
  MoreHorizontal,
  Palette,
  Grid,
  Presentation,
  Sparkles,
  Lightbulb,
  MousePointer,
  Move,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const tools = [
  { id: 'select', icon: MousePointer, label: 'Select (V)' },
  { id: 'hand', icon: Hand, label: 'Hand (H)' },
  { id: 'pen', icon: PenTool, label: 'Pen (P)' },
  { id: 'eraser', icon: Eraser, label: 'Eraser (E)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (C)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'arrow', icon: Move, label: 'Arrow (A)' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky Note (S)' },
  { id: 'image', icon: Image, label: 'Image' },
];

const colors = [
  '#000000', '#6b7280', '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e',
];

const stickyColors = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa',
];

export default function WhiteboardPage() {
  const [selectedTool, setSelectedTool] = useState('pen');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);

  // Mock elements on whiteboard
  const initialElements = [
    { id: '1', type: 'sticky', x: 100, y: 100, text: 'User Research', color: '#fef08a', rotation: -3 },
    { id: '2', type: 'sticky', x: 300, y: 150, text: 'Design Sprint', color: '#bbf7d0', rotation: 2 },
    { id: '3', type: 'sticky', x: 500, y: 100, text: 'Development', color: '#bfdbfe', rotation: -1 },
    { id: '4', type: 'sticky', x: 700, y: 150, text: 'Testing & Launch', color: '#fecaca', rotation: 4 },
    { id: '5', type: 'text', x: 100, y: 50, text: 'Project Roadmap Q3', color: '#000000', fontSize: 24 },
    { id: '6', type: 'circle', x: 900, y: 300, color: '#3b82f6', size: 100 },
    { id: '7', type: 'rectangle', x: 900, y: 450, color: '#22c55e', width: 150, height: 80 },
  ];

  const [elements] = useState(initialElements);

  return (
    <AppShell>
      <TooltipProvider>
      <div className="flex h-[calc(100vh-120px)]">
        {/* Toolbar */}
        <div className="w-14 border-r bg-muted/30 flex flex-col items-center py-3 gap-1">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedTool === tool.id ? 'secondary' : 'ghost'}
                  size="icon"
                  className={cn("h-10 w-10", selectedTool === tool.id && "shadow-sm")}
                  onClick={() => setSelectedTool(tool.id)}
                >
                  <tool.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{tool.label}</TooltipContent>
            </Tooltip>
          ))}

          <Separator className="my-2 w-8" />

          {/* Color Picker */}
          <div className="flex flex-wrap justify-center gap-1 px-1">
            {colors.slice(0, 6).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  "h-5 w-5 rounded-full border-2 transition-transform",
                  selectedColor === color && "scale-110 border-primary"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <Separator className="my-2 w-8" />

          {/* Stroke Width */}
          <div className="px-2">
            <Select value={strokeWidth.toString()} onValueChange={(v) => setStrokeWidth(parseInt(v))}>
              <SelectTrigger className="w-10 h-8 px-2">
                <span className="text-xs">{strokeWidth}px</span>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 8, 12].map((w) => (
                  <SelectItem key={w} value={w.toString()}>{w}px</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-auto flex flex-col gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Undo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Redo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Redo (Ctrl+Shift+Z)</TooltipContent>
            </Tooltip>
            <Separator className="my-2 w-8" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={showGrid ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Toggle Grid</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          <div className="h-12 border-b flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold">Project Brainstorm</h2>
              <Badge variant="outline">Draft</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>3 collaborators</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded-lg p-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.max(25, zoom - 25))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm w-12 text-center">{zoom}%</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant={presentationMode ? 'default' : 'outline'}
                size="sm"
                className="gap-1.5"
                onClick={() => setPresentationMode(!presentationMode)}
              >
                <Presentation className="h-4 w-4" />
                Present
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Canvas */}
          <div
            className={cn(
              "flex-1 overflow-auto bg-white relative",
              presentationMode && "fixed inset-0 z-50"
            )}
            style={{
              backgroundImage: showGrid ? `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              ` : 'none',
              backgroundSize: '20px 20px',
            }}
          >
            {/* Mock elements */}
            <div className="absolute" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
              {/* Sticky Notes */}
              {elements.filter(e => e.type === 'sticky').map((el: any) => (
                <motion.div
                  key={el.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute w-40 p-3 shadow-lg cursor-move select-none"
                  style={{
                    left: el.x,
                    top: el.y,
                    backgroundColor: el.color,
                    transform: `rotate(${el.rotation}deg)`,
                  }}
                >
                  <p className="text-sm font-medium text-gray-800">{el.text}</p>
                </motion.div>
              ))}

              {/* Title Text */}
              {elements.filter(e => e.type === 'text').map((el: any) => (
                <div
                  key={el.id}
                  className="absolute font-bold"
                  style={{
                    left: el.x,
                    top: el.y,
                    color: el.color,
                    fontSize: el.fontSize,
                  }}
                >
                  {el.text}
                </div>
              ))}

              {/* Shapes */}
              {elements.filter(e => e.type === 'circle').map((el: any) => (
                <div
                  key={el.id}
                  className="absolute rounded-full border-2"
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.size,
                    height: el.size,
                    borderColor: el.color,
                    backgroundColor: `${el.color}20`,
                  }}
                />
              ))}

              {elements.filter(e => e.type === 'rectangle').map((el: any) => (
                <div
                  key={el.id}
                  className="absolute border-2 rounded"
                  style={{
                    left: el.x,
                    top: el.y,
                    width: el.width,
                    height: el.height,
                    borderColor: el.color,
                    backgroundColor: `${el.color}20`,
                  }}
                />
              ))}

              {/* Arrow connecting stickies */}
              <svg className="absolute" style={{ left: 0, top: 0, width: 1000, height: 500 }}>
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                  </marker>
                </defs>
                <path
                  d="M 240 130 L 280 140"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 440 140 L 480 130"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
                <path
                  d="M 640 130 L 680 150"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </svg>
            </div>

            {/* AI Assistant Button */}
            <div className="absolute bottom-4 right-4">
              <Button className="gap-2 rounded-full shadow-lg">
                <Sparkles className="h-4 w-4" />
                AI Ideas
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-64 border-l bg-muted/30 p-4">
          <h3 className="font-semibold mb-4">Properties</h3>

          <div className="space-y-4">
            {/* Element Type */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Selected Element</p>
              <Badge variant="outline" className="justify-center w-full py-2">
                <StickyNote className="h-4 w-4 mr-2" />
                Sticky Note
              </Badge>
            </div>

            {/* Position */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Position</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="X" value="100" className="h-8" />
                <Input placeholder="Y" value="100" className="h-8" />
              </div>
            </div>

            {/* Size */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Size</p>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="W" value="160" className="h-8" />
                <Input placeholder="H" value="120" className="h-8" />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Rotation</p>
              <Input placeholder="degrees" value="-3°" className="h-8" />
            </div>

            {/* Color */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Color</p>
              <div className="flex flex-wrap gap-1">
                {stickyColors.map((color) => (
                  <button
                    key={color}
                    className="h-8 w-8 rounded border-2 border-transparent hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">Actions</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Duplicate
                </Button>
                <Button variant="outline" size="icon" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <p className="text-sm font-medium">AI Suggestions</p>
              </div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Generate similar ideas
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Palette className="h-4 w-4 text-blue-500" />
                  Suggest color scheme
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      </TooltipProvider>
    </AppShell>
  );
}
