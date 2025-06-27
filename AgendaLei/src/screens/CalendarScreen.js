// src/screens/CalendarScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../config/colors';
import LoadingIndicator from '../components/LoadingIndicator';
import Header from '../components/Header';
import AppButton from '../components/AppButton';
import { getBookings } from '../utils/asyncStorage';
import { formatDateForCalendar, formatDateWithWeekday, getTimeSlots } from '../utils/dateUtils';

const CalendarScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [bookings, setBookings] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);

  // Obter data atual formatada (YYYY-MM-DD)
  const getCurrentDate = () => {
    const today = new Date();
    return formatDateForCalendar(today);
  };

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        
        // Obter todos os agendamentos
        const allBookings = await getBookings();
        setBookings(allBookings);
        
        // Criar objeto para marcações no calendário
        const markedDatesObj = {};
        
        allBookings.forEach(booking => {
          const dateKey = formatDateForCalendar(booking.date);
          
          if (!markedDatesObj[dateKey]) {
            markedDatesObj[dateKey] = { dots: [{ color: colors.primary }] };
          } else if (markedDatesObj[dateKey].dots) {
            // Evitar duplicatas
            if (!markedDatesObj[dateKey].dots.some(dot => dot.color === colors.primary)) {
              markedDatesObj[dateKey].dots.push({ color: colors.primary });
            }
          }
        });
        
        setMarkedDates(markedDatesObj);
        
        // Definir data selecionada como hoje
        const today = getCurrentDate();
        setSelectedDate(today);
        
        // Inicializar time slots
        updateTimeSlots(today, allBookings);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading bookings:', error);
        setLoading(false);
        Alert.alert('Erro', 'Não foi possível carregar os agendamentos.');
      }
    };

    loadBookings();
    
    // Recarregar ao voltar para esta tela
    const unsubscribe = navigation.addListener('focus', loadBookings);
    return unsubscribe;
  }, [navigation]);

  const updateTimeSlots = (date, allBookings) => {
    // Obter os horários padrões
    const availableSlots = getTimeSlots().map(slot => ({
      ...slot,
      available: true,
      booking: null,
    }));
    
    // Marcar os horários que já estão reservados
    const bookingsForDay = allBookings.filter(
      booking => formatDateForCalendar(booking.date) === date
    );
    
    bookingsForDay.forEach(booking => {
      const slotIndex = availableSlots.findIndex(slot => slot.value === booking.startTime);
      if (slotIndex !== -1) {
        availableSlots[slotIndex].available = false;
        availableSlots[slotIndex].booking = booking;
      }
    });
    
    setTimeSlots(availableSlots);
  };

  const handleDayPress = (day) => {
    // Verificar se a data é no passado
    const selectedDay = new Date(day.dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDay < today) {
      Alert.alert('Aviso', 'Não é possível selecionar datas no passado.');
      return;
    }
    
    // Verificar se a data está dentro de uma semana
    const oneWeekFromNow = new Date(today);
    oneWeekFromNow.setDate(today.getDate() + 7);
    
    if (selectedDay > oneWeekFromNow) {
      Alert.alert('Aviso', 'Só é possível agendar com até uma semana de antecedência.');
      return;
    }
    
    setSelectedDate(day.dateString);
    updateTimeSlots(day.dateString, bookings);
  };

  const handleBookSlot = (slot) => {
    navigation.navigate('BookingForm', {
      date: selectedDate,
      startTime: slot.value,
      endTime: slot.endTime,
    });
  };

  const handleViewBooking = (booking) => {
    navigation.navigate('BookingForm', { bookingId: booking.id });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <Header title="Calendário" showBackButton={false} />
      
      <Calendar
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: colors.primary,
          },
        }}
        markingType={'multi-dot'}
        onDayPress={handleDayPress}
        monthFormat={'MMMM yyyy'}
        hideExtraDays={true}
        firstDay={0} // Domingo como primeiro dia
        enableSwipeMonths={true}
        theme={{
          calendarBackground: colors.white,
          textSectionTitleColor: colors.primary,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.white,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.disabled,
          dotColor: colors.primary,
          selectedDotColor: colors.white,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          indicatorColor: colors.primary,
          textDayFontWeight: '300',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14
        }}
      />

      <View style={styles.dateHeader}>
        <Text style={styles.selectedDateText}>
          {selectedDate ? formatDateWithWeekday(selectedDate) : 'Selecione uma data'}
        </Text>
      </View>

      <ScrollView style={styles.slotsContainer}>
        <Text style={styles.sectionTitle}>Horários Disponíveis</Text>
        
        {timeSlots.map((slot, index) => (
          <View key={index} style={styles.slotRow}>
            <View style={styles.timeContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text style={styles.timeText}>{slot.label}</Text>
            </View>
            
            {slot.available ? (
              <AppButton
                title="Reservar"
                onPress={() => handleBookSlot(slot)}
                color="primary"
                style={styles.smallButton}
              />
            ) : (
              <View style={styles.bookedSlot}>
                <Text style={styles.bookedByText}>
                  {slot.booking?.teacherName || 'Reservado'}
                </Text>
                <TouchableOpacity
                  onPress={() => handleViewBooking(slot.booking)}
                  style={styles.detailsButton}
                >
                  <Text style={styles.detailsButtonText}>Detalhes</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dateHeader: {
    padding: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textTransform: 'capitalize',
  },
  slotsContainer: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },
  smallButton: {
    width: 120,
    padding: 8,
    marginVertical: 0,
  },
  bookedSlot: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 10,
  },
  bookedByText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  detailsButton: {
    padding: 5,
  },
  detailsButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
