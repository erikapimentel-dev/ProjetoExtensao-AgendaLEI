
// Formatar data para exibição (DD/MM/YYYY)
export const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
};

// Formatar data para o calendário (YYYY-MM-DD)
export const formatDateForCalendar = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${d.getFullYear()}-${month}-${day}`;
};

// Formatar data para exibição com dia da semana (Segunda-feira, 01/01/2025)
export const formatDateWithWeekday = (date) => {
  const d = new Date(date);
  
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Obter data atual formatada (YYYY-MM-DD)
export const getCurrentDate = () => {
  const today = new Date();
  return formatDateForCalendar(today);
};

// Verificar se uma data é no passado
export const isPastDate = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999); // Fim do dia
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Início do dia
  
  return d < today;
};

// Verificar se uma data está dentro de uma semana a partir de hoje
export const isWithinOneWeek = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // Início do dia
  
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Início do dia
  
  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);
  
  return d >= today && d <= oneWeekFromNow;
};

// Verificar se um cancelamento está sendo feito com 24h de antecedência
export const canCancelBooking = (bookingDate) => {
  const d = new Date(bookingDate);
  const now = new Date();
  
  // Diferença em milissegundos
  const diffMs = d.getTime() - now.getTime();
  
  // Diferença em horas
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours >= 24;
};

// Definir os horários disponíveis para agendamento
export const getTimeSlots = () => [
  { label: '1º Tempo: 07:10 - 08:00', value: '07:10', endTime: '08:00' },
  { label: '2º Tempo: 08:00 - 08:50', value: '08:00', endTime: '08:50' },
  { label: '3º Tempo: 08:50 - 09:40', value: '08:50', endTime: '09:40' },
  { label: 'Intervalo: 09:40 - 10:00', value: '09:40', endTime: '10:00' },
  { label: '4º Tempo: 10:00 - 10:50', value: '10:00', endTime: '10:50' },
  { label: '5º Tempo: 10:50 - 11:40', value: '10:50', endTime: '11:40' },
  { label: 'Almoço: 11:40 - 13:00', value: '11:40', endTime: '13:00' },
  { label: '6º Tempo: 13:00 - 13:50', value: '13:00', endTime: '13:50' },
  { label: '7º Tempo: 13:50 - 14:40', value: '13:50', endTime: '14:40' },
  { label: 'Intervalo: 14:40 - 15:00', value: '14:40', endTime: '15:00' },
  { label: '8º Tempo: 15:00 - 15:50', value: '15:00', endTime: '15:50' },
  { label: '9º Tempo: 15:50 - 16:40', value: '15:50', endTime: '16:40' },
];

// Verificar se um horário está disponível para a data selecionada
export const isTimeSlotAvailable = (date, startTime, bookings) => {
  const formattedDate = formatDateForCalendar(date);
  
  const conflictingBooking = bookings.find(booking => {
    const bookingDate = formatDateForCalendar(booking.date);
    return bookingDate === formattedDate && booking.startTime === startTime;
  });
  
  return !conflictingBooking;
};

// Contar agendamentos de um professor na semana atual
export const countTeacherBookingsInCurrentWeek = (teacherId, bookings) => {
  // Obter a data atual
  const today = new Date();
  
  // Obter o primeiro dia da semana (domingo)
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay());
  firstDayOfWeek.setHours(0, 0, 0, 0);
  
  // Obter o último dia da semana (sábado)
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);
  
  // Filtrar agendamentos desta semana para este professor
  const bookingsThisWeek = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return (
      booking.teacherId === teacherId &&
      bookingDate >= firstDayOfWeek &&
      bookingDate <= lastDayOfWeek
    );
  });
  
  return bookingsThisWeek.length;
};
