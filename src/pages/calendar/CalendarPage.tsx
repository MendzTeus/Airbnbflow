// src/pages/calendar/CalendarPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  isSameMonth,
  addDays,
  parseISO,
  isAfter,
  isBefore,
  formatISO,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  subDays
} from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  ArrowUpDown,
  Filter,
  Building as BuildingIcon,
  User as UserIcon,
  Calendar as CalendarLucide,
  ListChecks,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/use-translation";
import { useData } from "@/hooks/use-data"; // Importar useData
import { useToast } from "@/hooks/use-toast"; // Importar useToast
import { CalendarEvent, Property, Employee } from "@/types";
import { v4 as uuidv4 } from "uuid"; // Para gerar IDs no front-end, se necessário (o Supabase pode gerar no backend)

// Removido mock data, agora buscado via useData
// const MOCK_EVENTS: CalendarEvent[] = [...];
// const MOCK_PROPERTIES: Property[] = [...];
// const MOCK_EMPLOYEES: Employee[] = [...];

// Calendar view options
type ViewType = "month" | "week" | "day";
type FilterType = {
  properties: string[];
  employees: string[];
  types: ("cleaning" | "maintenance")[];
};

type QuickAddEventType = {
  title: string;
  propertyId: string;
  assignedTo: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: "cleaning" | "maintenance";
  notes: string;
};

function CalendarPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  // Obter dados e funções de manipulação do useData
  const { events, properties, employees, addEvent, updateEvent, removeEvent } = useData();

  // Converter objetos em arrays para facilitar o uso nos componentes de lista/dropdown
  const allEvents = useMemo(() => Object.values(events), [events]);
  const allProperties = useMemo(() => Object.values(properties), [properties]);
  const allEmployees = useMemo(() => Object.values(employees), [employees]);

  // Calendar state
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewType>("month");
  const [filters, setFilters] = useState<FilterType>({
    properties: [],
    employees: [],
    types: ["cleaning", "maintenance"],
  });

  // Quick add event dialog
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddEvent, setQuickAddEvent] = useState<QuickAddEventType>({
    title: "",
    propertyId: "",
    assignedTo: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    type: "cleaning",
    notes: "",
  });

  // Event detail dialog
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState(false);

  // Edit event state (agora usado para preencher o formulário de detalhes/edição)
  const [editedEvent, setEditedEvent] = useState<QuickAddEventType | null>(null);


  // Helper function to get property by ID
  const getPropertyById = (id: string) => {
    return allProperties.find(p => p.id === id) || null;
  };

  // Helper function to get employee by ID
  const getEmployeeById = (id: string) => {
    return allEmployees.find(e => e.id === id) || null;
  };

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // Filter by property
      if (filters.properties.length > 0 && !filters.properties.includes(event.propertyId)) {
        return false;
      }

      // Filter by employee
      if (filters.employees.length > 0 && event.assignedTo && !filters.employees.includes(event.assignedTo)) {
        return false;
      }

      // Filter by type
      if (filters.types.length > 0 && !filters.types.includes(event.type)) {
        return false;
      }

      return true;
    });
  }, [allEvents, filters]);

  // Get events for the current view
  const currentViewEvents = useMemo(() => {
    switch (view) {
      case "month": {
        const start = startOfMonth(date);
        const end = endOfMonth(date);
        return filteredEvents.filter(event => {
          const eventStart = parseISO(event.startDate);
          return isWithinInterval(eventStart, { start, end });
        });
      }

      case "week": {
        const weekStart = startOfWeek(date, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
        return filteredEvents.filter(event => {
          const eventStart = parseISO(event.startDate);
          return isWithinInterval(eventStart, { start: weekStart, end: weekEnd });
        });
      }

      case "day":
        return filteredEvents.filter(event => {
          const eventStart = parseISO(event.startDate);
          return isSameDay(eventStart, date);
        });

      default:
        return [];
    }
  }, [filteredEvents, date, view]);

  // Calendar navigation methods
  const navigateNext = () => {
    switch (view) {
      case "month":
        setDate(addMonths(date, 1));
        break;
      case "week":
        setDate(addWeeks(date, 1));
        break;
      case "day":
        setDate(addDays(date, 1));
        break;
    }
  };

  const navigatePrev = () => {
    switch (view) {
      case "month":
        setDate(subMonths(date, 1));
        break;
      case "week":
        setDate(subWeeks(date, 1));
        break;
      case "day":
        setDate(subDays(date, 1));
        break;
    }
  };

  const navigateToday = () => {
    setDate(new Date());
  };

  // Format date range for display
  const getDateRangeText = () => {
    switch (view) {
      case "month":
        return format(date, "MMMM yyyy");
      case "week": {
        const weekStart = startOfWeek(date, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      }
      case "day":
        return format(date, "EEEE, MMMM d, yyyy");
      default:
        return "";
    }
  };

  // Handle quick add event submission
  const handleQuickAddSubmit = async () => {
    if (!quickAddEvent.title || !quickAddEvent.propertyId || !quickAddEvent.type) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    // Parse time strings to create Date objects
    const [startHours, startMinutes] = quickAddEvent.startTime.split(":").map(Number);
    const [endHours, endMinutes] = quickAddEvent.endTime.split(":").map(Number);

    const startDate = setMinutes(setHours(quickAddEvent.date, startHours), startMinutes);
    const endDate = setMinutes(setHours(quickAddEvent.date, endHours), endMinutes);

    // Ensure end time is after start time
    if (isAfter(startDate, endDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Time Range",
        description: "End time must be after start time.",
      });
      return;
    }

    const newEvent: CalendarEvent = {
      id: uuidv4(), // Gerar UUID no frontend, ou remover se o Supabase gerar automaticamente
      title: quickAddEvent.title,
      propertyId: quickAddEvent.propertyId,
      assignedTo: quickAddEvent.assignedTo || undefined,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type: quickAddEvent.type,
      notes: quickAddEvent.notes,
      createdAt: new Date().toISOString(), // Será sobrescrito pelo Supabase se tiver default `now()`
      updatedAt: new Date().toISOString(), // Será sobrescrito pelo Supabase se tiver default `now()`
    };

    try {
      await addEvent(newEvent); // Usar a função addEvent do useData

      // Reset form and close dialog
      setQuickAddEvent({
        title: "",
        propertyId: "",
        assignedTo: "",
        date: new Date(),
        startTime: "09:00",
        endTime: "10:00",
        type: "cleaning",
        notes: "",
      });
      setQuickAddOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle event click to show details
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditedEvent({
      title: event.title,
      propertyId: event.propertyId,
      assignedTo: event.assignedTo || "",
      date: parseISO(event.startDate),
      startTime: format(parseISO(event.startDate), "HH:mm"),
      endTime: format(parseISO(event.endDate), "HH:mm"),
      type: event.type,
      notes: event.notes || "",
    });
    setEventDetailOpen(true);
  };

  // Handle edit event submission
  const handleEditSubmit = async () => {
    if (!selectedEvent || !editedEvent) return;

    if (!editedEvent.title || !editedEvent.propertyId || !editedEvent.type) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    // Parse time strings to create Date objects
    const [startHours, startMinutes] = editedEvent.startTime.split(":").map(Number);
    const [endHours, endMinutes] = editedEvent.endTime.split(":").map(Number);

    const startDate = setMinutes(setHours(editedEvent.date, startHours), startMinutes);
    const endDate = setMinutes(setHours(editedEvent.date, endHours), endMinutes);

    // Ensure end time is after start time
    if (isAfter(startDate, endDate)) {
      toast({
        variant: "destructive",
        title: "Invalid Time Range",
        description: "End time must be after start time.",
      });
      return;
    }

    const updatedEvent: CalendarEvent = {
      ...selectedEvent, // Manter o ID original
      title: editedEvent.title,
      propertyId: editedEvent.propertyId,
      assignedTo: editedEvent.assignedTo || undefined,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type: editedEvent.type,
      notes: editedEvent.notes,
      // createdAt e updatedAt serão gerenciados pelo Supabase
    };

    try {
      await updateEvent(updatedEvent); // Usar a função updateEvent do useData

      // Close dialog
      setEventDetailOpen(false);
      setSelectedEvent(null);
      setEditedEvent(null);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      await removeEvent(selectedEvent.id); // Usar a função removeEvent do useData

      // Close dialog
      setEventDetailOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error(error);
    }
  };

  // Render the calendar based on current view
  const renderCalendar = () => {
    switch (view) {
      case "month":
        return renderMonthView();
      case "week":
        return renderWeekView();
      case "day":
        return renderDayView();
      default:
        return null;
    }
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-px bg-muted rounded-md overflow-hidden">
        {/* Day headers */}
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, i) => (
          <div key={i} className="bg-card p-2 text-center font-medium">
            {day.substring(0, 3)}
          </div>
        ))}

        {/* Calendar cells */}
        {days.map((day, i) => {
          // Get events for this day
          const dayEvents = filteredEvents.filter(event => {
            const eventStart = parseISO(event.startDate);
            return isSameDay(eventStart, day);
          });

          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, date);

          return (
            <div
              key={i}
              className={cn(
                "bg-card min-h-[100px] p-2 relative",
                !isCurrentMonth && "text-muted-foreground",
                "flex flex-col"
              )}
              onClick={() => {
                setDate(day);
                setQuickAddEvent(prev => ({
                  ...prev,
                  date: day
                }));
              }}
            >
              <div className={cn(
                "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs",
                isToday && "bg-primary text-primary-foreground font-medium"
              )}>
                {format(day, "d")}
              </div>

              <div className="mt-7 space-y-1">
                {dayEvents.slice(0, 3).map((event, index) => (
                  <div
                    key={event.id}
                    className={cn(
                      "text-xs px-1 py-0.5 rounded truncate cursor-pointer text-white",
                      event.type === "cleaning" ? "bg-blue-500" : "bg-red-500"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    {format(parseISO(event.startDate), "HH:mm")} - {event.title}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    + {dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Create time slots from 7AM to 8PM
    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7);

    return (
      <div className="overflow-auto">
        <div className="grid grid-cols-8 gap-px bg-muted min-w-[800px]">
          {/* Time column */}
          <div className="bg-card p-2 text-center font-medium">
            Time
          </div>

          {/* Day headers */}
          {days.map((day, i) => (
            <div key={i} className="bg-card p-2 text-center font-medium">
              <div className="font-normal text-sm text-muted-foreground">
                {format(day, "EEE")}
              </div>
              <div className={cn(isSameDay(day, new Date()) && "text-primary font-bold")}>
                {format(day, "d")}
              </div>
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((hour) => (
            <React.Fragment key={hour}>
              {/* Time label */}
              <div className="bg-card p-2 text-right text-sm text-muted-foreground">
                {hour}:00
              </div>

              {/* Day cells */}
              {days.map((day, dayIndex) => {
                const dayStart = setHours(day, hour);
                const dayEnd = setHours(day, hour + 1);

                // Get events for this time slot
                const slotEvents = filteredEvents.filter(event => {
                  const eventStart = parseISO(event.startDate);
                  const eventEnd = parseISO(event.endDate);

                  return (
                    isSameDay(eventStart, day) &&
                    getHours(eventStart) <= hour &&
                    getHours(eventEnd) > hour
                  );
                });

                return (
                  <div
                    key={dayIndex}
                    className="bg-card min-h-[60px] p-1 relative border-t border-muted"
                    onClick={() => {
                      setDate(day);
                      setQuickAddEvent(prev => ({
                        ...prev,
                        date: day,
                        startTime: `${hour < 10 ? '0' : ''}${hour}:00`, // Formatar HH:mm
                        endTime: `${(hour + 1) < 10 ? '0' : ''}${hour + 1}:00`, // Formatar HH:mm
                      }));
                      setQuickAddOpen(true);
                    }}
                  >
                    {slotEvents.map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "px-1 py-0.5 rounded text-xs cursor-pointer text-white mb-1",
                          event.type === "cleaning" ? "bg-blue-500" : "bg-red-500"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                      >
                        {format(parseISO(event.startDate), "HH:mm")} - {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    // Create time slots from 7AM to 8PM
    const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7);

    return (
      <div className="overflow-auto">
        <div className="grid grid-cols-2 gap-px bg-muted">
          {/* Time slots */}
          {timeSlots.map((hour) => {
            const hourStart = setHours(date, hour);
            const hourEnd = setHours(date, hour + 1);

            // Get events for this time slot
            const slotEvents = filteredEvents.filter(event => {
              const eventStart = parseISO(event.startDate);
              const eventEnd = parseISO(event.endDate);

              return (
                isSameDay(eventStart, date) &&
                getHours(eventStart) <= hour &&
                getHours(eventEnd) > hour
              );
            });

            return (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div className="bg-card p-3 text-right text-sm text-muted-foreground">
                  {hour}:00
                </div>

                {/* Events */}
                <div
                  className="bg-card p-2 min-h-[80px] border-t border-muted"
                  onClick={() => {
                    setQuickAddEvent(prev => ({
                      ...prev,
                      date,
                      startTime: `${hour < 10 ? '0' : ''}${hour}:00`,
                      endTime: `${(hour + 1) < 10 ? '0' : ''}${hour + 1}:00`,
                    }));
                    setQuickAddOpen(true);
                  }}
                >
                  {slotEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "p-2 rounded cursor-pointer text-white mb-2",
                        event.type === "cleaning" ? "bg-blue-500" : "bg-red-500"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event);
                      }}
                    >
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(parseISO(event.startDate), "HH:mm")} - {format(parseISO(event.endDate), "HH:mm")}
                      </div>
                      {event.assignedTo && (
                        <div className="text-sm mt-1">
                          Assigned: {getEmployeeById(event.assignedTo)?.name || "Unknown"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("calendar.title")}</h2>
          <p className="text-muted-foreground mt-2">
            {t("calendar.description")}
          </p>
        </div>
        <Button asChild>
          <Link to="/calendar/new">
            <Plus className="mr-2 h-4 w-4" /> New Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={navigatePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={navigateToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h3 className="text-lg font-medium ml-2">{getDateRangeText()}</h3>
            </div>

            <div className="flex items-center space-x-4">
              <Tabs value={view} onValueChange={(v) => setView(v as ViewType)} className="w-fit">
                <TabsList>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
              </Tabs>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Event Type</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={filters.types.includes("cleaning")}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        types: checked
                          ? [...prev.types, "cleaning"]
                          : prev.types.filter(t => t !== "cleaning")
                      }));
                    }}
                  >
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
                    Cleaning
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.types.includes("maintenance")}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        types: checked
                          ? [...prev.types, "maintenance"]
                          : prev.types.filter(t => t !== "maintenance")
                      }));
                    }}
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                    Maintenance
                  </DropdownMenuCheckboxItem>

                  {allProperties.length > 0 && (
                    <>
                      <DropdownMenuLabel className="mt-4">Properties</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allProperties.map(property => (
                        <DropdownMenuCheckboxItem
                          key={property.id}
                          checked={filters.properties.includes(property.id)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              properties: checked
                                ? [...prev.properties, property.id]
                                : prev.properties.filter(id => id !== property.id)
                            }));
                          }}
                        >
                          <BuildingIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          {property.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </>
                  )}

                  {allEmployees.length > 0 && (
                    <>
                      <DropdownMenuLabel className="mt-4">Employees</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {allEmployees.map(employee => (
                        <DropdownMenuCheckboxItem
                          key={employee.id}
                          checked={filters.employees.includes(employee.id)}
                          onCheckedChange={(checked) => {
                            setFilters(prev => ({
                              ...prev,
                              employees: checked
                                ? [...prev.employees, employee.id]
                                : prev.employees.filter(id => id !== employee.id)
                            }));
                          }}
                        >
                          <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          {employee.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </>
                  )}

                  <div className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setFilters({
                        properties: [],
                        employees: [],
                        types: ["cleaning", "maintenance"],
                      })}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" onClick={() => setQuickAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {renderCalendar()}
        </CardContent>
      </Card>

      {/* Quick Add Event Dialog */}
      <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event in your calendar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="Event Title"
                value={quickAddEvent.title}
                onChange={(e) => setQuickAddEvent(prev => ({ ...prev, title: e.target.value }))}
              />
              <Select
                value={quickAddEvent.propertyId}
                onValueChange={(value) => setQuickAddEvent(prev => ({ ...prev, propertyId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  {allProperties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={quickAddEvent.assignedTo}
                onValueChange={(value) => setQuickAddEvent(prev => ({ ...prev, assignedTo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Notes"
                value={quickAddEvent.notes}
                onChange={(e) => setQuickAddEvent(prev => ({ ...prev, notes: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={quickAddEvent.startTime}
                  onChange={(e) => setQuickAddEvent(prev => ({ ...prev, startTime: e.target.value }))}
                />
                <Input
                  type="time"
                  value={quickAddEvent.endTime}
                  onChange={(e) => setQuickAddEvent(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <Select
                value={quickAddEvent.type}
                onValueChange={(value: "cleaning" | "maintenance") => setQuickAddEvent(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleQuickAddSubmit}>Add Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event detail dialog */}
      <Dialog open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View and edit the details of your event.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="Event Title"
                value={editedEvent?.title || ""}
                onChange={(e) => setEditedEvent(prev => (prev ? { ...prev, title: e.target.value } : null))}
              />
              <Select
                value={editedEvent?.propertyId || ""}
                onValueChange={(value) => setEditedEvent(prev => (prev ? { ...prev, propertyId: value } : null))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  {allProperties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={editedEvent?.assignedTo || ""}
                onValueChange={(value) => setEditedEvent(prev => (prev ? { ...prev, assignedTo: value } : null))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Notes"
                value={editedEvent?.notes || ""}
                onChange={(e) => setEditedEvent(prev => (prev ? { ...prev, notes: e.target.value } : null))}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={editedEvent?.startTime || "09:00"}
                  onChange={(e) => setEditedEvent(prev => (prev ? { ...prev, startTime: e.target.value } : null))}
                />
                <Input
                  type="time"
                  value={editedEvent?.endTime || "10:00"}
                  onChange={(e) => setEditedEvent(prev => (prev ? { ...prev, endTime: e.target.value } : null))}
                />
              </div>
              <Select
                value={editedEvent?.type || "cleaning"}
                onValueChange={(value: "cleaning" | "maintenance") => setEditedEvent(prev => (prev ? { ...prev, type: value } : null))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
            <Button variant="destructive" onClick={handleDeleteEvent}>Delete Event</Button>
            {/* Removido o botão Cancelar do modo de edição, pois o onOpenChange do Dialog cuida disso */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CalendarPage;
