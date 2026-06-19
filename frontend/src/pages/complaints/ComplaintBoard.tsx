import { useState, useEffect } from "react";
import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useComplaints, useUpdateComplaintStatus } from "@/hooks/useComplaints";
import type { Complaint } from "@/hooks/useComplaints";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from "sonner";

// Sortable Complaint Card Component
function SortableComplaintCard({ complaint }: { complaint: Complaint }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: complaint.id, data: { ...complaint } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className={cn("border-gray-200 bg-white cursor-grab active:cursor-grabbing hover:border-accent/50 hover:shadow-md transition-all group", glassClasses.card)}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border",
              complaint.priority === "CRITICAL" ? "bg-red-50 text-red-700 border-red-200" :
              complaint.priority === "HIGH" ? "bg-orange-50 text-orange-700 border-orange-200" :
              complaint.priority === "MEDIUM" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
              "bg-blue-50 text-blue-700 border-blue-200"
            )}>
              {complaint.priority}
            </span>
            <span className="text-xs text-gray-400 font-mono font-medium">{complaint.id.substring(0, 8)}...</span>
          </div>
          <h4 className="font-bold mb-3 text-gray-900 group-hover:text-accent transition-colors leading-tight">{complaint.title}</h4>
          
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-700 border border-gray-200">
                {complaint.tenantName.charAt(0)}
              </div>
              {complaint.roomNumber}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {new Date(complaint.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ComplaintBoard() {
  const { data: serverComplaints, isLoading, error } = useComplaints();
  const updateStatus = useUpdateComplaintStatus();
  
  const [localComplaints, setLocalComplaints] = useState<Complaint[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (serverComplaints) {
      setLocalComplaints(serverComplaints);
    }
  }, [serverComplaints]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const boardColumns = [
    { id: "OPEN", title: "Open" },
    { id: "IN_PROGRESS", title: "In Progress" },
    { id: "RESOLVED", title: "Resolved" },
    { id: "CLOSED", title: "Closed" }
  ];

  const getComplaintsByStatus = (status: string) => {
    return localComplaints.filter(c => c.status === status) || [];
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // determine if we dropped over a column or an item
    const activeId = active.id;
    const overId = over.id;

    // If over a container (the id matches a column id)
    const overColumn = boardColumns.find(c => c.id === overId)?.id;
    // If over an item
    const overItemStatus = localComplaints.find(c => c.id === overId)?.status;

    const newStatus = overColumn || overItemStatus;
    
    if (newStatus) {
      const activeComplaint = localComplaints.find(c => c.id === activeId);
      if (activeComplaint && activeComplaint.status !== newStatus) {
        // Optimistic update
        setLocalComplaints(prev => prev.map(c => 
          c.id === activeId ? { ...c, status: newStatus as string } : c
        ));

        // API Call
        updateStatus.mutate({ id: activeId as string, status: newStatus as string }, {
          onSuccess: () => {
            toast.success("Status updated");
          },
          onError: () => {
            toast.error("Failed to update status");
            // Revert on error
            setLocalComplaints(serverComplaints || []);
          }
        });
      }
    }
  };

  const activeComplaint = activeId ? localComplaints.find(c => c.id === activeId) : null;

  if (isLoading) return <div className="p-10 flex justify-center"><div className="animate-spin w-10 h-10 border-4 border-accent border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="p-10 text-red-500">Failed to load complaints</div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">Complaint Center</h1>
          <p className="text-gray-500">Manage SLA-driven maintenance and tenant tickets.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className={cn("rounded-xl border-gray-200 bg-white text-gray-900", glassClasses.base)}>
            <Clock className="w-4 h-4 mr-2" /> SLA Report
          </Button>
          <Button className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 px-6">
            <Plus className="w-4 h-4 mr-2" /> New Ticket
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-6 min-w-max h-full">
            {boardColumns.map((col, i) => {
              const colComplaints = getComplaintsByStatus(col.id);
              return (
                <motion.div 
                  key={col.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-80 flex flex-col h-full max-h-[70vh] bg-gray-50/50 p-4 rounded-3xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{col.title}</h3>
                      <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{colComplaints.length}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-200 text-gray-500">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <SortableContext 
                    id={col.id}
                    items={colComplaints.map(c => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                      {colComplaints.map((item) => (
                        <SortableComplaintCard key={item.id} complaint={item} />
                      ))}
                    </div>
                  </SortableContext>
                </motion.div>
              );
            })}
          </div>
        </div>
        
        <DragOverlay>
          {activeComplaint ? <SortableComplaintCard complaint={activeComplaint} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
