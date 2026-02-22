import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useState } from 'react';

const localizer = momentLocalizer(moment);

function TaskCalendar({ tasks, onSelectTask, onSelectSlot }) {
  const [view, setView] = useState('month');

  const events = tasks.map(task => ({
    id: task.id,
    title: task.title,
    start: task.due_date ? new Date(task.due_date) : new Date(task.created_at),
    end: task.due_date ? new Date(task.due_date) : new Date(task.created_at),
    resource: task,
    allDay: true,
    status: task.status,
    priority: task.priority
  }));

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6';
    
    if (event.status === 'done') {
      backgroundColor = '#10b981';
    } else if (event.status === 'in_progress') {
      backgroundColor = '#8b5cf6';
    } else if (event.priority === 'urgent') {
      backgroundColor = '#ef4444';
    } else if (event.priority === 'high') {
      backgroundColor = '#f59e0b';
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        padding: '4px 8px'
      }
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Task Calendar</h3>
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-slate-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">To Do</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-violet-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Done</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Urgent</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">High Priority</span>
          </div>
        </div>
      </div>

      <div className="calendar-container" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onSelectEvent={(event) => onSelectTask(event.resource)}
          onSelectSlot={onSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          popup
          style={{ height: '100%' }}
        />
      </div>

      <style>{`
        .calendar-container .rbc-calendar {
          font-family: inherit;
        }
        
        .dark .rbc-calendar {
          background-color: #1f2937;
          color: white;
        }
        
        .dark .rbc-header {
          background-color: #374151;
          color: white;
          border-color: #4b5563;
        }
        
        .dark .rbc-month-view {
          background-color: #1f2937;
          border-color: #4b5563;
        }
        
        .dark .rbc-day-bg {
          background-color: #1f2937;
          border-color: #4b5563;
        }
        
        .dark .rbc-off-range-bg {
          background-color: #111827;
        }
        
        .dark .rbc-today {
          background-color: #1e3a8a;
        }
        
        .dark .rbc-toolbar button {
          color: white;
          border-color: #4b5563;
        }
        
        .dark .rbc-toolbar button:hover {
          background-color: #374151;
        }
        
        .dark .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
          color: white;
        }
        
        .dark .rbc-month-row {
          border-color: #4b5563;
        }
        
        .dark .rbc-date-cell {
          color: #d1d5db;
        }
        
        .rbc-event {
          padding: 4px 6px;
        }
        
        .rbc-toolbar {
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

export default TaskCalendar;