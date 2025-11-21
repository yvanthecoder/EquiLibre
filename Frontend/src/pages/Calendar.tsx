import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useCreateEvent, useEvents } from '../hooks/useEvents';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import {
  format,
  formatISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { classService } from '../services/api.service';
import { useNavigate } from 'react-router-dom';

const academicEvents = [
  {
    id: 'AC-EXAMS-1',
    title: 'Période d’évaluations',
    description: 'Contrôles intermédiaires',
    startDate: '2025-01-10T08:00:00',
    endDate: '2025-01-20T18:00:00',
    classId: '',
    type: 'EXAM' as const,
  },
  {
    id: 'AC-SOUT-1',
    title: 'Soutenances semestrielles',
    description: 'Présentations en école',
    startDate: '2025-02-05T08:00:00',
    endDate: '2025-02-07T18:00:00',
    classId: '',
    type: 'EXAM' as const,
  },
  {
    id: 'AC-VISITE-1',
    title: 'Visites en entreprise',
    description: 'Rencontres tuteur/maître',
    startDate: '2025-03-01T08:00:00',
    endDate: '2025-03-15T18:00:00',
    classId: '',
    type: 'MEETING' as const,
  },
];

export const Calendar: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Classe active (fallback si l'utilisateur n'a pas classId direct)
  const [activeClassId, setActiveClassId] = useState<string | undefined>(user?.classId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'COURSE' | 'EXAM' | 'DEADLINE' | 'MEETING'>('MEETING');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [availableClasses, setAvailableClasses] = useState<{ id: string; name: string }[]>([]);
  const [showAcademic, setShowAcademic] = useState<boolean>(true);

  const { data: events, isLoading } = useEvents(activeClassId || user?.classId);
  const { createEvent, isCreating } = useCreateEvent();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const combinedEvents = useMemo(() => {
    const base = events || [];
    return showAcademic ? [...base, ...academicEvents] : base;
  }, [events, showAcademic]);

  const getEventsForDay = (day: Date) => {
    const target = format(day, 'yyyy-MM-dd');
    return combinedEvents?.filter((event) => format(new Date(event.startDate), 'yyyy-MM-dd') === target) || [];
  };

  const sortedEvents = useMemo(() => {
    return (combinedEvents || []).slice().sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [combinedEvents]);

  const dayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const target = format(selectedDay, 'yyyy-MM-dd');
    return combinedEvents?.filter((event) => format(new Date(event.startDate), 'yyyy-MM-dd') === target) || [];
  }, [selectedDay, combinedEvents]);

  const getEventTypeColor = (type: string) => {
    const colors = {
      COURSE: 'bg-blue-100 text-blue-800 border-blue-200',
      EXAM: 'bg-red-100 text-red-800 border-red-200',
      DEADLINE: 'bg-orange-100 text-orange-800 border-orange-200',
      MEETING: 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEventTypeLabel = (type: string) => {
    const labels = {
      COURSE: 'Cours',
      EXAM: 'Examen',
      DEADLINE: 'Échéance',
      MEETING: 'Réunion',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const handleOpenCreate = () => {
    if (!activeClassId) {
      toast.error('Aucune classe associée, impossible de créer un événement.');
      return;
    }
    const baseDate = selectedDay || new Date();
    setDate(format(baseDate, 'yyyy-MM-dd'));
    setStartTime('09:00');
    setEndTime('10:00');
    setTitle('');
    setDescription('');
    setEventType('MEETING');
    setShowCreateModal(true);
  };

  const handleCreateEvent = () => {
    if (!title.trim()) {
      toast.error('Titre requis');
      return;
    }
    if (!activeClassId) {
      toast.error('Classe manquante');
      return;
    }

    const startDateString = `${date}T${startTime}:00`;
    const endDateString = `${date}T${endTime}:00`;

    if (new Date(endDateString) <= new Date(startDateString)) {
      toast.error("L'heure de fin doit être après le début");
      return;
    }

    createEvent(
      {
        title: title.trim(),
        description: description.trim(),
        startDate: startDateString,
        endDate: endDateString,
        type: eventType,
        classId: activeClassId,
      },
      {
        onSuccess: () => {
          toast.success('Événement créé');
          queryClient.invalidateQueries({ queryKey: ['events', activeClassId] });
          setShowCreateModal(false);
        },
        onError: (err: any) => {
          const message = err.response?.data?.message || 'Erreur lors de la création';
          toast.error(message);
        },
      }
    );
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setShowDayModal(true);
  };

  // Récupérer une classe de fallback pour les tuteurs/admin sans classId direct
  React.useEffect(() => {
    const loadClasses = async () => {
      if (user?.classId) {
        setActiveClassId(user.classId);
        return;
      }
      try {
        const classes = await classService.getMyClasses();
        setAvailableClasses(classes);
        if (classes.length > 0) {
          setActiveClassId(classes[0].id);
        }
      } catch (err) {
        console.error('Impossible de charger les classes', err);
      }
    };
    loadClasses();
  }, [user?.classId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← Retour</Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendrier</h1>
              <p className="text-gray-600">Consultez vos cours, examens et échéances</p>
            </div>
          </div>
        <div className="flex items-center gap-3">
          {availableClasses.length > 1 && (
            <select
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                {availableClasses.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            )}
            <Button onClick={handleOpenCreate}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Nouvel événement
            </Button>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showAcademic}
                onChange={(e) => setShowAcademic(e.target.checked)}
                className="rounded border-gray-300"
              />
              Afficher calendrier académique
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(currentDate, 'MMMM yyyy', { locale: fr })}
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
                    }
                  >
                    ←
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                    Aujourd&apos;hui
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
                    }
                  >
                    →
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day) => {
                  const dayEventsList = getEventsForDay(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isDayToday = isToday(day);
                  const hasEvents = dayEventsList.length > 0;

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[110px] p-2 border ${
                        hasEvents ? 'border-blue-300 bg-blue-50/40' : 'border-gray-200'
                      } ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${isDayToday ? 'ring-2 ring-blue-500' : ''}`}
                      role="button"
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-semibold ${
                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          } ${isDayToday ? 'text-blue-600' : ''}`}
                        >
                          {format(day, 'd')}
                        </span>
                        {hasEvents && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                      </div>
                      <div className="space-y-1">
                        {dayEventsList.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded border ${getEventTypeColor(event.type)}`}
                            title={event.description}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="flex items-center">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {format(new Date(event.startDate), 'HH:mm')}
                            </div>
                          </div>
                        ))}
                        {dayEventsList.length > 2 && (
                          <div className="text-xs text-gray-500">+{dayEventsList.length - 2} autres</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Prochains événements</h3>
              <div className="space-y-3">
                {sortedEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getEventTypeColor(event.type)}`}>
                        {getEventTypeLabel(event.type)}
                      </span>
                      <span className="text-xs text-gray-500">{format(new Date(event.startDate), 'dd/MM')}</span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                    <div className="flex items-center text-xs text-gray-600">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {format(new Date(event.startDate), 'HH:mm', { locale: fr })}
                    </div>
                    {event.description && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Cours</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Examen</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Échéance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                  <span className="text-sm text-gray-700">Réunion</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <CalendarModals
        showCreate={showCreateModal}
        onCloseCreate={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
        isCreating={isCreating}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        eventType={eventType}
        setEventType={setEventType}
        date={date}
        setDate={setDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        showDayModal={showDayModal}
        onCloseDay={() => setShowDayModal(false)}
        dayEvents={dayEvents}
      />
    </>
  );
};

type CalendarModalsProps = {
  showCreate: boolean;
  onCloseCreate: () => void;
  onSubmit: () => void;
  isCreating: boolean;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  eventType: 'COURSE' | 'EXAM' | 'DEADLINE' | 'MEETING';
  setEventType: (v: 'COURSE' | 'EXAM' | 'DEADLINE' | 'MEETING') => void;
  date: string;
  setDate: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  setEndTime: (v: string) => void;
  showDayModal: boolean;
  onCloseDay: () => void;
  dayEvents: any[];
};

const CalendarModals: React.FC<CalendarModalsProps> = ({
  showCreate,
  onCloseCreate,
  onSubmit,
  isCreating,
  title,
  setTitle,
  description,
  setDescription,
  eventType,
  setEventType,
  date,
  setDate,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  showDayModal,
  onCloseDay,
  dayEvents,
}) => (
  <>
    <Modal isOpen={showCreate} onClose={onCloseCreate} title="Nouvel événement" size="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Nom de l'événement"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Détail (optionnel)"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="MEETING">Réunion</option>
              <option value="COURSE">Cours</option>
              <option value="EXAM">Examen</option>
              <option value="DEADLINE">Échéance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure début</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold">Aperçu</span>
            <span className={`px-2 py-1 text-xs font-medium rounded ${eventType === 'EXAM' ? 'bg-red-100 text-red-700' : eventType === 'COURSE' ? 'bg-blue-100 text-blue-700' : eventType === 'DEADLINE' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
              {eventType === 'EXAM' ? 'Examen' : eventType === 'COURSE' ? 'Cours' : eventType === 'DEADLINE' ? 'Échéance' : 'Réunion'}
            </span>
          </div>
          <p className="font-medium">{title || 'Titre à définir'}</p>
          <p className="text-xs text-gray-600">
            {date ? format(new Date(`${date}T00:00:00`), 'dd/MM/yyyy', { locale: fr }) : 'Date non définie'} • {startTime || '--:--'} - {endTime || '--:--'}
          </p>
          {description && <p className="mt-1 line-clamp-2">{description}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onCloseCreate} disabled={isCreating}>
            Annuler
          </Button>
          <Button onClick={onSubmit} isLoading={isCreating}>
            Créer
          </Button>
        </div>
      </div>
    </Modal>

    <Modal isOpen={showDayModal} onClose={onCloseDay} title="Événements du jour" size="md">
      {dayEvents.length === 0 ? (
        <p className="text-gray-600">Aucun événement</p>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((event) => (
            <Card key={event.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">{event.title}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(event.startDate), 'HH:mm')} - {format(new Date(event.endDate), 'HH:mm')}
                </span>
              </div>
              <div className="text-sm text-gray-700 mb-1">{event.description || 'Pas de description'}</div>
              <div className="text-xs text-gray-500">{getEventTypeLabel(event.type)}</div>
            </Card>
          ))}
        </div>
      )}
    </Modal>
  </>
);
