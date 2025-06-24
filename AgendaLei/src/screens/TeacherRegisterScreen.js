// src/screens/TeacherRegisterScreen.js
import React, { useState } from 'react';
import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import AppButton from '../components/AppButton';
import AppTextInput from '../components/AppTextInput';
import colors from '../config/colors';
import LoadingIndicator from '../components/LoadingIndicator';
import { saveTeacher, setCurrentTeacher } from '../utils/asyncStorage';
import Header from '../components/Header';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().required('Email é obrigatório').email('Email inválido'),
  disciplina: Yup.string().required('Disciplina é obrigatória'),
});

const TeacherRegisterScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    try {
      setLoading(true);
      
      // Salvar dados do professor
      const teacher = await saveTeacher({
        name: values.name,
        email: values.email,
        disciplina: values.disciplina,
        phone: values.phone || '',
      });
      
      // Definir professor atual
      await setCurrentTeacher(teacher);
      
      setLoading(false);
      
      navigation.replace('MainApp');
    } catch (error) {
      setLoading(false);
      Alert.alert('Erro', 'Não foi possível realizar o cadastro. Tente novamente.');
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      style={styles.container}
    >
      <Header title="Cadastro de Professor" showBackButton={false} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Bem-vindo ao AgendaLEI</Text>
          <Text style={styles.subtitle}>
            Preencha os dados abaixo para se cadastrar e começar a usar o aplicativo
          </Text>
        </View>

        <Formik
          initialValues={{
            name: '',
            email: '',
            disciplina: '',
            phone: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ handleChange, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              <AppTextInput
                icon="account"
                placeholder="Nome completo"
                value={values.name}
                onChangeText={handleChange('name')}
                error={errors.name}
                touched={touched.name}
                autoCapitalize="words"
              />

              <AppTextInput
                icon="email"
                placeholder="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                keyboardType="email-address"
                error={errors.email}
                touched={touched.email}
                autoCapitalize="none"
              />

              <AppTextInput
                icon="book-open-variant"
                placeholder="Disciplina que leciona"
                value={values.disciplina}
                onChangeText={handleChange('disciplina')}
                error={errors.disciplina}
                touched={touched.disciplina}
                autoCapitalize="words"
              />

              <AppTextInput
                icon="phone"
                placeholder="Telefone (opcional)"
                value={values.phone}
                onChangeText={handleChange('phone')}
                keyboardType="phone-pad"
              />

              <AppButton title="Cadastrar" onPress={handleSubmit} />
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
  headerContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
  },
  formContainer: {
    padding: 20,
  },
});

export default TeacherRegisterScreen;
