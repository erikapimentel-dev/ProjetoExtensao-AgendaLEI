// src/components/BookingCard.js
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '../config/colors';
import { formatDateWithWeekday } from '../utils/dateUtils';

const BookingCard = ({ booking, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.dateTimeContainer}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="calendar-clock" size={24} color={colors.primary} />
        </View>
        <View style={styles.dateTimeInfo}>
          <Text style={styles.date}>{formatDateWithWeekday(booking.date)}</Text>
          <Text style={styles.time}>{booking.startTime} - {booking.endTime}</Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detail}>
          <MaterialCommunityIcons name="account-group" size={20} color={colors.textSecondary} />
          <Text style={styles.detailText}>{booking.className}</Text>
        </View>
        
        <View style={styles.detail}>
          <MaterialCommunityIcons name="book-open-variant" size={20} color={colors.textSecondary} />
          <Text style={styles.detailText}>{booking.activity}</Text>
        </View>

        <View style={styles.detail}>
          <MaterialCommunityIcons name="account" size={20} color={colors.textSecondary} />
          <Text style={styles.detailText}>{booking.teacherName}</Text>
        </View>
      </View>
      
      <View style={styles.statusContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: colors.success }]} />
        <Text style={styles.statusText}>Confirmado</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
    borderLeftWidth: 5,
    borderLeftColor: colors.primary,
    elevation: 2,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  iconContainer: {
    justifyContent: 'center',
    marginRight: 10,
  },
  dateTimeInfo: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailsContainer: {
    marginBottom: 10,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  detailText: {
    marginLeft: 8,
    color: colors.text,
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: 'bold',
  },
});

export default BookingCard;
