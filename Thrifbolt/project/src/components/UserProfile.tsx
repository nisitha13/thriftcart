import React, { useState, useEffect } from 'react';
import { User, Settings, Heart, Clock, ShoppingBag, MapPin, Bell, CreditCard, LogOut, ShoppingCart, Car, Package } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore';
import { app } from '../firebase';

// Initialize Firestore
const db = getFirestore(app);

// Types for user preferences
type PreferenceCategory = 'notification' | 'privacy' | 'grocery' | 'ride' | 'ecommerce';

interface UserPreference {
  id: string;
  name: string;
  value: string | boolean | number | string[];
  type: 'toggle' | 'select' | 'multiselect' | 'range' | 'text';
  category: PreferenceCategory;
  description?: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
}

interface UserProfileProps {
  // Add any props if needed
}

interface UserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  joinDate: string;
  address?: string;
  defaultPaymentMethod?: string;
  preferences?: {
    [key: string]: any;
  };
}

const UserProfile: React.FC<UserProfileProps> = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const auth = getAuth();

  // Initialize preferences structure with detailed preferences for different services
  const initializePreferences = (userPrefs: any = {}) => {
    const defaultPreferences: UserPreference[] = [
      // Grocery Preferences
      {
        id: 'preferredGroceryStores',
        name: 'Preferred Grocery Stores',
        value: userPrefs.preferredGroceryStores || ['bigbasket', 'blinkit'],
        type: 'multiselect',
        category: 'grocery',
        description: 'Select your preferred grocery delivery services',
        options: [
          { label: 'BigBasket', value: 'bigbasket' },
          { label: 'Blinkit', value: 'blinkit' },
          { label: 'Zepto', value: 'zepto' },
          { label: 'Swiggy Instamart', value: 'swiggy' },
          { label: 'Dunzo', value: 'dunzo' },
        ]
      },
      {
        id: 'groceryBudget',
        name: 'Weekly Grocery Budget (₹)',
        value: userPrefs.groceryBudget || 2000,
        type: 'range',
        category: 'grocery',
        description: 'Your weekly grocery spending limit',
        min: 500,
        max: 10000,
        step: 100
      },
      {
        id: 'deliveryTimePreference',
        name: 'Preferred Delivery Time',
        value: userPrefs.deliveryTimePreference || 'evening',
        type: 'select',
        category: 'grocery',
        description: 'Your preferred time for grocery deliveries',
        options: [
          { label: 'Morning (8 AM - 12 PM)', value: 'morning' },
          { label: 'Afternoon (12 PM - 4 PM)', value: 'afternoon' },
          { label: 'Evening (4 PM - 8 PM)', value: 'evening' },
          { label: 'Night (8 PM - 11 PM)', value: 'night' }
        ]
      },
      
      // Ride Preferences
      {
        id: 'preferredRideApps',
        name: 'Preferred Ride Apps',
        value: userPrefs.preferredRideApps || ['uber', 'rapido'],
        type: 'multiselect',
        category: 'ride',
        description: 'Select your preferred ride-hailing services',
        options: [
          { label: 'Uber', value: 'uber' },
          { label: 'Rapido', value: 'rapido' },
          { label: 'Ola', value: 'ola' },
          { label: 'inDrive', value: 'indrive' },
          { label: 'Namma Yatri', value: 'nammayatri' }
        ]
      },
      {
        id: 'preferredRideType',
        name: 'Preferred Ride Type',
        value: userPrefs.preferredRideType || 'bike',
        type: 'select',
        category: 'ride',
        description: 'Your preferred type of ride',
        options: [
          { label: 'Bike', value: 'bike' },
          { label: 'Auto', value: 'auto' },
          { label: 'Car (Hatchback)', value: 'hatchback' },
          { label: 'Car (Sedan)', value: 'sedan' },
          { label: 'Car (SUV)', value: 'suv' }
        ]
      },
      {
        id: 'driverRatingThreshold',
        name: 'Minimum Driver Rating',
        value: userPrefs.driverRatingThreshold || 4.0,
        type: 'range',
        category: 'ride',
        description: 'Minimum driver rating you prefer (out of 5)',
        min: 1,
        max: 5,
        step: 0.1
      },
      
      // E-commerce Preferences
      {
        id: 'preferredEcommercePlatforms',
        name: 'Preferred Shopping Apps',
        value: userPrefs.preferredEcommercePlatforms || ['amazon', 'flipkart'],
        type: 'multiselect',
        category: 'ecommerce',
        description: 'Select your preferred online shopping platforms',
        options: [
          { label: 'Amazon', value: 'amazon' },
          { label: 'Flipkart', value: 'flipkart' },
          { label: 'Meesho', value: 'meesho' },
          { label: 'Myntra', value: 'myntra' },
          { label: 'Tata Neu', value: 'tataneu' },
          { label: 'Ajio', value: 'ajio' },
          { label: 'Nykaa', value: 'nykaa' }
        ]
      },
      {
        id: 'preferredDeliverySpeed',
        name: 'Preferred Delivery Speed',
        value: userPrefs.preferredDeliverySpeed || 'standard',
        type: 'select',
        category: 'ecommerce',
        description: 'Your preferred delivery speed (may affect cost)',
        options: [
          { label: 'Same Day', value: 'same-day' },
          { label: '1-2 Days', value: '1-2-days' },
          { label: '3-5 Days (Standard)', value: 'standard' },
          { label: 'No Rush (5+ days)', value: 'no-rush' }
        ]
      },
      {
        id: 'productCategories',
        name: 'Frequent Product Categories',
        value: userPrefs.productCategories || ['electronics', 'fashion'],
        type: 'multiselect',
        category: 'ecommerce',
        description: 'Categories you shop most frequently',
        options: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Fashion', value: 'fashion' },
          { label: 'Home & Kitchen', value: 'home-kitchen' },
          { label: 'Beauty & Personal Care', value: 'beauty' },
          { label: 'Books', value: 'books' },
          { label: 'Toys & Games', value: 'toys-games' },
          { label: 'Sports & Fitness', value: 'sports-fitness' },
          { label: 'Grocery', value: 'grocery' }
        ]
      },
      
      // Notification Preferences
      {
        id: 'emailNotifications',
        name: 'Email Notifications',
        value: userPrefs.emailNotifications ?? true,
        type: 'toggle',
        category: 'notification',
        description: 'Receive email notifications about your orders and offers'
      },
      {
        id: 'pushNotifications',
        name: 'Push Notifications',
        value: userPrefs.pushNotifications ?? true,
        type: 'toggle',
        category: 'notification',
        description: 'Get real-time updates on your phone'
      },
      {
        id: 'smsAlerts',
        name: 'SMS Alerts',
        value: userPrefs.smsAlerts ?? true,
        type: 'toggle',
        category: 'notification',
        description: 'Receive order updates via SMS'
      },
      
      // Privacy & Security
      {
        id: 'locationSharing',
        name: 'Share My Location',
        value: userPrefs.locationSharing ?? true,
        type: 'toggle',
        category: 'privacy',
        description: 'Allow apps to access your location for better service'
      },
      {
        id: 'personalizedAds',
        name: 'Personalized Ads',
        value: userPrefs.personalizedAds ?? true,
        type: 'toggle',
        category: 'privacy',
        description: 'See ads that are more relevant to you'
      },
      
      // Ride Preferences
      {
        id: 'preferredRideType',
        name: 'Preferred Ride Type',
        value: userPrefs.preferredRideType ?? 'bike',
        type: 'select',
        category: 'ride',
        description: 'Your preferred type of ride',
        options: [
          { label: 'Bike', value: 'bike' },
          { label: 'Auto', value: 'auto' },
          { label: 'Car (Hatchback)', value: 'hatchback' },
          { label: 'Car (Sedan)', value: 'sedan' },
          { label: 'Car (SUV)', value: 'suv' }
        ]
      },
      {
        id: 'driverRatingThreshold',
        name: 'Minimum Driver Rating',
        value: userPrefs.driverRatingThreshold ?? 4.0,
        type: 'range',
        category: 'ride',
        description: 'Minimum driver rating you prefer (out of 5)',
        min: 1,
        max: 5,
        step: 0.1
      },
      
      // E-commerce Preferences
      {
        id: 'preferredEcommercePlatforms',
        name: 'Preferred Shopping Apps',
        value: userPrefs.preferredEcommercePlatforms || ['amazon', 'flipkart'],
        type: 'multiselect',
        category: 'ecommerce',
        description: 'Select your preferred online shopping platforms',
        options: [
          { label: 'Amazon', value: 'amazon' },
          { label: 'Flipkart', value: 'flipkart' },
          { label: 'Meesho', value: 'meesho' },
          { label: 'Myntra', value: 'myntra' },
          { label: 'Tata Neu', value: 'tataneu' },
          { label: 'Ajio', value: 'ajio' },
          { label: 'Nykaa', value: 'nykaa' }
        ]
      },
      {
        id: 'preferredDeliverySpeed',
        name: 'Preferred Delivery Speed',
        value: userPrefs.preferredDeliverySpeed || 'standard',
        type: 'select',
        category: 'ecommerce',
        description: 'Your preferred delivery speed (may affect cost)',
        options: [
          { label: 'Same Day', value: 'same-day' },
          { label: '1-2 Days', value: '1-2-days' },
          { label: '3-5 Days (Standard)', value: 'standard' },
          { label: 'No Rush (5+ days)', value: 'no-rush' }
        ]
      },
      {
        id: 'productCategories',
        name: 'Frequent Product Categories',
        value: userPrefs.productCategories || ['electronics', 'fashion'],
        type: 'multiselect',
        category: 'ecommerce',
        description: 'Categories you shop most frequently',
        options: [
          { label: 'Electronics', value: 'electronics' },
          { label: 'Fashion', value: 'fashion' },
          { label: 'Home & Kitchen', value: 'home-kitchen' },
          { label: 'Beauty & Personal Care', value: 'beauty' },
          { label: 'Books', value: 'books' },
          { label: 'Toys & Games', value: 'toys-games' },
          { label: 'Sports & Fitness', value: 'sports-fitness' },
          { label: 'Grocery', value: 'grocery' }
        ]
      }
    ];
    
    setPreferences(defaultPreferences);
  };

  // Fetch user data from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('No user logged in');
        }

        // Get user document from Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        console.log('UserProfile: Getting user document from Firestore');
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          console.log('UserProfile: Found existing user document', userDoc.data());
          const userData = userDoc.data() as UserData;
          setUser({
            ...userData,
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber,
            photoURL: currentUser.photoURL,
            joinDate: userData.joinDate || new Date(currentUser.metadata.creationTime || '').toISOString(),
          });
          
          // Initialize preferences with user's saved preferences
          console.log('UserProfile: Setting existing preferences', userData.preferences || {});
          initializePreferences(userData.preferences || {});
        } else {
          console.log('UserProfile: No user document found, creating a new one');
          // Create a new user document if it doesn't exist
          const newUserData = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            phoneNumber: currentUser.phoneNumber,
            photoURL: currentUser.photoURL,
            joinDate: new Date().toISOString(),
          };
          
          console.log('UserProfile: Creating new user document with data', newUserData);
          setUser(newUserData);
          initializePreferences({});
        }
      } catch (error) {
        console.error('UserProfile: Error fetching user data:', error);
      } finally {
        console.log('UserProfile: Finished loading user data');
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Update preference in Firestore
  const updatePreference = async (id: string, newValue: any) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`preferences.${id}`]: newValue
      });
      
      // Update local state
      setPreferences(prev => 
        prev.map(pref => 
          pref.id === id ? { ...pref, value: newValue } : pref
        )
      );
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, value: !pref.value } : pref
      )
    );
  };

  // Helper function to render form controls based on preference type
  const renderPreferenceControl = (pref: UserPreference) => {
    const handleChange = (newValue: any) => {
      updatePreference(pref.id, newValue);
    };

    switch (pref.type) {
      case 'toggle':
        return (
          <button
            onClick={() => handleChange(!pref.value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pref.value ? 'bg-lavender-600' : 'bg-gray-600'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pref.value ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        );
      
      case 'select':
        return (
          <select
            value={pref.value as string}
            onChange={(e) => handleChange(e.target.value)}
            className="bg-gray-700 text-white rounded-md px-3 py-1.5 text-sm border border-gray-600 focus:ring-2 focus:ring-lavender-500 focus:border-transparent"
          >
            {pref.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        const selectedValues = Array.isArray(pref.value) ? pref.value : [];
        
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {pref.options?.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      const newValues = isSelected
                        ? selectedValues.filter(v => v !== option.value)
                        : [...selectedValues, option.value];
                      handleChange(newValues);
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm ${isSelected 
                      ? 'bg-lavender-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      
      case 'range':
        return (
          <div className="w-full max-w-xs">
            <input
              type="range"
              min={pref.min || 0}
              max={pref.max || 100}
              value={pref.value as number}
              onChange={(e) => handleChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-lavender-500"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>{pref.min || 0}</span>
              <span className="text-white font-medium">{pref.value}</span>
              <span>{pref.max || 100}</span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderProfileTab = () => {
    if (!user) return null;
    
    // Calculate member duration
    const joinDate = new Date(user.joinDate);
    const now = new Date();
    const years = now.getFullYear() - joinDate.getFullYear();
    const months = now.getMonth() - joinDate.getMonth();
    const memberDuration = years > 0 
      ? `${years} ${years === 1 ? 'year' : 'years'}`
      : `${Math.max(1, months)} ${months === 1 ? 'month' : 'months'}`;

    return (
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=7e22ce&color=fff`} 
                alt={user.displayName || 'User'} 
                className="w-24 h-24 rounded-full border-2 border-lavender-500 object-cover"
              />
              <button 
                onClick={() => document.getElementById('profile-picture-upload')?.click()}
                className="absolute -bottom-1 -right-1 bg-lavender-600 text-white p-1.5 rounded-full hover:bg-lavender-700 transition-colors"
                title="Update photo"
              >
                <Settings size={16} />
              </button>
              <input type="file" id="profile-picture-upload" className="hidden" accept="image/*" />
            </div>
            
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">{user.displayName || 'User'}</h2>
              <p className="text-gray-300">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-lavender-500/20 text-lavender-300 text-xs rounded-full">
                  Member for {memberDuration}
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">
                  Active Now
                </span>
              </div>
            </div>
            
            <div className="ml-auto hidden sm:flex items-center space-x-3">
              <button className="px-4 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg text-sm font-medium transition-colors">
                Edit Profile
              </button>
              <button 
                onClick={() => auth.signOut()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          
          {/* Mobile Actions */}
          <div className="mt-6 flex sm:hidden justify-center space-x-4">
            <button className="px-4 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg text-sm font-medium transition-colors">
              Edit Profile
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <User className="mr-2 text-lavender-400" size={18} />
              Account Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Full Name</p>
                <p className="text-white">{user.displayName || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Email Address</p>
                <p className="text-white">{user.email || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Phone Number</p>
                <p className="text-white">{user.phoneNumber || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Member Since</p>
                <p className="text-white">
                  {new Date(user.joinDate).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <MapPin className="mr-2 text-lavender-400" size={18} />
              Address Book
            </h3>
            {user.address ? (
              <div className="space-y-3">
                <p className="text-white">{user.address}</p>
                <div className="flex space-x-3 pt-2">
                  <button className="text-lavender-400 hover:text-lavender-300 text-sm font-medium">
                    Edit Address
                  </button>
                  <button className="text-gray-400 hover:text-white text-sm font-medium">
                    Add New Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 mb-3">No saved addresses</p>
                <button className="px-4 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Add Address
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <CreditCard className="mr-2 text-lavender-400" size={18} />
              Payment Methods
            </h3>
            <button className="mt-2 sm:mt-0 px-4 py-2 bg-lavender-600 hover:bg-lavender-700 text-white rounded-lg text-sm font-medium transition-colors">
              Add Payment Method
            </button>
          </div>
          
          {user.defaultPaymentMethod ? (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-750">
              <div className="flex items-center">
                <div className="p-2 bg-lavender-500/20 rounded-lg mr-4">
                  <CreditCard className="text-lavender-400" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Visa ending in 4242</p>
                  <p className="text-gray-400 text-sm">Expires 12/25</p>
                </div>
                <button className="text-lavender-400 hover:text-lavender-300 text-sm font-medium">
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <CreditCard className="mx-auto text-gray-500 mb-3" size={32} />
              <p className="text-gray-400 mb-4">No payment methods added yet</p>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Add a payment method to make your checkout process faster and more convenient.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreferencesTab = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lavender-500"></div>
        </div>
      );
    }

    const preferenceCategories = [
      {
        id: 'grocery',
        title: 'Grocery Preferences',
        icon: <ShoppingBag size={18} className="mr-2 text-lavender-400" />,
        description: 'Customize your grocery shopping experience'
      },
      {
        id: 'ride',
        title: 'Ride Preferences',
        icon: <Car size={18} className="mr-2 text-lavender-400" />,
        description: 'Set your preferred ride options'
      },
      {
        id: 'ecommerce',
        title: 'Shopping Preferences',
        icon: <Package size={18} className="mr-2 text-lavender-400" />,
        description: 'Customize your online shopping experience'
      },
      {
        id: 'notification',
        title: 'Notifications',
        icon: <Bell size={18} className="mr-2 text-lavender-400" />,
        description: 'Manage your notification preferences'
      },
      {
        id: 'privacy',
        title: 'Privacy & Security',
        icon: <Settings size={18} className="mr-2 text-lavender-400" />,
        description: 'Control your privacy settings'
      }
    ];

    return (
      <div className="space-y-8">
        {preferenceCategories.map((category) => {
          const categoryPreferences = preferences.filter(p => p.category === category.id);
          if (categoryPreferences.length === 0) return null;
          
          return (
            <div key={category.id} className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                {category.icon}
                {category.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4">{category.description}</p>
              
              <div className="space-y-6 divide-y divide-gray-700">
                {categoryPreferences.map((pref) => (
                  <div key={pref.id} className="pt-4 first:pt-0 first:border-t-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{pref.name}</h4>
                        {pref.description && (
                          <p className="text-sm text-gray-400 mt-1">{pref.description}</p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {renderPreferenceControl(pref)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-white mb-8">My Profile</h1>
      
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium ${activeTab === 'profile' ? 'text-lavender-400 border-b-2 border-lavender-400' : 'text-gray-400 hover:text-white'}`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'text-lavender-400 border-b-2 border-lavender-400' : 'text-gray-400 hover:text-white'}`}
        >
          Preferences
        </button>
      </div>

      {activeTab === 'profile' ? renderProfileTab() : renderPreferencesTab()}

      <div className="mt-8 pt-6 border-t border-gray-700">
        <button className="flex items-center text-red-400 hover:text-red-300">
          <LogOut className="mr-2" size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
