// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../config/colors';
import LoadingIndicator from '../components/LoadingIndicator';
import BookingCard from '../components/BookingCard';
import Header from '../components/Header';
import { getCurrentTeacher, getBookings } from '../utils/asyncStorage';
import { formatDateForCalendar, getTimeSlots } from '../utils/dateUtils';

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [nextAvailableSlots, setNextAvailableSlots] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Obter dados do professor atual
        const currentTeacher = await getCurrentTeacher();
        if (!currentTeacher) {
          // Se não houver professor cadastrado, redireciona para a tela de registro
          navigation.replace('TeacherRegister');
          return;
        }
        
        setTeacher(currentTeacher);
        
        // Obter todos os agendamentos
        const allBookings = await getBookings();
        
        // Filtrar agendamentos do professor atual (apenas futuros)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const teacherBookings = allBookings.filter(booking => {
          const bookingDate = new Date(booking.date);
          return (
            booking.teacherId === currentTeacher.id &&
            bookingDate >= today
          );
        });
        
        // Ordenar por data (mais próximos primeiro)
        teacherBookings.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Limitar a 3 agendamentos
        setMyBookings(teacherBookings.slice(0, 3));
        
        // Calcular próximos slots disponíveis
        calculateAvailableSlots(allBookings);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      }
    };

    loadData();
    
    // Atualizar ao voltar para esta tela
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  const calculateAvailableSlots = (allBookings) => {
    // Obter datas para os próximos 3 dias úteis
    const availableDays = [];
    const today = new Date();
    let dayCount = 0;
    let currentDate = new Date(today);
    
    while (availableDays.length < 5) {
      // Ignorar sábados (6) e domingos (0)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        const formattedDate = formatDateForCalendar(currentDate);
        
        // Criar objeto de dia
        const day = {
          date: formattedDate,
          dayName: currentDate.toLocaleDateString('pt-BR', { weekday: 'short' }),
          dayNumber: currentDate.getDate(),
          slots: [],
        };
        
        // Verificar slots disponíveis para este dia
        const timeSlots = getTimeSlots();
        const bookingsForDay = allBookings.filter(
          booking => formatDateForCalendar(booking.date) === formattedDate
        );
        
        // Para cada horário, verificar se está disponível
        timeSlots.forEach(slot => {
          const isBooked = bookingsForDay.some(
            booking => booking.startTime === slot.value
          );
          
          if (!isBooked) {
            day.slots.push({
              time: slot.value,
              label: slot.label,
              endTime: slot.endTime,
            });
          }
        });
        
        if (day.slots.length > 0) {
          availableDays.push(day);
        }
      }
      
      // Avançar para o próximo dia
      dayCount++;
      currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayCount);
    }
    
    setNextAvailableSlots(availableDays);
  };


  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <Header 
        title="AgendaLEI" 
        rightAction={{
          icon: 'account',
          onPress: () => Alert.alert('Professor', `${teacher.name}\n${teacher.email}\n${teacher.disciplina}`),
        }}
      />
      
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.greeting}>Olá, {teacher ? teacher.name.split(' ')[0] : 'Professor'}!</Text>
          <Text style={styles.subGreeting}>Bem-vindo ao AgendaLEI</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('BookingForm')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="calendar-plus" size={24} color={colors.white} />
            </View>
            <Text style={styles.actionText}>Novo{'\n'}Agendamento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Calendar')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <MaterialCommunityIcons name="calendar-month" size={24} color={colors.white} />
            </View>
            <Text style={styles.actionText}>Ver{'\n'}Calendário</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyBookings')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.success }]}>
              <MaterialCommunityIcons name="format-list-bulleted" size={24} color={colors.white} />
            </View>
            <Text style={styles.actionText}>Meus{'\n'}Agendamentos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meus Próximos Agendamentos</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyBookings')}>
              <Text style={styles.seeAllButton}>Ver Todos</Text>
            </TouchableOpacity>
          </View>

          {myBookings.length > 0 ? (
            myBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPress={() => navigation.navigate('BookingForm', { bookingId: booking.id })}
              />
            ))
          ) : (
            <Text style={styles.emptyStateText}>
              Você não tem agendamentos futuros. Clique em Novo Agendamento para reservar o laboratório.
            </Text>
          )}
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Horários Disponíveis</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
              <Text style={styles.seeAllButton}>Ver Calendário</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.availableSlots}>
            {nextAvailableSlots.map((day, index) => (
              <View key={index} style={styles.daySlot}>
                <Text style={styles.dayName}>{day.dayName}</Text>
                <Text style={styles.dayDate}>{day.dayNumber}</Text>
                {day.slots.map((slot, slotIndex) => (
                  <TouchableOpacity
                    key={slotIndex}
                    style={styles.timeSlot}
                    onPress={() => navigation.navigate('BookingForm', { 
                      date: day.date, 
                      startTime: slot.time,
                      endTime: slot.endTime
                    })}
                  >
                    <Text style={styles.timeText}>{slot.time}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  subGreeting: {
    fontSize: 16,
    color: colors.white,
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: -30,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 40,
    width: '30%',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  sectionContainer: {
    margin: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAllButton: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyStateText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  availableSlots: {
    flexDirection: 'row',
  },
  daySlot: {
    width: 120,
    marginRight: 15,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  dayName: {
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 16,
    textTransform: 'capitalize',
  },
  dayDate: {
    color: colors.textSecondary,
    marginBottom: 10,
    fontSize: 16,
  },
  timeSlot: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    padding: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  timeText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
