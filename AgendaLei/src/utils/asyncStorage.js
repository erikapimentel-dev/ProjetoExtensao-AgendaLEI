// src/utils/asyncStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys para o AsyncStorage
const STORAGE_KEYS = {
  TEACHERS: 'agendalei_teachers',
  BOOKINGS: 'agendalei_bookings',
  CURRENT_TEACHER: 'agendalei_current_teacher',
};

// Professores
export const saveTeacher = async (teacher) => {
  try {
    // Primeiro, busca todos os professores existentes
    const existingTeachers = await getTeachers();
    
    // Verifica se o professor já existe (pelo email)
    const teacherExists = existingTeachers.find(t => t.email === teacher.email);
    
    if (teacherExists) {
      // Atualiza os dados do professor existente
      const updatedTeachers = existingTeachers.map(t => 
        t.email === teacher.email ? { ...t, ...teacher } : t
      );
      
      await AsyncStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updatedTeachers));
      return { ...teacherExists, ...teacher };
    } else {
      // Cria um novo ID para o professor
      const newTeacher = {
        ...teacher,
        id: Date.now().toString(), // ID único baseado no timestamp
        createdAt: new Date().toISOString(),
      };
      
      // Adiciona o novo professor à lista
      const updatedTeachers = [...existingTeachers, newTeacher];
      
      await AsyncStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updatedTeachers));
      return newTeacher;
    }
  } catch (error) {
    console.error('Error saving teacher:', error);
    throw error;
  }
};

export const getTeachers = async () => {
  try {
    const teachersData = await AsyncStorage.getItem(STORAGE_KEYS.TEACHERS);
    return teachersData ? JSON.parse(teachersData) : [];
  } catch (error) {
    console.error('Error getting teachers:', error);
    return [];
  }
};

export const getTeacherById = async (id) => {
  try {
    const teachers = await getTeachers();
    return teachers.find(teacher => teacher.id === id);
  } catch (error) {
    console.error('Error getting teacher by ID:', error);
    return null;
  }
};

export const setCurrentTeacher = async (teacher) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_TEACHER, JSON.stringify(teacher));
  } catch (error) {
    console.error('Error setting current teacher:', error);
  }
};

export const getCurrentTeacher = async () => {
  try {
    const teacherData = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_TEACHER);
    return teacherData ? JSON.parse(teacherData) : null;
  } catch (error) {
    console.error('Error getting current teacher:', error);
    return null;
  }
};

// Agendamentos
export const saveBooking = async (booking) => {
  try {
    const existingBookings = await getBookings();
    
    // Se o booking já tiver um ID, estamos atualizando
    if (booking.id) {
      const updatedBookings = existingBookings.map(b => 
        b.id === booking.id ? { ...b, ...booking } : b
      );
      
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
      return booking;
    } else {
      // Caso contrário, é um novo agendamento
      const newBooking = {
        ...booking,
        id: Date.now().toString(), // ID único baseado no timestamp
        createdAt: new Date().toISOString(),
      };
      
      const updatedBookings = [...existingBookings, newBooking];
      
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
      return newBooking;
    }
  } catch (error) {
    console.error('Error saving booking:', error);
    throw error;
  }
};

export const getBookings = async () => {
  try {
    const bookingsData = await AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return bookingsData ? JSON.parse(bookingsData) : [];
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
};

export const getBookingById = async (id) => {
  try {
    const bookings = await getBookings();
    return bookings.find(booking => booking.id === id);
  } catch (error) {
    console.error('Error getting booking by ID:', error);
    return null;
  }
};

export const getBookingsByTeacher = async (teacherId) => {
  try {
    const bookings = await getBookings();
    return bookings.filter(booking => booking.teacherId === teacherId);
  } catch (error) {
    console.error('Error getting bookings by teacher:', error);
    return [];
  }
};

export const deleteBooking = async (id) => {
  try {
    const bookings = await getBookings();
    const updatedBookings = bookings.filter(booking => booking.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

// Limpar todos os dados (para testes)
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};
