// src/screens/MyBookingsScreen.js
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import colors from '../config/colors';
import Header from '../components/Header';
import LoadingIndicator from '../components/LoadingIndicator';
import BookingCard from '../components/BookingCard';
import AppButton from '../components/AppButton';
import { getCurrentTeacher, getBookings, deleteBooking } from '../utils/asyncStorage';
import { canCancelBooking, isPastDate } from '../utils/dateUtils';

const MyBookingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [bookings, setBookings] = useState([]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      
      // Obter dados do professor atual
      const currentTeacher = await getCurrentTeacher();
      if (!currentTeacher) {
        navigation.replace('TeacherRegister');
        return;
      }
      
      setTeacher(currentTeacher);
      
      // Obter todos os agendamentos
      const allBookings = await getBookings();
      
      // Filtrar agendamentos do professor atual
      const teacherBookings = allBookings.filter(
        booking => booking.teacherId === currentTeacher.id
      );
      
      // Separar agendamentos em futuros e passados
      const futureBookings = teacherBookings.filter(booking => !isPastDate(booking.date));
      const pastBookings = teacherBookings.filter(booking => isPastDate(booking.date));
      
      // Ordenar agendamentos futuros por data (mais próximos primeiro)
      futureBookings.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Ordenar agendamentos passados por data (mais recentes primeiro)
      pastBookings.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Combinar os dois arrays
      setBookings([...futureBookings, ...pastBookings]);
      
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Erro', 'Não foi possível carregar seus agendamentos.');
    }
  };

  useEffect(() => {
    loadBookings();
    
    // Recarregar ao voltar para esta tela
    const unsubscribe = navigation.addListener('focus', loadBookings);
    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleCancelBooking = async (booking) => {
    // Verificar se o cancelamento está sendo feito com pelo menos 24h de antecedência
    if (!canCancelBooking(booking.date)) {
      Alert.alert(
        'Não é possível cancelar',
        'Cancelamentos devem ser feitos com pelo menos 24 horas de antecedência.'
      );
      return;
    }
    
    Alert.alert(
      'Cancelar Agendamento',
      'Tem certeza que deseja cancelar este agendamento?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteBooking(booking.id);
              loadBookings();
              
              Alert.alert(
                'Agendamento cancelado',
                'Seu agendamento foi cancelado com sucesso.'
              );
            } catch (error) {
              console.error('Error canceling booking:', error);
              setLoading(false);
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }) => {
    const isPast = isPastDate(item.date);
    
    return (
      <View style={styles.bookingItemContainer}>
        <BookingCard
          booking={item}
          onPress={() => navigation.navigate('BookingForm', { bookingId: item.id })}
        />
        
        {!isPast && (
          <AppButton
            title="Cancelar Agendamento"
            onPress={() => handleCancelBooking(item)}
            color="error"
          />
        )}
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name="calendar-blank"
        size={80}
        color={colors.textSecondary}
      />
      <Text style={styles.emptyText}>
        Você ainda não tem agendamentos
      </Text>
      <AppButton
        title="Fazer Novo Agendamento"
        onPress={() => navigation.navigate('BookingForm')}
        color="primary"
      />
    </View>
  );

  if (loading && !refreshing) {
    return <LoadingIndicator />;
  }

  return (
    <View style={styles.container}>
      <Header title="Meus Agendamentos" showBackButton={false} />
      
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={
          bookings.length === 0 ? styles.emptyListContent : styles.listContent
        }
        ListHeaderComponent={
          bookings.length > 0 ? (
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>Seus Agendamentos</Text>
              <Text style={styles.headerSubtitle}>
                Gerencie suas reservas do laboratório
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 15,
  },
  emptyListContent: {
    flexGrow: 1,
    padding: 15,
    justifyContent: 'center',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 5,
  },
  bookingItemContainer: {
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default MyBookingsScreen;
