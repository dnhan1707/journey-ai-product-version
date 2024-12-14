import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc, getDocs, setDoc, serverTimestamp, collection, deleteDoc } from "firebase/firestore";
import { db } from "./firebase/firebase.js";

// Create a UserContext
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [userUid, setUserUid] = useState(null);
  const [city, setCity] = useState(null);
  const [duration, setDuration] = useState(null);
  const [tripName, setTripName] = useState(null);
  const [totalEstimation, setTotalEstimation] = useState(null);
  const [itinerary, setItinerary] = useState({});

  const addNewActivity = (day, activity) => {
    setItinerary(prevItinerary => {
      const updatedDay = prevItinerary[`day${day}`] ? [...prevItinerary[`day${day}`].activities, activity] : [activity];
      const newItinerary = { ...prevItinerary, [`day${day}`]: { activities: updatedDay } };
      console.log("Updated Itinerary in addNewActivity:", newItinerary); // Log updated itinerary
      return newItinerary;
    });
  };

  useEffect(() => {
    console.log("Updated itinerary:", itinerary);
  }, [itinerary]);

  const savePlan = async () => {
    const savedPlansRef = collection(db, "users", userUid, "saved_plans");
    const newPlanRef = doc(savedPlansRef);
    const newPlan = {
        city: city,
        duration: duration,
        itinerary: itinerary, // Correctly use the itinerary state
        tripname: tripName,
        estimated_total: totalEstimation,
        created_at: serverTimestamp()
    };

    try {
      await setDoc(newPlanRef, newPlan);
      console.log("Plan saved successfully");
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  }

  const getSavedPlans = async (userUid) => {
    // Reference to the user's saved plans collection
    const savedPlansRef = collection(db, "users", userUid, "saved_plans");
    
    try {
        // Get all documents in the saved plans collection
        const querySnapshot = await getDocs(savedPlansRef);
        
        // Reduce the documents into an object
        const plans = querySnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
      }, {});

      return plans; // This returns an object with document IDs as keys and document data as values
  } catch (error) {
      console.error("Error getting saved plans:", error);
      return {};
    }
  }

  const getPlanById = async (userUid, planId) => {
    const planRef = doc(db, "users", userUid, "saved_plans", planId);
    
    try {
        const planDoc = await getDoc(planRef);
        if (planDoc.exists()) {
            return planDoc.data();
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error getting plan by ID:", error);
        return null;
    }
  }

  const getSavedPlanId = async (userUid) => {
    const savedPlansRef = collection(db, "users", userUid, "saved_plans");
    const querySnapshot = await getDocs(savedPlansRef);

    const planId = querySnapshot.docs.map(doc => doc.id);
    return planId;
  }

  // Plan id here is the id of the doc in the subcollection named `saved_plans`
  const removePlan = async (planId) => {
    const planRef = doc(db, "users", userUid, "saved_plans", planId);
    try {
      await deleteDoc(planRef);
      console.log("Plan removed successfully: ", planId);
    } catch (error) {
      console.error("Error removing plan:", error);
    }
  }

  return (
    <UserContext.Provider value={{
        userUid, setUserUid,
        city, setCity,
        duration, setDuration,
        tripName, setTripName,
        itinerary, setItinerary,
        totalEstimation, setTotalEstimation,
        addNewActivity, savePlan, getSavedPlans, getSavedPlanId, removePlan, getPlanById
      }}>
        {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};