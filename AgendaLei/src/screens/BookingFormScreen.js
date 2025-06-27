// src/screens/BookingFormScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import colors from '../config/colors';
import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import LoadingIndicator from '../components/LoadingIndicator';
import Header from '../components/Header';
import {
  getCurrentTeacher,
  getBookings,
  getBookingById,
  saveBooking,
  deleteBooking,
} from '../utils/asyncStorage';
import {
  formatDate,
  formatDateForCalendar,
  getTimeSlots,
  isWithinOneWeek,
  countTeacherBookingsInCurrentWeek,
  canCancelBooking,
} from '../utils/dateUtils';

const validationSchema = Yup.object().shape({
  className: Yup.string().required('Turma é obrigatória'),
  activity: Yup.string().required('Atividade é obrigatória'),
  numStudents: Yup.number()
    .required('Número de alunos é obrigatório')
    .min(1, 'Deve haver pelo menos 1 aluno')
    .max(20, 'Máximo de 20 alunos permitido'),
  date: Yup.date().required('Data é obrigatória'),
  startTime: Yup.string().required('Horário de início é obrigatório'),
});

const BookingFormScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [booking, setBooking] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  // Parâmetros passados da tela anterior (se houver)
  const bookingId = route.params?.bookingId;
  const initialDate = route.params?.date 
    ? new Date(route.params.date) 
    : new Date();
  const initialStartTime = route.params?.startTime || '';
  const initialEndTime = route.params?.endTime || '';

  useEffect(() => {
    const loadData = async () => {
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
        const allBookingsData = await getBookings();
        setAllBookings(allBookingsData);
        
        // Se for edição, buscar o agendamento pelo ID
        if (bookingId) {
          const bookingData = await getBookingById(bookingId);
          
          if (bookingData) {
            setBooking(bookingData);
            setIsEditMode(true);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
        Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      }
    };

    loadData();
  }, [bookingId, navigation]);

  const handleDateChange = (event, selectedDate, setFieldValue) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Verificar se a data está dentro de uma semana
      if (!isWithinOneWeek(selectedDate)) {
        Alert.alert('Aviso', 'Só é possível agendar com até uma semana de antecedência.');
        return;
      }
      
      setFieldValue('date', selectedDate);
    }
  };

  const checkBookingConflicts = (values) => {
    // Se estiver em modo de edição, ignorar o próprio agendamento
    const bookingsToCheck = isEditMode
      ? allBookings.filter(b => b.id !== booking.id)
      : allBookings;
    
    // Verificar se o usuário já tem 2 agendamentos na semana (ignorando este se for edição)
    const userBookingsThisWeek = countTeacherBookingsInCurrentWeek(
      teacher.id,
      bookingsToCheck
    );
    
    if (!isEditMode && userBookingsThisWeek >= 2) {
      return 'Você já atingiu o limite de 2 agendamentos por semana';
    }
    
    // Verificar se o horário já está reservado
    const bookingDate = formatDateForCalendar(values.date);
    
    const conflictingBooking = bookingsToCheck.find(b => 
      formatDateForCalendar(b.date) === bookingDate &&
      b.startTime === values.startTime
    );
    
    if (conflictingBooking) {
      return 'Este horário já está reservado';
    }
    
    return null;
  };

  const handleSubmit = async (values) => {
    try {
      // Verificar regras de negócio
      const conflictMessage = checkBookingConflicts(values);
      if (conflictMessage) {
        Alert.alert('Não é possível agendar', conflictMessage);
        return;
      }
      
      setLoading(true);
      
      // Preparar dados para salvar
      const bookingData = {
        ...(isEditMode ? { id: booking.id } : {}),
        teacherId: teacher.id,
        teacherName: teacher.name,
        teacherEmail: teacher.email,
        disciplina: teacher.disciplina,
        className: values.className,
        activity: values.activity,
        numStudents: parseInt(values.numStudents),
        date: new Date(values.date).toISOString(),
        startTime: values.startTime,
        endTime: values.endTime,
        status: 'confirmed',
      };
      
      // Salvar no AsyncStorage
      await saveBooking(bookingData);
      
      setLoading(false);
      
      Alert.alert(
        isEditMode ? 'Agendamento atualizado' : 'Agendamento realizado',
        isEditMode
          ? 'Seu agendamento foi atualizado com sucesso!'
          : 'Seu agendamento foi confirmado com sucesso!',
        [{ text: 'OK', onPress: () => navigation.navigate('HomeMain') }]
      );
    } catch (error) {
      console.error('Error saving booking:', error);
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível salvar o agendamento. Tente novamente.');
    }
  };

  const handleDelete = async () => {
    if (!booking || !booking.id) return;
    
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
              setLoading(false);
              
              Alert.alert(
                'Agendamento cancelado',
                'Seu agendamento foi cancelado com sucesso.',
                [{ text: 'OK', onPress: () => navigation.navigate('HomeMain') }]
              );
            } catch (error) {
              console.error('Error deleting booking:', error);
              setLoading(false);
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  // Configurar valores iniciais para o formulário
  const initialValues = isEditMode
    ? {
        className: booking.className,
        activity: booking.activity,
        numStudents: booking.numStudents.toString(),
        date: new Date(booking.date),
        startTime: booking.startTime,
        endTime: booking.endTime,
      }
    : {
        className: '',
        activity: '',
        numStudents: '',
        date: initialDate,
        startTime: initialStartTime,
        endTime: initialEndTime,
      };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Header 
        title={isEditMode ? 'Editar Agendamento' : 'Novo Agendamento'} 
        showBackButton={true} 
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.formContainer}>
              <AppTextInput
                icon="account-group"
                placeholder="Turma (ex: 2º Ano A)"
                value={values.className}
                onChangeText={handleChange('className')}
                error={errors.className}
                touched={touched.className}
                autoCapitalize="words"
              />

              <AppTextInput
                icon="book-open-variant"
                placeholder="Atividade a ser realizada"
                value={values.activity}
                onChangeText={handleChange('activity')}
                error={errors.activity}
                touched={touched.activity}
                autoCapitalize="sentences"
              />

              <AppTextInput
                icon="account-multiple"
                placeholder="Número de alunos"
                value={values.numStudents}
                onChangeText={handleChange('numStudents')}
                keyboardType="numeric"
                error={errors.numStudents}
                touched={touched.numStudents}
              />

              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={styles.datePickerText}>
                  {formatDate(values.date)}
                </Text>
                {errors.date && touched.date && (
                  <Text style={styles.errorText}>{errors.date}</Text>
                )}
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={values.date}
                  mode="date"
                  display="default"
                  onChange={(event, date) => handleDateChange(event, date, setFieldValue)}
                  minimumDate={new Date()}
                />
              )}

              <View style={styles.timeSelectionContainer}>
                <Text style={styles.sectionLabel}>Selecione o horário:</Text>
                
                <View style={styles.timeOptionsContainer}>
                  {getTimeSlots().map((slot) => (
                    <TouchableOpacity
                      key={slot.value}
                      style={[
                        styles.timeOption,
                        values.startTime === slot.value && styles.selectedTimeOption,
                      ]}
                      onPress={() => {
                        setFieldValue('startTime', slot.value);
                        setFieldValue('endTime', slot.endTime);
                      }}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          values.startTime === slot.value && styles.selectedTimeOptionText,
                        ]}
                      >
                        {slot.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {errors.startTime && touched.startTime && (
                  <Text style={styles.errorText}>{errors.startTime}</Text>
                )}
              </View>

              <View style={styles.rulesContainer}>
                <Text style={styles.rulesTitle}>Regras de Agendamento:</Text>
                <View style={styles.ruleItem}>
                  <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
                  <Text style={styles.ruleText}>Máximo de 2 agendamentos por semana</Text>
                </View>
                <View style={styles.ruleItem}>
                  <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
                  <Text style={styles.ruleText}>Agendamentos com no máximo 1 semana de antecedência</Text>
                </View>
                <View style={styles.ruleItem}>
                  <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
                  <Text style={styles.ruleText}>Cancelamentos devem ser feitos com pelo menos 24h de antecedência</Text>
                </View>
              </View>

              <AppButton
                title={isEditMode ? 'Atualizar Agendamento' : 'Confirmar Agendamento'}
                onPress={handleSubmit}
              />
              
              {isEditMode && (
                <AppButton
                  title="Cancelar Agendamento"
                  onPress={handleDelete}
                  color="error"
                />
              )}
              
              <AppButton
                title="Voltar"
                onPress={() => navigation.goBack()}
                color="secondary"
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  formContainer: {
    padding: 20,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.white,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  datePickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },
  timeSelectionContainer: {
    marginVertical: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  timeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeOption: {
    width: '48%',
    padding: 12,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedTimeOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeOptionText: {
    color: colors.text,
    fontSize: 14,
  },
  selectedTimeOptionText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
  },
  rulesContainer: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleText: {
    marginLeft: 8,
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default BookingFormScreen;
