# 💊 MediTrack

**MediTrack** is a modern web-based medication management system designed to help patients track their medications and enable caretakers to monitor patient medication adherence in real-time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Firebase](https://img.shields.io/badge/Firebase-9.22.0-orange.svg)](https://firebase.google.com/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://html.spec.whatwg.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 🌟 Features

### For Patients
- **📸 AI Prescription Scanning**: Upload prescription images and extract medication details using OCR (Tesseract.js)
- **💊 Medication Management**: Add, view, edit, and delete medications
- **⏰ Smart Reminders**: Time-based browser notifications for medication schedules
- **🔍 Drug Search**: Search medication information using the OpenFDA API
- **🏥 Caretaker Linking**: Connect with caretakers for medication monitoring
- **📊 Dashboard Analytics**: Track active medications, daily doses, and schedules
- **🔔 Custom Notifications**: Beautiful toast notifications instead of browser alerts
- **🔐 Secure Authentication**: Firebase-based email/password authentication

### For Caretakers
- **👥 Patient Monitoring**: View connected patient's medication schedules
- **⏰ Medication Alerts**: Receive notifications when patients need to take medications
- **📈 Health Tracking**: Monitor patient's medication adherence
- **📊 Analytics Dashboard**: Overview of patient's active medications and doses
- **🚨 Refill Alerts**: Get notified when patient medications are running low
- **📱 Real-time Updates**: Instant synchronization with patient data

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend/Database**: Firebase (Firestore, Authentication)
- **OCR**: Tesseract.js (Client-side)
- **API**: OpenFDA Drug API
- **Design**: Custom CSS with modern glassmorphism and gradient effects
- **Fonts**: Google Fonts (Inter)

## 📋 Prerequisites

Before you begin, ensure you have:
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A Firebase account ([Get one here](https://firebase.google.com/))
- Node.js and npm (for local development server - optional)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/meditrack.git
cd meditrack
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Cloud Firestore** (Database)

3. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the configuration object

4. Update `firebase-config.js` or replace the config in each HTML file:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Firestore Database Structure

Set up the following collections in Firestore:

```
users/
  {uid}/
    - userType: "patient" | "caretaker"
    - email: string
    - createdAt: timestamp

patients/
  {uid}/
    - fullName: string
    - email: string
    - phone: string
    - createdAt: timestamp
    
    medications/ (subcollection)
      {medId}/
        - name: string
        - dosage: string
        - frequency: string
        - times: array
        - stock: number
        - createdAt: timestamp
    
    caregivers/ (subcollection)
      {caretakerId}/
        - fullName: string
        - email: string
        - addedAt: timestamp

caretakers/
  {uid}/
    - fullName: string
    - email: string
    - phone: string
    - createdAt: timestamp
    
    patients/ (subcollection)
      {patientId}/
        - fullName: string
        - email: string
        - linkedAt: timestamp
```

### 4. Firestore Security Rules

Add these security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check authentication
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check user type
    function isUserType(userType) {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == userType;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn() && request.auth.uid == userId;
      allow write: if isSignedIn() && request.auth.uid == userId;
    }
    
    // Patients collection
    match /patients/{patientId} {
      allow read: if isSignedIn() && (request.auth.uid == patientId || isUserType('caretaker'));
      allow write: if isSignedIn() && request.auth.uid == patientId;
      
      // Medications subcollection
      match /medications/{medId} {
        allow read: if isSignedIn() && (request.auth.uid == patientId || isUserType('caretaker'));
        allow write: if isSignedIn() && request.auth.uid == patientId;
      }
      
      // Caregivers subcollection
      match /caregivers/{caretakerId} {
        allow read: if isSignedIn() && (request.auth.uid == patientId || request.auth.uid == caretakerId);
        allow write: if isSignedIn() && request.auth.uid == patientId;
      }
    }
    
    // Caretakers collection
    match /caretakers/{caretakerId} {
      allow read: if isSignedIn() && (request.auth.uid == caretakerId || isUserType('patient'));
      allow write: if isSignedIn() && request.auth.uid == caretakerId;
      
      // Patients subcollection
      match /patients/{patientId} {
        allow read: if isSignedIn() && (request.auth.uid == caretakerId || request.auth.uid == patientId);
        allow write: if isSignedIn() && request.auth.uid == caretakerId;
      }
    }
  }
}
```

### 5. Run the Application

#### Option A: Using a Local Server
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (http-server)
npx http-server -p 8000
```

Then open: `http://localhost:8000/landing.html`

#### Option B: Using VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click on `landing.html`
3. Select "Open with Live Server"

## 📱 Usage

### Patient Workflow
1. **Sign Up**: Create an account as a "Patient"
2. **Add Medications**: 
   - Upload prescription image for AI scanning
   - Or manually enter medication details
   - Set medication times (e.g., 08:00, 14:00, 20:00)
3. **Link Caretaker**: Add a caretaker using their email and password
4. **Enable Notifications**: Allow browser notifications for reminders
5. **Track Schedule**: View today's medication schedule and upcoming doses

### Caretaker Workflow
1. **Sign Up**: Create an account as a "Caretaker"
2. **Patient Links You**: Patient adds you using your credentials
3. **Monitor Patient**: View patient's medications and schedules
4. **Receive Alerts**: Get notified when it's time for patient to take medication
5. **Track Adherence**: Monitor patient's medication intake

## 🎨 Pages Overview

- **`landing.html`** - Landing page with features overview
- **`signup.html`** - User registration (Patient/Caretaker)
- **`login.html`** - User authentication
- **`patient-dashboard.html`** - Patient's main dashboard
  - Home, Scan Prescription, Medicines, Search, Caregivers, Settings
- **`caretaker-dashboard.html`** - Caretaker's monitoring dashboard
  - Overview, Medications, Dose Logs, Profile

## 🔔 Notifications

MediTrack uses two types of notifications:

1. **Toast Notifications**: In-app styled notifications
   - Success (green)
   - Error (red)
   - Warning (orange)
   - Info (blue)

2. **Browser Notifications**: System-level medication reminders
   - Time-based alerts
   - Requires user permission
   - Works even when tab is inactive

## 🔒 Security Features

- ✅ Firebase Authentication
- ✅ Firestore Security Rules
- ✅ Session management with `sessionStorage`
- ✅ User type verification
- ✅ Secure password verification for caretaker linking

## 📊 API Integration

### OpenFDA Drug API
Used for medication search functionality:
```
https://api.fda.gov/drug/label.json?search=brand_name:{query}
```

Returns:
- Brand name
- Generic name
- Indications and usage
- Warnings
- Dosage information

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues

- Prescription scanning accuracy depends on image quality
- Browser notifications require user permission
- Real-time sync requires active internet connection

## 🔮 Future Enhancements

- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced OCR with medication recognition
- [ ] Medication interaction warnings
- [ ] Dose history tracking
- [ ] Healthcare provider integration
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Export medication reports (PDF)
- [ ] SMS/Email reminders
- [ ] Medication refill integration with pharmacies

## 👨‍💻 Author

**Shaik Abdul Arshad**
- Email: shaikabdularshad@klh.edu.in
- GitHub: [@clink9199](https://github.com/clink9199)

**Mohammed Faisal Imraan**
- Email: mohammedfaisalimraan@klh.edu.in
- GitHub: [@Faisal9381](https://github.com/Faisal9381)

**Mohammad Zaid Amaan**
- Email: mohammadzaidamaan@klh.edu.in

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) - Backend services
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR functionality
- [OpenFDA](https://open.fda.gov/) - Drug information API
- [Google Fonts](https://fonts.google.com/) - Typography

## 📞 Support

For support, email shaikabdularshad@klh.edu.in or open an issue in the GitHub repository.

---

**Made with ❤️ for better healthcare management**
