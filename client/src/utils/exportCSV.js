export const exportTasksToCSV = (tasks) => {
  // Define CSV headers
  const headers = ['Title', 'Description', 'Status', 'Priority', 'Created Date'];
  
  // Convert tasks to CSV rows
  const rows = tasks.map(task => [
    task.title,
    task.description || '',
    task.status,
    task.priority,
    new Date(task.created_at).toLocaleDateString()
  ]);
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    )
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `taskflow_tasks_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};