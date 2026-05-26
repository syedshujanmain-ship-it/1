// UI Customization Page - Customize icons, colors, and layout with DRAG & DROP
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Palette, Layout, Eye, EyeOff, RotateCcw, Save, Lock, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useUICustomizationContext } from '@/contexts/UICustomizationContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Icon Item Component
function SortableIconItem({ icon, onUpdate, customization }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: icon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSizeClass = (size: number) => {
    const sizeMap = {
      1: 'w-2 h-2',
      2: 'w-2.5 h-2.5',
      3: 'w-3 h-3',
      4: 'w-4 h-4',
      5: 'w-5 h-5',
    };
    return sizeMap[size as keyof typeof sizeMap] || 'w-3 h-3';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'space-y-4 p-4 border rounded-lg bg-card',
        isDragging && 'shadow-lg ring-2 ring-primary'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          <div
            className={cn(
              'rounded-md flex items-center justify-center',
              getSizeClass(icon.size),
              'bg-muted'
            )}
            style={{ color: icon.color }}
          >
            <div className="w-full h-full rounded" style={{ backgroundColor: icon.color }} />
          </div>
          <div>
            <h3 className="font-semibold">{icon.label}</h3>
            <p className="text-sm text-muted-foreground">ID: {icon.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={icon.visible}
            onCheckedChange={(checked) =>
              onUpdate(icon.id, { visible: checked })
            }
          />
          {icon.visible ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Size Control */}
        <div className="space-y-2">
          <Label>Size: {icon.size}</Label>
          <Slider
            value={[icon.size]}
            onValueChange={([value]) =>
              onUpdate(icon.id, { size: value })
            }
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            1 = Tiny, 3 = Default, 5 = Large
          </p>
        </div>

        {/* Color Control */}
        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={icon.color.startsWith('#') ? icon.color : '#3b82f6'}
              onChange={(e) =>
                onUpdate(icon.id, { color: e.target.value })
              }
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={icon.color}
              onChange={(e) =>
                onUpdate(icon.id, { color: e.target.value })
              }
              placeholder="Color value"
              className="flex-1"
            />
          </div>
        </div>

        {/* Label Control */}
        <div className="space-y-2">
          <Label>Label</Label>
          <Input
            type="text"
            value={icon.label}
            onChange={(e) =>
              onUpdate(icon.id, { label: e.target.value })
            }
            placeholder="Icon label"
          />
        </div>

        {/* Order Display */}
        <div className="space-y-2">
          <Label>Order: {icon.order}</Label>
          <p className="text-sm text-muted-foreground">
            Drag to reorder icons
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UICustomizationPage() {
  const navigate = useNavigate();
  const {
    customization,
    updateIconCustomization,
    updateColors,
    updateLayout,
    resetToDefaults,
    getSortedIcons,
    forceUpdate,
  } = useUICustomizationContext();

  const [activeTab, setActiveTab] = useState<'icons' | 'colors' | 'layout'>('icons');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const sortedIcons = getSortedIcons();
      const oldIndex = sortedIcons.findIndex((icon) => icon.id === active.id);
      const newIndex = sortedIcons.findIndex((icon) => icon.id === over.id);

      const newOrder = arrayMove(sortedIcons, oldIndex, newIndex);

      // Update order for all icons
      newOrder.forEach((icon, index) => {
        updateIconCustomization(icon.id as any, { order: index + 1 });
      });

      toast.success('Icons reordered!');
      forceUpdate();
    }
  };

  const handleReset = () => {
    if (confirm('Reset all customizations to default? This cannot be undone.')) {
      resetToDefaults();
      toast.success('UI customization reset to defaults');
      forceUpdate();
    }
  };

  const handleSave = () => {
    toast.success('UI customization saved successfully!');
    forceUpdate();
  };

  return (
    <>
      <Helmet>
        <title>UI Customization - Red Whale V1</title>
      </Helmet>

      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Palette className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">UI Customization</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <div className="container max-w-6xl py-8 px-4 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              <Button
                variant={activeTab === 'icons' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('icons')}
                className="rounded-b-none"
              >
                <Layout className="mr-2 h-4 w-4" />
                Icons
              </Button>
              <Button
                variant={activeTab === 'colors' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('colors')}
                className="rounded-b-none"
              >
                <Palette className="mr-2 h-4 w-4" />
                Colors
              </Button>
              <Button
                variant={activeTab === 'layout' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('layout')}
                className="rounded-b-none"
              >
                <Layout className="mr-2 h-4 w-4" />
                Layout
              </Button>
            </div>

            {/* Icons Tab */}
            {activeTab === 'icons' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Header Icons Customization</CardTitle>
                    <CardDescription>
                      Customize the appearance and behavior of header icons. <strong>Drag the grip icon to reorder.</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={getSortedIcons().map(icon => icon.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {getSortedIcons().map((icon) => (
                          <SortableIconItem
                            key={icon.id}
                            icon={icon}
                            onUpdate={updateIconCustomization}
                            customization={customization}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Scheme</CardTitle>
                    <CardDescription>
                      Customize the color palette of the application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(customization.colors).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label className="capitalize">{key}</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={value.startsWith('#') ? value : '#3b82f6'}
                            onChange={(e) =>
                              updateColors({ [key]: e.target.value })
                            }
                            className="w-20 h-10"
                          />
                          <Input
                            type="text"
                            value={value}
                            onChange={(e) =>
                              updateColors({ [key]: e.target.value })
                            }
                            placeholder="Color value (hex or hsl)"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Layout Tab */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout Settings</CardTitle>
                    <CardDescription>
                      Adjust spacing, sizing, and layout properties.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Header Height */}
                    <div className="space-y-2">
                      <Label>Header Height: {customization.layout.headerHeight}px</Label>
                      <Slider
                        value={[customization.layout.headerHeight]}
                        onValueChange={([value]) =>
                          updateLayout({ headerHeight: value })
                        }
                        min={48}
                        max={96}
                        step={4}
                        className="w-full"
                      />
                    </div>

                    {/* Icon Spacing */}
                    <div className="space-y-2">
                      <Label>Icon Spacing: {customization.layout.iconSpacing}px</Label>
                      <Slider
                        value={[customization.layout.iconSpacing]}
                        onValueChange={([value]) =>
                          updateLayout({ iconSpacing: value })
                        }
                        min={0}
                        max={16}
                        step={1}
                        className="w-full"
                      />
                    </div>

                    {/* Border Radius */}
                    <div className="space-y-2">
                      <Label>Border Radius: {customization.layout.borderRadius}px</Label>
                      <Slider
                        value={[customization.layout.borderRadius]}
                        onValueChange={([value]) =>
                          updateLayout({ borderRadius: value })
                        }
                        min={0}
                        max={24}
                        step={2}
                        className="w-full"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Protected Elements Info */}
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-amber-600" />
                  Protected Elements
                </CardTitle>
                <CardDescription>
                  These elements cannot be removed or edited.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                    <span className="font-semibold">Creator Name</span>
                    <span className="text-primary font-bold">{customization.protected.creatorName}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The creator's name is protected and will always remain visible.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
