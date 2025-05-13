// Helper function to format ISO date string to "15 Janvier 2025"
export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'Date inconnue';
  
  // If dateString is already in the format "15 Janvier 2025", return it as is
  if (dateString.match(/^\d{1,2}\s[A-ZÀ-Ú][a-zà-ú]+\s\d{4}$/)) {
    return dateString;
  }
  
  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid date detected:', dateString);
      return 'Date inconnue';
    }
    
    const months = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'Date inconnue';
  }
};

// Parse a formatted date string like "15 Janvier 2025" to Date object
export const parseFormattedDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  const monthsMapping: { [key: string]: number } = {
    "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3, "Mai": 4, "Juin": 5,
    "Juillet": 6, "Août": 7, "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11
  };

  try {
    // If it's already a standard date format, try to parse it directly
    const directDate = new Date(dateString);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }
    
    // Otherwise, parse our custom format "15 Janvier 2025"
    const parts = dateString.split(' ');
    if (parts.length !== 3) return new Date(); // Invalid date

    const day = parseInt(parts[0], 10);
    const month = monthsMapping[parts[1]];
    const year = parseInt(parts[2], 10);

    if (isNaN(day) || month === undefined || isNaN(year)) {
      return new Date(); // Invalid date
    }

    return new Date(year, month, day);
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return new Date(); // Return current date in case of error
  }
};

// Format a date in relative terms (today, yesterday, etc.)
export const formatRelativeDate = (dateStr: string): string => {
  if (!dateStr) return 'Date inconnue';
  
  try {
    // Parse the date string - works with both ISO and our custom format
    const date = typeof dateStr === 'string' && dateStr.includes(' ') 
      ? parseFormattedDate(dateStr) 
      : new Date(dateStr);
      
    if (isNaN(date.getTime())) {
      return 'Date inconnue';
    }
    
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;

    // For older dates, return day and full month name
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long'
    });
  } catch (e) {
    console.error('Error formatting relative date:', e);
    return 'Date inconnue';
  }
}; 