# 💧 WaQu – Water Quality App

**WaQu (Water Quality Map)** is a mobile application built with **React Native + Expo** that helps users **predict and map water quality in real-time**.  
The app leverages **AI prediction models** and smartphone cameras to assess water conditions and visualize them on an **interactive map**.  

WaQu was developed as part of the **PKM-KC 2025** project, aligning with **SDG 6: Clean Water and Sanitation** to support sustainable water resource management.

---

## 📖 Background
Access to clean water remains a challenge worldwide — over **2 billion people** lack safe water (WHO, 2022). In Indonesia, many rivers and wells face pollution risks from domestic and industrial waste.  

WaQu addresses this issue by:
- Enabling **real-time water quality prediction** using AI and cameras.  
- Providing a **map-based visualization** of water conditions.  
- Offering **early warnings** when nearby water sources are unsafe.  

---

## 🎯 Objectives
1. Build a mobile app that predicts water quality using **AI + smartphone camera**.  
2. Display results on a **map interface**, similar to air pollution maps.  
3. Provide **early alerts** for poor water quality.  
4. Encourage **community participation** in water preservation.  

---

## 🌟 Features
- 📷 **AI-based water quality prediction** via camera capture.  
- 🗺️ **Interactive map** showing indexed water quality at different locations.  
- ⚠️ **Early warning system** when water is unsafe.  
- 📊 **User history & logs** for past predictions.  
- 👤 **Account system** (sign up, login, profile management).  

---

## 📂 Project Structure
```
waqu-water-quality-app/
│
├── app/              # Main app screens (file-based routing with Expo Router)
├── components/       # UI components
├── assets/           # Icons, images, fonts
├── package.json      # Dependencies
├── App.js            # App entry point
└── README.md
```

---

## 🛠️ Tech Stack
- **React Native + Expo** – Frontend framework  
- **TensorFlow Lite (planned)** – AI water quality model integration  
- **Google Maps API** – Map visualization  
- **Appwrite / Firebase (planned)** – Backend for user accounts & data storage  
- **Jira + GitHub** – Agile project management & version control  

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/evanfhartono/waqu-water-quality-app.git
cd waqu-water-quality-app
```

### 2. Install dependencies
```bash
npm install
# or
npm ci
```

### 3. Start the Expo app
```bash
npx expo start
```

You can run it on:
- 📱 **Expo Go** (scan QR code)  
- 📱 **Development Build** (Android/iOS emulator)  
- 🌐 **Web Preview**  

---

## 📸 Prototype Preview
*(UI design from Figma + current prototype build)*  

- Home & Map View  
- Camera-based Prediction  
- Early Warning Alerts  
<img width="1093" height="928" alt="5bRCOJNxks" src="https://github.com/user-attachments/assets/7ca670d2-6efe-4552-862d-21c8e4833677" />

---

## 👨‍💻 Contributors
- **Evan F. Hartono** – AI Model, Map & Alerts  
- **Arthaz Anthony** – UI/UX Design  
- **Osel C. Chen** – Profile & Authentication Pages  
- **Rafi H. Tafara** – Backend & Database Schema  
- **Yosepril Zhounggi** – Camera Functionality  

Supervisor: **Ghina Zain Nabiilah, S.Kom., M.Kom.**

---

## 📚 References
- Guo et al. (2024). *Hybrid CNN-LSTM for water quality prediction*.  
- Haekal & Wibowo (2023). *Water quality prediction with ML*.  
- Lesmana & Fuady (2023). *Water quality mapping with ArcGIS*.  
- WHO (2022). *Global water access report*.  

---
