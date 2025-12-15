import type { Guest, Event } from '@/types/models';

// Conversion des statuts en français
const statusLabels: Record<string, string> = {
  invited: 'Invité',
  confirmed: 'Confirmé',
  declined: 'Décliné',
  pending: 'En attente',
};

// Export CSV des invités
export const exportGuestsToCSV = (
  guests: Guest[], 
  events: Event[], 
  filename: string = 'invites'
) => {
  const headers = [
    'Nom complet',
    'Email',
    'Téléphone',
    'Événement',
    'Statut',
    'Préférence boisson',
    'Date de création',
  ];

  const rows = guests.map((guest) => {
    const event = events.find(e => e.id === guest.eventId);
    return [
      guest.fullName,
      guest.email || '',
      guest.phone || '',
      event?.title || 'N/A',
      statusLabels[guest.status] || guest.status,
      guest.drinkPreference || '',
      guest.createdAt ? new Date(guest.createdAt).toLocaleDateString('fr-FR') : '',
    ];
  });

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
};

// Export Excel (format TSV compatible)
export const exportGuestsToExcel = (
  guests: Guest[], 
  events: Event[], 
  filename: string = 'invites'
) => {
  const headers = [
    'Nom complet',
    'Email',
    'Téléphone',
    'Événement',
    'Statut',
    'Préférence boisson',
    'Date de création',
  ];

  const rows = guests.map((guest) => {
    const event = events.find(e => e.id === guest.eventId);
    return [
      guest.fullName,
      guest.email || '',
      guest.phone || '',
      event?.title || 'N/A',
      statusLabels[guest.status] || guest.status,
      guest.drinkPreference || '',
      guest.createdAt ? new Date(guest.createdAt).toLocaleDateString('fr-FR') : '',
    ];
  });

  // Create HTML table for Excel
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Invités</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
      </style>
    </head>
    <body>
      <table>
        <thead>
          <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  downloadFile(htmlContent, `${filename}.xls`, 'application/vnd.ms-excel;charset=utf-8;');
};

// Helper function to download file
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob(['\ufeff' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export users to CSV
export const exportUsersToCSV = (users: { fullName: string; email: string; phone?: string; role: string }[]) => {
  const headers = ['Nom complet', 'Email', 'Téléphone', 'Rôle'];
  const rows = users.map(user => [
    user.fullName,
    user.email,
    user.phone || '',
    user.role === 'admin' ? 'Administrateur' : 'Utilisateur',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
  ].join('\n');

  downloadFile(csvContent, 'utilisateurs.csv', 'text/csv;charset=utf-8;');
};