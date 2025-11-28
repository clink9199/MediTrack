// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR.API.KEY",
  authDomain: "YOUR.DOMAIN",
  projectId: "PROJECT.ID",
  storageBucket: "STORAGE.BUCKET",
  messagingSenderId: "SENDER.ID",
  appId: "YOUR.API.ID"
};

// Initialize Firebase only after ensuring the SDK is loaded
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    
    // Initialize Firebase services as window globals
    window.auth = firebase.auth();
    window.db = firebase.firestore();
} else {
    console.error('Firebase SDK not loaded. Make sure Firebase scripts are included before this file.');
}


// Helper function to save user data
async function saveUserData(uid, userData, userType) {
    try {
        // Save to users collection for quick type lookup
        await db.collection('users').doc(uid).set({
            email: userData.email,
            userType: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Save to type-specific collection
        const collection = userType === 'patient' ? 'patients' : 'caretakers';
        await db.collection(collection).doc(uid).set({
            ...userData,
            uid: uid,
            userType: userType,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error saving user data:', error);
        return { success: false, error: error.message };
    }
}

// Helper function to get user data
async function getUserData(uid) {
    try {
        // First, get user type
        const userDoc = await db.collection('users').doc(uid).get();
        
        if (!userDoc.exists) {
            throw new Error('User not found');
        }

        const userType = userDoc.data().userType;
        
        // Get full user data from appropriate collection
        const collection = userType === 'patient' ? 'patients' : 'caretakers';
        const userDataDoc = await db.collection(collection).doc(uid).get();
        
        if (!userDataDoc.exists) {
            throw new Error('User data not found');
        }

        return {
            success: true,
            data: userDataDoc.data()
        };
    } catch (error) {
        console.error('Error getting user data:', error);
        return { success: false, error: error.message };
    }
}

// Helper function to sign out
async function signOut() {
    try {
        await auth.signOut();
        sessionStorage.clear();
        localStorage.removeItem('rememberMe');
        return { success: true };
    } catch (error) {
        console.error('Error signing out:', error);
        return { success: false, error: error.message };
    }
}

// Helper function to check if user is logged in
function checkAuthState(callback) {
    auth.onAuthStateChanged(callback);
}
