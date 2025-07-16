import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // İkon için
import { LinearGradient } from 'expo-linear-gradient'; // <-- EKLENDİ


export default function Index() {
  const [nabizRef, setNabiz] = useState(null);
  const [gsrRef, setGsr] = useState(null);
  const [piezoRef, setPiezo] = useState(null);
  const [sicaklikRef, setSicaklik] = useState(null);
  const [spo2Ref, setSpo2] = useState(null);
  const [riskResult, setRiskResult] = useState(null);
  const navigation = useNavigation();

  const blinkAnim = useRef(new Animated.Value(1)).current;

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userInfo');
    navigation.replace('LoginScreen');
  };

  useEffect(() => {
    const nabizRef = ref(db, 'users/user_1/Nabiz');
    const gsrRef = ref(db, 'users/user_1/GSR_Ortalama');
    const piezoRef = ref(db, 'users/user_1/Piezo_Ortalama');
    const sicaklikRef = ref(db, 'users/user_1/Sicaklik_Ortalama');
    const spo2Ref = ref(db, 'users/user_1/SpO2');

    const unsubNabiz = onValue(nabizRef, snap => setNabiz(snap.val()));
    const unsubGsr = onValue(gsrRef, snap => setGsr(snap.val()));
    const unsubPiezo = onValue(piezoRef, snap => setPiezo(snap.val()));
    const unsubSicaklik = onValue(sicaklikRef, snap => setSicaklik(snap.val()));
    const unsubSpo2 = onValue(spo2Ref, snap => setSpo2(snap.val()));

    return () => {
      unsubNabiz();
      unsubGsr();
      unsubPiezo();
      unsubSicaklik();
      unsubSpo2();
    };
  }, []);

  useEffect(() => {
    if (nabizRef && gsrRef && piezoRef && sicaklikRef && spo2Ref) {
      fetch('http://192.168.93.41:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          GSR: gsrRef,
          Nabiz: nabizRef,
          Piezo: piezoRef,
          Sicaklik: sicaklikRef,
          SpO2: spo2Ref,
        }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('Risk Durumu:', data.risk);
          setRiskResult(data.risk);
        })

        .catch(err => console.error('Risk hesaplama hatası:', err));
    }
  }, [nabizRef, gsrRef, piezoRef, sicaklikRef, spo2Ref]);

  useEffect(() => {
    if (riskResult === 'Yüksek Risk') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [riskResult]);

  return (
    
      <LinearGradient
        colors={['#80D7FF', '#4AA0D5', '#003B73']} // <-- GRADYAN RENKLER
        style={styles.container}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
      
      {/* ÜST KISIM: Logo + Başlık + Logout */}
      <View style={styles.headerRow}>
        <Image
          source={require('../assets/tezlogo.png')} // logo.png: proje dizininde assets klasörüne eklenmeli
          style={styles.logo}
        />
        <Text style={styles.headerTitle}>TechCare</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#000" marginTop= {30} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => {/* profil sayfasına yönlendirme yapılabilir */}}>
          <Image source={require('../assets/images.png')} style={styles.profile} />
       </TouchableOpacity>
       <Text style={styles.title}>Anlık Sensör Verileri</Text>
      {/* SENSÖR VERİLERİ */}
      <View style={styles.dataContainer}>
        {/* Nabız ve SpO2 yan yana */}
        
        <View style={[styles.dataBox, {marginRight: 8}]}>
          <Text style={styles.dataTitle}>❤️ Nabız:</Text>
          <Text style={styles.dataValue}>{nabizRef ?? '...'} bpm </Text>
        </View>

        <View style={styles.dataBox}>
          <Text style={styles.dataTitle}>🩸 SpO2:</Text>
          <Text style={styles.dataValue}>{spo2Ref ?? '...'}  % </Text>
        </View>
      </View>

      <View style={styles.dataContainer}>
        {/* Sıcaklık ve GSR yan yana */}
        <View style={styles.dataBox}>
          <Text style={styles.dataTitle}>🌡️ Sıcaklık:</Text>
          <Text style={styles.dataValue}>{sicaklikRef ?? '...'} °C </Text>
        </View>

        <View style={styles.dataBox}>
          <Text style={styles.dataTitle}>🖐️ GSR:</Text>
          <Text style={styles.dataValue}>{gsrRef ?? '...'}</Text>
        </View>
      </View>

      <View style={styles.dataContainer}>
      {/* Piezo alt kısımda */}
      <View style={[styles.dataBox,{marginLeft: 100 }]}>
        <Text style={styles.dataTitle}>🫁 Piezo:</Text>
        <Text style={styles.dataValue}>{piezoRef ?? '...'}</Text>
      </View>
      </View>

      <Animated.View
        style={[
          styles.riskBox,
          {
            backgroundColor:
              riskResult === 'Yüksek Risk'
                ? 'rgba(214, 40, 40, 0.7)'
                : riskResult === 'Düşük Risk'
                ? 'rgba(0, 127, 95, 0.7)'
                : 'rgba(255, 255, 255, 0.6)',
            opacity: riskResult === 'Yüksek Risk' ? blinkAnim : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.risk,
            {
              color: '#fff',
            },
          ]}
        >
           Risk Durumu: {riskResult ? riskResult : '...'}
        </Text>
      </Animated.View>
    </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1, 
    backgroundColor: '#80D7FF', 

  },
  logo: {
    width: 65,
    height: 65,
    marginRight: 10,
    borderRadius: 30,
    marginTop: 30,
  },
  
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  
  profile: {
    width: 150,
    height: 150,
    borderRadius: 80,
    marginLeft: 122,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#003B73',
    marginTop:30,   
    
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginVertical: 20,
    fontWeight: 'bold',
  },
  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  dataBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Şeffaf kutu (opacity ile)
    padding: 15,
    borderRadius: 10,
    width: '47%',
    height: 100,
    alignItems: 'center',
    marginVertical: -7, // Üst/alt boşluk
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    
  },
  dataValue: {
    fontSize: 22,
    color: '#000',
    marginTop: 10,
  },
  riskBox: {
    padding: 20,
    height: '13%',
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  risk: {
    fontSize: 25,
    fontWeight: '900',
    padding: 10,
  },
  
});
