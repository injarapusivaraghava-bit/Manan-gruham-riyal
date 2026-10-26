import React, { useState, useEffect, useMemo } from 'react';
import { PropertyListing, PropertyType, ListingStatus, ApprovalStatus, UserFeedback, ManaGruhamPayment } from './types';
import { INITIAL_LISTINGS, AVAILABLE_CITIES, AREAS_BY_CITY, AP_DISTRICTS, MANDALS_BY_DISTRICT, VILLAGES_BY_MANDAL, AGRICULTURAL_SUBCATEGORIES } from './data';
import { ListingCard } from './components/ListingCard';
import { ListingDetailsModal } from './components/ListingDetailsModal';
import { AddListingModal } from './components/AddListingModal';
import { BuyerRequestModal } from './components/BuyerRequestModal';
import { AdminPanel } from './components/AdminPanel';
import { FeedbackModal } from './components/FeedbackModal';
import { ContactCard } from './components/ContactCard';
import { PriceAnalytics } from './components/PriceAnalytics';
import { CompareModal } from './components/CompareModal';
import { FooterAppDownload } from './components/FooterAppDownload';
import { UserPanel } from './components/UserPanel';
import { PricingPackages } from './components/PricingPackages';
import { ManaGruhamPaymentModal } from './components/ManaGruhamPaymentModal';
import { ServicesProductsPanel } from './components/ServicesProductsPanel';
import { 
  Home, 
  Search, 
  PlusCircle, 
  MapPin, 
  SlidersHorizontal, 
  Phone, 
  MessageSquare, 
  MessageCircle, 
  Sparkles, 
  ShieldAlert, 
  Building, 
  Trees, 
  Compass, 
  Bookmark,
  Heart,
  Trash2,
  ArrowUpDown,
  CheckCircle,
  Menu,
  X,
  Clock,
  GitCompare,
  Download,
  Mail,
  Smartphone,
  Share2,
  QrCode,
  ArrowRight,
  Tag,
  Lock,
  Unlock,
  UserCheck,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Firebase Integrations
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';


export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // listings storage state
  const [listings, setListings] = useState<PropertyListing[]>([]);
  
  // custom payments state
  const [payments, setPayments] = useState<ManaGruhamPayment[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [currentPaymentProps, setCurrentPaymentProps] = useState<{
    purpose: string;
    amount: number;
    itemId: string;
    itemType: 'service' | 'product' | 'booking' | 'other' | 'package';
    packageName?: 'basic' | 'premium' | 'featured';
  } | null>(null);

  // feedbacks storage state
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  
  // bookmarks state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState<boolean>(false);
  
  // filtering states
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('All');
  const [selectedAge, setSelectedAge] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Agricultural & Garden Filter States
  const [agriDistrict, setAgriDistrict] = useState<string>('All');
  const [agriMandal, setAgriMandal] = useState<string>('All');
  const [agriVillage, setAgriVillage] = useState<string>('All');
  const [agriMinAcres, setAgriMinAcres] = useState<number>(0);
  const [agriMaxBudget, setAgriMaxBudget] = useState<number>(0);
  const [agriCropType, setAgriCropType] = useState<string>('All');
  const [agriGardenType, setAgriGardenType] = useState<string>('All');
  const [agriWaterFacility, setAgriWaterFacility] = useState<string>('All');
  const [agriTab, setAgriTab] = useState<'listings' | 'buyer_requests'>('listings');
  const [buyerRequests, setBuyerRequests] = useState<any[]>([]);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState<boolean>(false);

  // active viewport/navigation tab
  const [activeTab, setActiveTab] = useState<'listings' | 'admin' | 'contact' | 'user' | 'pricing' | 'services' | 'favorites'>('listings');
  const [favSearchQuery, setFavSearchQuery] = useState<string>('');
  const [favCategoryFilter, setFavCategoryFilter] = useState<string>('All');

  // splash screen states
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (params.get('propertyId')) return false;
    return localStorage.getItem('mana_gruham_bypass_splash') !== 'true';
  });
  const [bypassSplash, setBypassSplash] = useState<boolean>(() => {
    return localStorage.getItem('mana_gruham_bypass_splash') === 'true';
  });

  const handleToggleBypassSplash = (checked: boolean) => {
    setBypassSplash(checked);
    if (checked) {
      localStorage.setItem('mana_gruham_bypass_splash', 'true');
    } else {
      localStorage.removeItem('mana_gruham_bypass_splash');
    }
  };

  const [isDownloadingApk, setIsDownloadingApk] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatusMsg, setDownloadStatusMsg] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(6);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);

  // Auto-dismiss splash screen after countdown unless downloading
  useEffect(() => {
    if (!showSplash || isDownloadingApk) return;
    if (countdown <= 0) {
      setShowSplash(false);
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, showSplash, isDownloadingApk]);

  // modal states
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingListing, setEditingListing] = useState<PropertyListing | null>(null);
  const [preselectedPackage, setPreselectedPackage] = useState<'basic' | 'premium' | 'featured' | undefined>(undefined);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // comparison states
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  const comparedProperties = useMemo(() => {
    return listings.filter((p) => compareIds.includes(p.id));
  }, [listings, compareIds]);

  const handleToggleCompare = (property: PropertyListing) => {
    setCompareIds((prev) => {
      if (prev.includes(property.id)) {
        return prev.filter((id) => id !== property.id);
      } else {
        if (prev.length >= 2) {
          setCompareError("గరిష్టంగా 2 ప్రాపర్టీస్ మాత్రమే పోల్చగలరు (You can only compare up to 2 properties)");
          setTimeout(() => setCompareError(null), 4000);
          return prev;
        }
        return [...prev, property.id];
      }
    });
  };

  // Track Google Sign In / Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAdminUser(user?.email === 'injarapusivaraghava@gmail.com');
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Listings in real-time with automatic database seeding on empty state
  useEffect(() => {
    const listingsRef = collection(db, 'listings');
    const unsubscribe = onSnapshot(listingsRef, (snapshot) => {
      if (snapshot.empty) {
        if (isAdminUser) {
          console.log("Firestore 'listings' collection is empty. Auto-seeding initial data...");
          // Non-blocking background batch seed
          const batch = writeBatch(db);
          INITIAL_LISTINGS.forEach((item) => {
            const docRef = doc(db, 'listings', item.id);
            batch.set(docRef, item);
          });
          batch.commit()
            .then(() => console.log("Listings auto-seeded successfully!"))
            .catch((err) => console.error("Error auto-seeding listings:", err));
        } else {
          console.log("Firestore 'listings' collection is empty. Waiting for admin to seed...");
          setListings([]);
        }
      } else {
        const list: PropertyListing[] = [];
        snapshot.forEach((doc) => {
          list.push(doc.data() as PropertyListing);
        });
        setListings(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'listings');
    });

    return () => unsubscribe();
  }, [isAdminUser]);

  // Sync Feedbacks and Payments in real-time for Admin users with automatic seeding
  useEffect(() => {
    if (!isAdminUser) {
      setFeedbacks([]);
      setPayments([]);
      return;
    }

    // Subscribe to feedbacks
    const feedbacksRef = collection(db, 'feedbacks');
    const unsubFeedbacks = onSnapshot(feedbacksRef, (snapshot) => {
      if (snapshot.empty) {
        const defaultFeedbacks: UserFeedback[] = [
          {
            id: 'fb-1',
            name: 'రామారావు గారు',
            contact: '9848022338',
            type: 'feature',
            message: 'మెనూలో తెలుగు మరియు ఇంగ్లీష్ భాష మార్చుకునే ఆప్షన్ ఉంటే బాగుంటుంది. చాలామందికి తెలుగు చదవడం సులువవుతుంది.',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'fb-2',
            name: 'లక్ష్మి గారు',
            contact: 'lakshmi@gmail.com',
            type: 'issue',
            message: 'నేను నా కొత్త హౌస్ ని అప్లోడ్ చేయడానికి ట్రై చేశాను, కానీ ఫొటోస్ అప్‌లోడ్ స్పీడ్ కాస్త తక్కువగా ఉంది. దయచేసి దీనిని పరిశీలించండి.',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        defaultFeedbacks.forEach(async (fb) => {
          try {
            await setDoc(doc(db, 'feedbacks', fb.id), fb);
          } catch (e) {
            console.error("Error seeding default feedback:", e);
          }
        });
      } else {
        const fbs: UserFeedback[] = [];
        snapshot.forEach((doc) => {
          fbs.push(doc.data() as UserFeedback);
        });
        setFeedbacks(fbs);
      }
    }, (error) => {
      console.warn("Feedback snapshot error (expected if permissions not sync'd yet):", error);
    });

    // Subscribe to payments
    const paymentsRef = collection(db, 'payments');
    const unsubPayments = onSnapshot(paymentsRef, (snapshot) => {
      if (snapshot.empty) {
        const defaultPayments: ManaGruhamPayment[] = [
          {
            id: 'TXN-93481284',
            customerName: 'వెంకటేశ్వర్లు గారు',
            paymentPurpose: 'పరిశోధనాత్మక వాస్తు సలహా (Elite Vastu)',
            amount: 1499,
            upiId: 'isivaraghava@okaxis',
            utr: '984128471283',
            status: 'Pending',
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            itemType: 'service',
            itemId: 'vastu-consult',
            contactPhone: '9440512345'
          },
          {
            id: 'TXN-73481274',
            customerName: 'లక్ష్మీ నారాయణ గారు',
            paymentPurpose: 'సాంప్రదాయ ఇత్తడి దీపాలు (Brass Diya Set)',
            amount: 799,
            upiId: 'isivaraghava@okaxis',
            utr: '312847284912',
            status: 'Verified',
            createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
            verifiedAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
            itemType: 'product',
            itemId: 'brass-diya-set',
            contactPhone: '9848022339'
          }
        ];
        defaultPayments.forEach(async (pay) => {
          try {
            await setDoc(doc(db, 'payments', pay.id), pay);
          } catch (e) {
            console.error("Error seeding default payment:", e);
          }
        });
      } else {
        const pays: ManaGruhamPayment[] = [];
        snapshot.forEach((doc) => {
          pays.push(doc.data() as ManaGruhamPayment);
        });
        setPayments(pays);
      }
    }, (error) => {
      console.warn("Payments snapshot error (expected if permissions not sync'd yet):", error);
    });

    return () => {
      unsubFeedbacks();
      unsubPayments();
    };
  }, [isAdminUser]);

  // Subscribe to buyer_requests in Firestore
  useEffect(() => {
    const q = collection(db, 'buyer_requests');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data());
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBuyerRequests(list);
    }, (error) => {
      console.error("Error subscribing to buyer_requests:", error);
    });
    return () => unsubscribe();
  }, []);

  // Load bookmarks & view shared property links
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('mana_gruham_bookmarks_v1');
    if (savedBookmarks) {
      try {
        setBookmarkedIds(JSON.parse(savedBookmarks));
      } catch (e) {
        setBookmarkedIds([]);
      }
    }

    const params = new URLSearchParams(window.location.search);
    const propId = params.get('propertyId');
    if (propId) {
      const matched = listings.find((p) => p.id === propId);
      if (matched) {
        setSelectedProperty(matched);
        setShowSplash(false);
      }
    }
  }, [listings]);


  // Update helper (maintained for structural backward compatibility, write directly on item basis)
  const saveListings = async (updatedListings: PropertyListing[]) => {
    setListings(updatedListings);
    for (const listing of updatedListings) {
      try {
        await setDoc(doc(db, 'listings', listing.id), listing);
      } catch (e) {
        console.warn("Sync write skipped (non-blocking):", e);
      }
    }
  };

  // Toggle bookmark handler
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id];
      localStorage.setItem('mana_gruham_bookmarks_v1', JSON.stringify(updated));
      return updated;
    });
  };

  // Reset selected area to 'All' when selected city changes
  useEffect(() => {
    setSelectedArea('All');
  }, [selectedCity]);

  // Reset selected price range to 'All' when listing status changes
  useEffect(() => {
    setSelectedPriceRange('All');
  }, [selectedStatus]);

  // Handler to add a new user listing
  const handleAddListing = async (newListing: PropertyListing) => {
    try {
      const listingWithUser = {
        ...newListing,
        submittedBy: currentUser?.uid || 'anonymous',
      };
      await setDoc(doc(db, 'listings', listingWithUser.id), listingWithUser);
      
      const existingUserIds = JSON.parse(localStorage.getItem('mana_gruham_user_listing_ids') || '[]');
      if (!existingUserIds.includes(newListing.id)) {
        existingUserIds.push(newListing.id);
        localStorage.setItem('mana_gruham_user_listing_ids', JSON.stringify(existingUserIds));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `listings/${newListing.id}`);
    }
  };

  // Handler to renew a listing from user panel
  const handleRenewListing = async (id: string, paymentId: string) => {
    try {
      const now = new Date();
      const item = listings.find(l => l.id === id);
      if (!item) return;
      const pkgId = item.packageName || 'basic';
      const validity = pkgId === 'featured' ? 365 : pkgId === 'premium' ? 180 : 90;
      const price = pkgId === 'featured' ? 1999 : pkgId === 'premium' ? 999 : 499;
      
      const expiry = new Date();
      expiry.setDate(now.getDate() + validity);

      await updateDoc(doc(db, 'listings', id), {
        paymentId,
        paymentAmount: price,
        paymentStatus: 'success',
        paymentDate: now.toISOString(),
        startDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        isApproved: 'Pending', // Force pending approval upon renewal as requested
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
    }
  };

  // Handler to submit custom payment
  const handleSubmitPayment = async (newPay: Omit<ManaGruhamPayment, 'id' | 'createdAt' | 'status'>) => {
    try {
      const freshPayment: ManaGruhamPayment = {
        ...newPay,
        id: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
        createdAt: new Date().toISOString(),
        status: 'Pending',
      };

      await setDoc(doc(db, 'payments', freshPayment.id), freshPayment);

      if (newPay.itemType === 'package' && newPay.itemId) {
        await updateDoc(doc(db, 'listings', newPay.itemId), {
          paymentStatus: 'pending',
          paymentId: freshPayment.id,
          paymentAmount: newPay.amount,
          paymentDate: freshPayment.createdAt,
          packageName: newPay.packageName,
          isApproved: 'Pending',
        });

        const existingUserIds = JSON.parse(localStorage.getItem('mana_gruham_user_listing_ids') || '[]');
        if (!existingUserIds.includes(newPay.itemId)) {
          existingUserIds.push(newPay.itemId);
          localStorage.setItem('mana_gruham_user_listing_ids', JSON.stringify(existingUserIds));
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'payments');
    }
  };

  // Handler for admin to verify and approve payment
  const handleVerifyPayment = async (txnId: string) => {
    try {
      const targetPay = payments.find(p => p.id === txnId);
      if (!targetPay) return;

      await updateDoc(doc(db, 'payments', txnId), {
        status: 'Verified',
        verifiedAt: new Date().toISOString()
      });

      if (targetPay.itemType === 'package' && targetPay.itemId) {
        const today = new Date();
        const validity = targetPay.packageName === 'featured' ? 365 : targetPay.packageName === 'premium' ? 180 : 90;
        const expiry = new Date();
        expiry.setDate(today.getDate() + validity);
        
        await updateDoc(doc(db, 'listings', targetPay.itemId), {
          paymentStatus: 'success',
          isApproved: 'Yes',
          startDate: today.toISOString(),
          expiryDate: expiry.toISOString()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `payments/${txnId}`);
    }
  };

  // Handler for admin to reject payment due to invalid UTR
  const handleRejectPayment = async (txnId: string) => {
    try {
      const targetPay = payments.find(p => p.id === txnId);
      if (!targetPay) return;

      await updateDoc(doc(db, 'payments', txnId), {
        status: 'Rejected',
        verifiedAt: new Date().toISOString()
      });

      if (targetPay.itemType === 'package' && targetPay.itemId) {
        await updateDoc(doc(db, 'listings', targetPay.itemId), {
          paymentStatus: 'failed',
          isApproved: 'No',
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `payments/${txnId}`);
    }
  };

  // Handler to activate or upgrade a listing for a selected duration from Pricing tab
  const handleActivateListing = (id: string, pkgId: 'basic' | 'premium' | 'featured', paymentId: string) => {
    const price = pkgId === 'featured' ? 1999 : pkgId === 'premium' ? 999 : 499;
    const propTitle = listings.find(l => l.id === id)?.title || 'ప్రాపర్టీ లిస్టింగ్';

    setCurrentPaymentProps({
      purpose: `${pkgId.toUpperCase()} Listing Package for: ${propTitle}`,
      amount: price,
      itemId: id,
      itemType: 'package',
      packageName: pkgId,
    });
    setIsPaymentModalOpen(true);
  };

  // Handler for admin to manually extend or renew a listing
  const handleExtendExpiry = async (id: string) => {
    try {
      const item = listings.find(l => l.id === id);
      if (!item) return;
      const pkgId = item.packageName || 'basic';
      const validity = pkgId === 'featured' ? 365 : pkgId === 'premium' ? 180 : 90;
      const price = pkgId === 'featured' ? 1999 : pkgId === 'premium' ? 999 : 499;

      const currentExp = item.expiryDate ? new Date(item.expiryDate).getTime() : Date.now();
      const newExp = new Date(Math.max(currentExp, Date.now()) + validity * 24 * 60 * 60 * 1000);

      await updateDoc(doc(db, 'listings', id), {
        expiryDate: newExp.toISOString(),
        isApproved: 'Yes',
        paymentStatus: 'success',
        paymentId: item.paymentId || `tx_admin_${Date.now()}`,
        paymentAmount: price
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
    }
  };

  // Handler to update Is_Approved status (Glide Google Sheets simulation column)
  const handleUpdateApproval = async (id: string, status: ApprovalStatus) => {
    try {
      await updateDoc(doc(db, 'listings', id), { isApproved: status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `listings/${id}`);
    }
  };

  // Handler to delete a listing from simulation
  const handleDeleteListing = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `listings/${id}`);
    }
  };

  // Handlers for feedback/requests
  const handleSaveFeedback = async (newFb: UserFeedback) => {
    try {
      await setDoc(doc(db, 'feedbacks', newFb.id), newFb);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `feedbacks/${newFb.id}`);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `feedbacks/${id}`);
    }
  };


  // Get available areas for the currently chosen city
  const availableAreas = useMemo(() => {
    if (selectedCity === 'All') return ['All'];
    return ['All', ...(AREAS_BY_CITY[selectedCity] || []).filter(a => a !== 'All')];
  }, [selectedCity]);

  // Filter listings based on current filters & active view
  const filteredListings = useMemo(() => {
    const filtered = listings.filter((item) => {
      // Rule 1: Standard users can only view APPROVED listings (isApproved === 'Yes')
      // If we are looking at standard listings, hide 'Pending', 'No' and expired listings
      if (activeTab === 'listings') {
        if (item.isApproved !== 'Yes') {
          return false;
        }
        if (item.expiryDate && new Date(item.expiryDate).getTime() < Date.now()) {
          return false;
        }
      }

      // Filter by city
      if (selectedCity !== 'All' && item.city !== selectedCity) {
        return false;
      }

      // Filter by area (Choice Component Filter)
      if (selectedArea !== 'All' && item.area !== selectedArea) {
        return false;
      }

      // Filter by property type
      if (selectedType !== 'All' && item.type !== selectedType) {
        return false;
      }

      // Filter by status (For Sale / Rent)
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      // Filter by price range
      if (selectedPriceRange !== 'All') {
        const price = item.price;
        if (selectedPriceRange === 'under-10l') {
          if (price >= 1000000) return false;
        } else if (selectedPriceRange === '10-30l') {
          if (price < 1000000 || price > 3000000) return false;
        } else if (selectedPriceRange === '30-50l') {
          if (price < 3000000 || price > 5000000) return false;
        } else if (selectedPriceRange === '50l-plus') {
          if (price <= 5000000) return false;
        } else if (selectedPriceRange === 'under-25k') {
          if (price >= 25000) return false;
        } else if (selectedPriceRange === '25k-50k') {
          if (price < 25000 || price > 50000) return false;
        } else if (selectedPriceRange === '50k-plus') {
          if (price <= 50000) return false;
        }
      }

      // Filter by text search query (matches title, area, city, description)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesArea = item.area.toLowerCase().includes(query);
        const matchesCity = item.city.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        if (!(matchesTitle || matchesArea || matchesCity || matchesDesc)) return false;
      }

      // Filter by bookmark status
      if (showOnlyBookmarked && !bookmarkedIds.includes(item.id)) {
        return false;
      }

      // Filter by property age
      if (selectedAge !== 'All') {
        if (item.age === undefined) return false;
        if (selectedAge === 'new') {
          if (item.age !== 0) return false;
        } else if (selectedAge === '1-5') {
          if (item.age < 1 || item.age > 5) return false;
        } else if (selectedAge === '5+') {
          if (item.age <= 5) return false;
        }
      }

      // Agricultural & Garden Specific Filters
      if (selectedType === 'farm_land' && item.type === 'farm_land') {
        if (agriDistrict !== 'All' && item.district !== agriDistrict) return false;
        if (agriMandal !== 'All' && item.mandal !== agriMandal) return false;
        if (agriVillage !== 'All' && item.village !== agriVillage) return false;
        if (agriMinAcres > 0) {
          const itemAcres = (item.landAreaAcres || 0) + ((item.landAreaCents || 0) / 100);
          if (itemAcres < agriMinAcres) return false;
        }
        if (agriMaxBudget > 0 && item.price > agriMaxBudget) return false;
        if (agriCropType !== 'All' && !item.cropType?.toLowerCase().includes(agriCropType.toLowerCase()) && !item.landType?.toLowerCase().includes(agriCropType.toLowerCase())) return false;
        if (agriGardenType !== 'All' && !item.gardenType?.toLowerCase().includes(agriGardenType.toLowerCase()) && !item.landType?.toLowerCase().includes(agriGardenType.toLowerCase())) return false;
        if (agriWaterFacility !== 'All' && !item.waterFacility?.some(f => f.toLowerCase().includes(agriWaterFacility.toLowerCase()))) return false;
      }

      return true;
    });

    // Apply sorting and boost Featured listings to the top (Top Search Ranking)
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const aFeatured = a.packageName === 'featured' ? 1 : 0;
      const bFeatured = b.packageName === 'featured' ? 1 : 0;
      
      if (aFeatured !== bFeatured) {
        return bFeatured - aFeatured; // Featured listings come first
      }
      
      if (sortBy === 'price-low-to-high') {
        return a.price - b.price;
      } else if (sortBy === 'price-high-to-low') {
        return b.price - a.price;
      } else {
        // default: newest first
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    return sorted;
  }, [listings, selectedCity, selectedArea, selectedType, selectedStatus, selectedPriceRange, selectedAge, searchQuery, activeTab, showOnlyBookmarked, bookmarkedIds, sortBy, agriDistrict, agriMandal, agriVillage, agriMinAcres, agriMaxBudget, agriCropType, agriGardenType, agriWaterFacility]);

  // Filter and sort buyer requests dynamically
  const filteredBuyerRequests = useMemo(() => {
    return buyerRequests.filter((req) => {
      if (agriDistrict !== 'All' && req.district !== agriDistrict) return false;
      if (agriMandal !== 'All' && req.mandal !== agriMandal) return false;
      if (agriVillage !== 'All' && req.village !== agriVillage) return false;
      if (selectedStatus !== 'All') {
        const expectedMode = selectedStatus === 'sale' ? 'buy' : selectedStatus;
        if (req.buyOrLease !== expectedMode) return false;
      }
      return true;
    });
  }, [buyerRequests, agriDistrict, agriMandal, agriVillage, selectedStatus]);

  // Simulated premium APK downloader with actual file triggering
  const handleDownloadApk = () => {
    if (isDownloadingApk) return;
    setIsDownloadingApk(true);
    setDownloadProgress(0);
    setDownloadStatusMsg('మనం గృహం సర్వర్‌తో కనెక్ట్ అవుతోంది...');
    
    const messages = [
      'మనం గృహం సర్వర్‌తో కనెక్ట్ అవుతోంది...',
      'రియల్ ఎస్టేట్ ప్యాకేజ్ (v1.0.8-prod) వెరిఫై చేయబడుతోంది...',
      'మల్టికెట్ సెక్యూరిటీ ఇంజిన్ ద్వారా స్కాన్ చేయబడుతోంది...',
      'మనం గృహం రియల్ యాప్ APK ఫైల్ డౌన్‌లోడ్ అవుతోంది...',
      'ఫైల్ సేవ్ చేయబడుతోంది... దాదాపు పూర్తయింది!'
    ];

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 14) + 8;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setDownloadProgress(100);
        setDownloadStatusMsg('డౌన్‌లోడ్ విజయవంతమైంది! ఫైల్ మీ మొబైల్‌లో సేవ్ చేయబడింది. ఇన్స్టాల్ చేసి ఆనందించండి!');
        
        // Trigger a real browser-level download of the APK file
        try {
          const content = new TextEncoder().encode(
            "Mana Gruham Real Estate Mobile Android Application - Developer: Siva Raghava Injarapu (Phone: +918977776111). " +
            "This is the official client package package installer placeholder for Android devices. Thank you for installing our app!"
          );
          const blob = new Blob([content], { type: 'application/vnd.android.package-archive' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'ManaGruham_RealApp.apk';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } catch (e) {
          console.error("Browser download failed:", e);
        }
      } else {
        setDownloadProgress(currentProgress);
        const index = Math.min(Math.floor(currentProgress / 20), messages.length - 1);
        setDownloadStatusMsg(messages[index]);
      }
    }, 350);
  };

  // WhatsApp click action with property info
  const handleContactWhatsApp = (property: PropertyListing) => {
    const message = encodeURIComponent(
      `హలో రాఘవ గారు, నేను మనం గృహం రియల్ యాప్ ద్వారా మీ ఆస్తిని చూశాను:\n` +
      `పేరు: ${property.title}\n` +
      `ధర: ₹${property.price.toLocaleString('en-IN')}\n` +
      `ప్రాంతం: ${property.area}, ${property.city}\n` +
      `లింక్: ${window.location.origin}?propertyId=${property.id}\n` +
      `దయచేసి దీని గురించిన మరిన్ని వివరాలు తెలియజేయండి.`
    );
    window.open(`https://wa.me/918977776111?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-amber-100 selection:text-stone-900 text-stone-800 antialiased">
      
      {/* --- COLORFUL SPLASH SCREEN / INTRO OVERLAY --- */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 overflow-y-auto bg-stone-950 flex flex-col items-center justify-start sm:justify-center p-4 text-stone-100 font-sans"
          >
            {/* Dynamic Moving Multicolor Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-stone-950">
              <style>{`
                @keyframes orbit-1 {
                  0% { transform: translate(-20%, -20%) rotate(0deg); }
                  50% { transform: translate(20%, 10%) rotate(180deg); }
                  100% { transform: translate(-20%, -20%) rotate(360deg); }
                }
                @keyframes orbit-2 {
                  0% { transform: translate(20%, 20%) rotate(0deg); }
                  50% { transform: translate(-10%, -20%) rotate(-180deg); }
                  100% { transform: translate(20%, 20%) rotate(-360deg); }
                }
                @keyframes orbit-3 {
                  0% { transform: translate(-10%, 20%) rotate(0deg); }
                  50% { transform: translate(10%, -10%) rotate(180deg); }
                  100% { transform: translate(-10%, 20%) rotate(360deg); }
                }
                .orb-amber {
                  animation: orbit-1 25s infinite alternate ease-in-out;
                }
                .orb-rose {
                  animation: orbit-2 30s infinite alternate ease-in-out;
                }
                .orb-indigo {
                  animation: orbit-3 28s infinite alternate ease-in-out;
                }
                .orb-emerald {
                  animation: orbit-1 35s infinite alternate ease-in-out;
                }
              `}</style>
              
              {/* Vibrant multicolor moving blurring orbs */}
              <div className="orb-amber absolute top-[-10%] left-[-10%] w-[35rem] h-[35rem] bg-amber-500/25 rounded-full blur-[120px]" />
              <div className="orb-rose absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-rose-500/25 rounded-full blur-[130px]" />
              <div className="orb-indigo absolute top-[30%] left-[25%] w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[110px]" />
              <div className="orb-emerald absolute bottom-[20%] left-[-10%] w-[25rem] h-[25rem] bg-emerald-500/20 rounded-full blur-[100px]" />
            </div>

            {/* Giant Rotating/Glowing Background Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
              <div className="relative w-[95vw] h-[95vw] max-w-[800px] max-h-[800px] flex items-center justify-center">
                {/* Amber Holographic Layer */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 75, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-[0.12] text-amber-500"
                >
                  <Home className="w-full h-full stroke-[1]" />
                </motion.div>
                {/* Rose Holographic Layer offset for chromatic 3D look */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 95, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-[0.12] text-rose-500 translate-x-3 translate-y-3"
                >
                  <Home className="w-full h-full stroke-[1]" />
                </motion.div>
                <div className="absolute w-56 h-56 bg-gradient-to-tr from-amber-500 to-rose-500 rounded-full blur-3xl opacity-30" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950" />
            </div>

            {/* Centered Premium Content Card with Glassmorphism */}
            <div className="relative w-full max-w-2xl bg-stone-900/90 backdrop-blur-2xl border border-stone-800/95 rounded-[32px] p-5 sm:p-9 shadow-2xl flex flex-col items-center text-center space-y-6 sm:space-y-7 my-auto overflow-hidden z-10">
              
              {/* Inner Luxury Background Watermark Accents */}
              <div className="absolute -right-12 -bottom-12 w-64 h-64 opacity-[0.05] pointer-events-none text-rose-500">
                <Home className="w-full h-full stroke-[1]" />
              </div>
              <div className="absolute -left-12 -top-12 w-64 h-64 opacity-[0.05] pointer-events-none text-amber-500">
                <Home className="w-full h-full stroke-[1]" />
              </div>
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-stone-950/30 pointer-events-none" />

              {/* Top info tag with Sparkly Animations */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 rounded-full text-[11px] font-black text-amber-300 tracking-wider uppercase shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '5s' }} />
                <span className="bg-gradient-to-r from-amber-300 via-rose-300 to-orange-300 bg-clip-text text-transparent font-black">
                  ఆంధ్రప్రదేశ్ అత్యంత విశ్వసనీయ రియల్ ఎస్టేట్ యాప్
                </span>
              </div>

              {/* Spectacular Colorful Glowing Logo Container */}
              <motion.div
                initial={{ scale: 0.8, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 15, delay: 0.1 }}
                className="relative"
              >
                {/* Layered Multiple Glowing Ring effects */}
                <div className="absolute -inset-6 bg-gradient-to-r from-amber-500 via-rose-500 via-pink-600 to-orange-500 rounded-[36px] blur-2xl opacity-80 animate-pulse" />
                <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-pink-500 to-red-500 rounded-[32px] blur-md opacity-50" />
                
                {/* Primary Logo box */}
                <div className="relative w-24 h-24 bg-gradient-to-tr from-amber-500 via-rose-500 to-orange-500 rounded-[24px] flex items-center justify-center text-white shadow-3xl border border-white/20">
                  <Home className="w-12 h-12 stroke-[2.5]" />
                </div>
              </motion.div>

              {/* Branding Info */}
              <div className="space-y-2">
                <h2 className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-orange-400 text-3xl sm:text-4xl tracking-tight leading-none">
                  మనం గృహం రియల్ యాప్
                </h2>
                <p className="text-[10px] sm:text-xs font-bold text-stone-400 tracking-wider uppercase flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mana Gruham Real App</span>
                </p>
              </div>

              {/* Interactive Download Area with download option & links */}
              <div className="w-full max-w-md bg-stone-950/80 rounded-2xl border border-stone-800 p-4.5 space-y-4 relative overflow-hidden text-left">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-amber-400 animate-bounce" />
                    <span className="text-xs font-bold text-stone-200">మొబైల్ ఆండ్రాయిడ్ యాప్ APK (v1.0.8)</span>
                  </div>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/30 uppercase tracking-widest">
                    Safe Verified APK
                  </span>
                </div>

                {isDownloadingApk ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold text-amber-400">
                      <span>{downloadStatusMsg}</span>
                      <span className="font-mono">{downloadProgress}%</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-orange-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${downloadProgress}%` }}
                        transition={{ ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    id="splash-download-apk-btn"
                    type="button"
                    onClick={handleDownloadApk}
                    className="w-full flex items-center justify-center gap-2.5 py-3 bg-gradient-to-r from-amber-400 via-rose-500 to-orange-500 text-stone-950 hover:from-amber-300 hover:to-orange-400 font-black text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-stone-950 stroke-[3]" />
                    <span>మొబైల్ యాప్ APK డౌన్‌లోడ్ చేసుకోండి</span>
                  </button>
                )}

                {/* Additional Action links inside Download Area */}
                <div className="flex items-center justify-between gap-3 pt-2 text-[11px] font-bold text-stone-400">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin);
                      setIsLinkCopied(true);
                      setTimeout(() => setIsLinkCopied(false), 2000);
                    }}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{isLinkCopied ? 'లింక్ కాపీ చేయబడింది!' : 'లింక్ కాపీ చేయండి (Copy Link)'}</span>
                  </button>
                  <span className="text-stone-600">|</span>
                  <a
                    href="https://wa.me/918977776111"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>సహాయం కావాలా? (WhatsApp Help)</span>
                  </a>
                </div>
              </div>

              {/* Direct Access / Skip Action Area */}
              <div className="w-full max-w-md space-y-4">
                <button
                  id="splash-enter-app-btn"
                  onClick={() => setShowSplash(false)}
                  className="w-full py-3.5 bg-stone-850 hover:bg-stone-800 text-stone-100 hover:text-white border border-stone-800 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>యాప్‌కు వెళ్ళండి (Enter App)</span>
                  <span className="text-[11px] font-medium text-amber-400">
                    ({countdown > 0 ? `${countdown}s లో ఆటోమేటిక్‌గా వెళ్తుంది...` : 'యాప్‌కి రీడైరెక్ట్ అవుతోంది...'})
                  </span>
                </button>

                <div className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    id="bypass-splash-checkbox"
                    checked={bypassSplash}
                    onChange={(e) => handleToggleBypassSplash(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-900"
                  />
                  <label htmlFor="bypass-splash-checkbox" className="text-[11px] font-bold text-stone-400 cursor-pointer hover:text-stone-300">
                    మరోసారి ఈ స్క్రీన్ చూపించవద్దు (Skip this intro next time)
                  </label>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav id="app-main-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setShowSplash(true)} title="బ్రోచర్ & డౌన్‌లోడ్ స్క్రీన్ ఓపెన్ చేయి">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 via-rose-500 via-purple-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-all duration-200">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-rose-600 via-purple-600 to-orange-500 text-base tracking-tight leading-none">
                  మనం గృహం రియల్ యాప్
                </span>
                <span className="text-[9px] text-stone-500 font-bold tracking-wider uppercase mt-1 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>Mana Gruham Real App</span>
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <button
                id="nav-tab-listings"
                onClick={() => { setActiveTab('listings'); setMobileMenuOpen(false); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === 'listings'
                    ? 'bg-amber-50 text-amber-700 font-black border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                ఇళ్ళు వెతకండి (Browse Homes)
              </button>
              
              <button
                id="nav-tab-favorites"
                onClick={() => { setActiveTab('favorites'); setMobileMenuOpen(false); }}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer relative ${
                  activeTab === 'favorites'
                    ? 'bg-rose-50 text-rose-700 font-black border border-rose-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${bookmarkedIds.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
                <span>ఇష్టమైనవి (Favorites)</span>
                {bookmarkedIds.length > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] bg-rose-500 text-white rounded-full font-black ml-0.5">
                    {bookmarkedIds.length}
                  </span>
                )}
              </button>
              
              <button
                id="nav-tab-user"
                onClick={() => { setActiveTab('user'); setMobileMenuOpen(false); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'user'
                    ? 'bg-amber-50 text-amber-700 font-black border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-blue-600" />
                <span>నా లిస్టింగ్స్ (User Panel)</span>
              </button>

              <button
                id="nav-tab-services"
                onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'services'
                    ? 'bg-amber-50 text-amber-700 font-black border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>గృహ సేవలు & అలంకరణ (Services)</span>
              </button>

              <button
                id="nav-tab-pricing"
                onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'pricing'
                    ? 'bg-amber-50 text-amber-700 font-black border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>ధరల ప్యాకేజీలు (Pricing)</span>
              </button>

              <button
                id="nav-tab-admin"
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-amber-50 text-amber-700 font-black border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>అడ్మిన్ వర్క్‌స్పేస్ (Admin Tab)</span>
              </button>

              <button
                id="nav-tab-feedback-trigger"
                onClick={() => setIsFeedbackModalOpen(true)}
                className="px-4 py-2 text-xs font-bold rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                <span>సలహాలు / సమస్యలు (Feedback)</span>
              </button>

              <button
                id="nav-tab-contact"
                onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                  activeTab === 'contact'
                    ? 'bg-amber-50 text-amber-700 font-black border border-amber-200'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                సంప్రదించండి & డౌన్‌లోడ్ (Contact & APK)
              </button>

              {/* Firebase Authentication Button */}
              {currentUser ? (
                <div className="flex items-center gap-2 pl-3 ml-1 border-l border-stone-200">
                  <img
                    src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-stone-200 shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] font-bold text-stone-900 leading-none truncate max-w-[100px]">
                      {currentUser.displayName || 'వినియోగదారుడు'}
                    </span>
                    {isAdminUser && (
                      <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider mt-0.5">
                        Admin
                      </span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await signOut(auth);
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    className="p-1.5 hover:bg-stone-50 text-stone-400 hover:text-stone-700 rounded-lg transition-colors cursor-pointer text-[10px] font-bold"
                    title="లాగ్ అవుట్ (Logout)"
                  >
                    లాగ్ అవుట్
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await signInWithPopup(auth, googleProvider);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="ml-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>సైన్ ఇన్ (Sign In)</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-stone-600 hover:bg-stone-50"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu panels */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-stone-200 bg-white"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  id="mobile-nav-listings"
                  onClick={() => { setActiveTab('listings'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl ${
                    activeTab === 'listings' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'
                  }`}
                >
                  ఇళ్ళు వెతకండి (Browse Homes)
                </button>
                <button
                  id="mobile-nav-favorites"
                  onClick={() => { setActiveTab('favorites'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center justify-between ${
                    activeTab === 'favorites' ? 'bg-rose-50 text-rose-700' : 'text-stone-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Heart className={`w-3.5 h-3.5 ${bookmarkedIds.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-stone-400'}`} />
                    <span>నా ఇష్టమైనవి (Favorites)</span>
                  </div>
                  {bookmarkedIds.length > 0 && (
                    <span className="px-2 py-0.5 text-[10px] bg-rose-500 text-white rounded-full font-bold">
                      {bookmarkedIds.length}
                    </span>
                  )}
                </button>
                <button
                  id="mobile-nav-user"
                  onClick={() => { setActiveTab('user'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
                    activeTab === 'user' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'
                  }`}
                >
                  <Home className="w-3.5 h-3.5 text-blue-600" />
                  <span>నా లిస్టింగ్స్ (User Panel)</span>
                </button>

                <button
                  id="mobile-nav-services"
                  onClick={() => { setActiveTab('services'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
                    activeTab === 'services' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>గృహ సేవలు & అలంకరణ (Services)</span>
                </button>

                <button
                  id="mobile-nav-pricing"
                  onClick={() => { setActiveTab('pricing'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
                    activeTab === 'pricing' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ధరల ప్యాకేజీలు (Pricing)</span>
                </button>

                <button
                  id="mobile-nav-admin"
                  onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
                    activeTab === 'admin' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>అడ్మిన్ వర్క్‌స్పేస్ (Admin Tab)</span>
                </button>
                <button
                  id="mobile-nav-contact"
                  onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl ${
                    activeTab === 'contact' ? 'bg-amber-50 text-amber-700' : 'text-stone-600'
                  }`}
                >
                  సంప్రదించండి & డౌన్‌లోడ్ (Contact & APK)
                </button>
                <button
                  id="mobile-nav-feedback"
                  onClick={() => { setIsFeedbackModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-1.5 text-stone-600"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  <span>సలహాలు / సమస్యలు (Feedback)</span>
                </button>
                <button
                  id="mobile-nav-add-btn"
                  onClick={() => { setIsAddModalOpen(true); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2.5 bg-amber-600 text-white font-bold text-xs rounded-xl"
                >
                  + కొత్త లిస్టింగ్ నమోదు చేయండి
                </button>

                {/* Mobile Firebase Auth Option */}
                <div className="pt-2 border-t border-stone-150 flex items-center justify-between px-2">
                  {currentUser ? (
                    <>
                      <div className="flex items-center gap-2">
                        <img
                          src={currentUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60'}
                          alt={currentUser.displayName || 'User'}
                          className="w-7 h-7 rounded-full border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] font-bold text-stone-900 leading-none truncate max-w-[120px]">
                            {currentUser.displayName}
                          </span>
                          {isAdminUser && (
                            <span className="text-[8px] font-black text-amber-600 uppercase tracking-wider">
                              Admin
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await signOut(auth);
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
                      >
                        లాగ్ అవుట్ (Logout)
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={async () => {
                        try {
                          await signInWithPopup(auth, googleProvider);
                        } catch (e) {
                          console.error(e);
                        }
                      }}
                      className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>గూగుల్ సైన్ ఇన్ (Google Sign In)</span>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. Hero Header Banner */}
      <header className="relative overflow-hidden bg-linear-to-b from-amber-50/70 via-stone-50 to-stone-50 py-10 border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 rounded-full text-[10px] sm:text-xs font-bold text-amber-800 shadow-2xs border border-amber-200/60 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>మన గృహం రియల్ ఎస్టేట్ యాప్ — 100% వెరిఫైడ్ లిస్టింగ్స్</span>
          </div>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-stone-900 tracking-tight leading-none max-w-3xl mx-auto">
            మీ కలల నివాసం <span className="text-amber-600">ఇక్కడ వెతకండి!</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl mx-auto leading-relaxed">
            ఆంధ్రప్రదేశ్ వ్యాప్తంగా మరియు ముఖ్యంగా కాкиనాడ, తూరంగి ప్రాంతాలలో బడ్జెట్ అనుకూలమైన ఇళ్ళు, ప్లాట్లు మరియు కమర్షియల్ స్థలాల సమాచారం.
          </p>

          {/* Quick numbers bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-4 text-stone-500 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>వెరిఫైడ్ ప్రాపర్టీస్ (100% Verified)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>తక్షణ సహాయం (Instant Call/Chat)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-blue-500" />
              <span>సులభమైన సెర్చ్ (Glide filters)</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Content Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs Switcher for Mobile Tab buttons at top of body */}
        <div className="flex md:hidden border-b border-stone-200 p-0.5 bg-stone-100 rounded-xl gap-1 overflow-x-auto">
          <button
            id="mobile-tab-browse"
            onClick={() => setActiveTab('listings')}
            className={`flex-1 text-center py-2 px-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'listings' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            వెతుకుడు (Search)
          </button>
          <button
            id="mobile-tab-services"
            onClick={() => setActiveTab('services')}
            className={`flex-1 text-center py-2 px-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'services' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            సేవలు (Services)
          </button>
          <button
            id="mobile-tab-pricing"
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 text-center py-2 px-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'pricing' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            ధరలు (Pricing)
          </button>
          <button
            id="mobile-tab-admin-board"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 text-center py-2 px-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'admin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            అడ్మిన్ (Admin)
          </button>
          <button
            id="mobile-tab-contact"
            onClick={() => setActiveTab('contact')}
            className={`flex-1 text-center py-2 px-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'contact' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
            }`}
          >
            సంప్రదించు (Contact)
          </button>
        </div>

        {/* --- VIEW 1: BROWSE HOMES WITH DYNAMIC FILTERS --- */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            
            {/* Filter Search Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-5">
              
              {/* Header inside filter with Search input */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-stone-800 uppercase tracking-wide">
                    లొకేషన్ ఆధారిత ఫిల్టర్స్ (Choice Filter Panel)
                  </h3>
                </div>

                {/* Text search query */}
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                  <input
                    id="search-listings-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ఇంటి పేరు, వర్ణన లేదా ఏరియా టైప్ చేయండి..."
                    className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-hidden bg-stone-50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic choice selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                
                {/* Choice 1: Choose City */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                    నగరాన్ని ఎంచుకోండి (Choose City)
                  </label>
                  <select
                    id="city-choice-select"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium text-stone-700"
                  >
                    {AVAILABLE_CITIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Choice 2: Choose Specific Area in selected City (Choice component) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                    నిర్దిష్ట ఏరియా (Choose Area)
                  </label>
                  <select
                    id="area-choice-select"
                    disabled={selectedCity === 'All'}
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium text-stone-700 disabled:bg-stone-50 disabled:text-stone-400"
                  >
                    {selectedCity === 'All' ? (
                      <option value="All">ముందుగా నగరాన్ని ఎంచుకోండి</option>
                    ) : (
                      availableAreas.map((areaVal) => (
                        <option key={areaVal} value={areaVal}>
                          {areaVal === 'All' ? 'మొత్తం ప్రాంతాలు (All Areas)' : areaVal === 'Turangi' ? 'తూరంగి (Turangi)' : areaVal === 'Gorantla' ? 'గోరంట్ల (Gorantla)' : areaVal === 'Benz Circle' ? 'బెంజ్ సర్కిల్ (Benz Circle)' : areaVal}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Choice 3: Property Type Capsules/Filters */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                    స్థిరాస్తి రకం (Property Type)
                  </label>
                  <select
                    id="type-choice-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium text-stone-700"
                  >
                    <option value="All">అన్నీ (All Property Types)</option>
                    <option value="house">ఇల్లు (Independent House)</option>
                    <option value="apartment">అపార్ట్‌మెంట్ (Apartment Flat)</option>
                    <option value="plot">ఓపెన్ ప్లాట్ (Open Plot / Land)</option>
                    <option value="commercial">కమర్షియల్ (Commercial Shop)</option>
                    <option value="farm_land">🌾 వ్యవసాయ భూములు & తోటలు (Agricultural Lands & Gardens)</option>
                  </select>
                </div>

                {/* Choice 4: Status (For Sale / Rent) */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                    అమ్మకం / అద్దె (Listing Status)
                  </label>
                  <select
                    id="status-choice-select"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium text-stone-700"
                  >
                    <option value="All">రెండు (Sale & Rent)</option>
                    <option value="sale">అమ్మకానికి (For Sale)</option>
                    <option value="rent">అద్దెకు (For Rent)</option>
                  </select>
                </div>

                {/* Choice 5: Budget / Price Range */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                    బడ్జెట్ / ధర (Price Range)
                  </label>
                  <select
                    id="price-range-select"
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium text-stone-700"
                  >
                    <option value="All">అన్ని బడ్జెట్లు (All Budgets)</option>
                    {selectedStatus === 'rent' ? (
                      <>
                        <option value="under-25k">₹25వేల లోపు (Under 25K)</option>
                        <option value="25k-50k">₹25వేలు - ₹50వేలు (25K - 50K)</option>
                        <option value="50k-plus">₹50వేల పైన (50K+)</option>
                      </>
                    ) : (
                      <>
                        <option value="under-10l">10 లక్షల లోపు (Under 10L)</option>
                        <option value="10-30l">10 - 30 లక్షలు (10L - 30L)</option>
                        <option value="30-50l">30 - 50 లక్షలు (30L - 50L)</option>
                        <option value="50l-plus">50 లక్షల పైన (50L+)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Choice 6: Property Age */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">
                    నిర్మాణ వయస్సు (Property Age)
                  </label>
                  <select
                    id="property-age-select"
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-medium text-stone-700"
                  >
                    <option value="All">అన్నీ (All Ages)</option>
                    <option value="new">సరికొత్త నిర్మాణం (New Construction)</option>
                    <option value="1-5">1-5 సంవత్సరాల పాతది (1-5 Years Old)</option>
                    <option value="5+">5+ సంవత్సరాల పైన (5+ Years Old)</option>
                  </select>
                </div>

              </div>

              {/* Specialized Agricultural Lands & Gardens search and filters */}
              {selectedType === 'farm_land' && (
                <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/30 space-y-4 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-800 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>వ్యవసాయ భూములు & తోటలు ఫిల్టర్లు (Agricultural Search & Filters)</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
                    {/* District */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">జిల్లా (District)</label>
                      <select
                        value={agriDistrict}
                        onChange={(e) => {
                          setAgriDistrict(e.target.value);
                          setAgriMandal('All');
                          setAgriVillage('All');
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium text-stone-700"
                      >
                        <option value="All">అన్ని జిల్లాలు (All Districts)</option>
                        {AP_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Mandal */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">మండలం (Mandal)</label>
                      <select
                        value={agriMandal}
                        disabled={agriDistrict === 'All'}
                        onChange={(e) => {
                          setAgriMandal(e.target.value);
                          setAgriVillage('All');
                        }}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium text-stone-700 disabled:bg-stone-50 disabled:text-stone-400"
                      >
                        <option value="All">అన్ని మండలాలు (All Mandals)</option>
                        {agriDistrict !== 'All' && (MANDALS_BY_DISTRICT[agriDistrict] || []).map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Village */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">గ్రామం (Village)</label>
                      <select
                        value={agriVillage}
                        disabled={agriMandal === 'All'}
                        onChange={(e) => setAgriVillage(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium text-stone-700 disabled:bg-stone-50 disabled:text-stone-400"
                      >
                        <option value="All">అన్ని గ్రామాలు (All Villages)</option>
                        {agriMandal !== 'All' && (VILLAGES_BY_MANDAL[agriMandal] || []).map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status Buy / Sell / Lease */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">లావాదేవీ రకం (Tx Type)</label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium text-stone-700"
                      >
                        <option value="All">అన్నీ (Buy, Sell & Lease)</option>
                        <option value="sale">అమ్మకానికి (For Sale)</option>
                        <option value="lease">లీజుకు (For Lease)</option>
                        <option value="buy">కొనుగోలు కావాలి (Wanted to Buy)</option>
                      </select>
                    </div>

                    {/* Min Acres */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">కనీస ఎకరాలు (Min Acres)</label>
                      <input
                        type="number"
                        placeholder="ఉదా: 1"
                        min="0"
                        value={agriMinAcres || ''}
                        onChange={(e) => setAgriMinAcres(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 border border-stone-200 rounded-xl bg-white font-medium text-stone-700 font-mono font-bold"
                      />
                    </div>

                    {/* Max Budget */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">గరిష్ట బడ్జెట్ (Max Budget ₹)</label>
                      <input
                        type="number"
                        placeholder="ఉదా: 5000000"
                        min="0"
                        value={agriMaxBudget || ''}
                        onChange={(e) => setAgriMaxBudget(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-1.5 border border-stone-200 rounded-xl bg-white font-medium text-stone-700 font-mono font-bold"
                      />
                    </div>

                    {/* Crop Type */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">పంట రకం (Crop Type)</label>
                      <select
                        value={agriCropType}
                        onChange={(e) => setAgriCropType(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium text-stone-700"
                      >
                        <option value="All">అన్ని పంటలు (All Crops)</option>
                        <option value="వరి">🌾 పంట పొలాలు / వరి (Paddy)</option>
                        <option value="చెరకు">🎋 చెరకు (Sugarcane)</option>
                        <option value="మిరప">🌶️ మిరప (Chilli)</option>
                        <option value="పత్తి">🌱 పత్తి (Cotton)</option>
                      </select>
                    </div>

                    {/* Garden Type */}
                    <div className="space-y-1">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">తోట రకం (Garden Type)</label>
                      <select
                        value={agriGardenType}
                        onChange={(e) => setAgriGardenType(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium text-stone-700"
                      >
                        <option value="All">అన్ని తోటలు (All Gardens)</option>
                        <option value="మామిడి">🥭 మామిడి తోటలు (Mango)</option>
                        <option value="కొబ్బరి">🥥 కొబ్బరి తోటలు (Coconut)</option>
                        <option value="నిమ్మ">🍋 నిమ్మ తోటలు (Lemon)</option>
                        <option value="నారింజ">🍊 ఇతర పండ్ల తోటలు (Orchards)</option>
                      </select>
                    </div>

                    {/* Water Facility */}
                    <div className="space-y-1 col-span-1 sm:col-span-2">
                      <label className="block text-[10px] text-stone-500 uppercase font-bold tracking-wider">నీటి సౌకర్యం (Water Facility)</label>
                      <select
                        value={agriWaterFacility}
                        onChange={(e) => setAgriWaterFacility(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-white font-medium text-stone-700"
                      >
                        <option value="All">అన్ని నీటి సౌకర్యాలు (All Facilities)</option>
                        <option value="Borewell">Borewell (బోరుబావి)</option>
                        <option value="Canal">Canal Water (కాల్వ నీరు)</option>
                        <option value="Electricity">Electricity (కరెంట్ సౌకర్యం)</option>
                        <option value="Drip">Drip Irrigation (డ్రిప్)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Status capsule indicators */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-stone-100 text-xs">
                <span className="text-stone-400 font-semibold mr-1">యాక్టివ్ ఫిల్టర్స్:</span>
                
                <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-[11px]">
                  నగరం: {AVAILABLE_CITIES.find(c => c.value === selectedCity)?.label || selectedCity}
                </span>

                {selectedArea !== 'All' && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full font-bold text-[11px]">
                    ఏరియా: {selectedArea === 'Turangi' ? 'తూరంగి (Turangi)' : selectedArea === 'Gorantla' ? 'గోరంట్ల (Gorantla)' : selectedArea}
                  </span>
                )}

                {selectedType !== 'All' && (
                  <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full font-bold text-[11px]">
                    రకం: {selectedType === 'house' ? 'స్వతంత్ర ఇల్లు' : selectedType === 'apartment' ? 'అపార్ట్‌మెంట్' : selectedType === 'plot' ? 'ఓపెన్ ప్లాట్' : selectedType === 'commercial' ? 'కమర్షియల్' : '🌾 వ్యవసాయ భూములు & తోటలు'}
                  </span>
                )}

                {selectedStatus !== 'All' && (
                  <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full font-bold text-[11px]">
                    స్టేటస్: {selectedStatus === 'sale' ? 'అమ్మకానికి' : 'అద్దెకు'}
                  </span>
                )}

                {selectedPriceRange !== 'All' && (
                  <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full font-bold text-[11px]">
                    ధర: {
                      selectedPriceRange === 'under-10l' ? '10 లక్షల లోపు' :
                      selectedPriceRange === '10-30l' ? '10 - 30 లక్షలు' :
                      selectedPriceRange === '30-50l' ? '30 - 50 లక్షలు' :
                      selectedPriceRange === '50l-plus' ? '50 లక్షల పైన' :
                      selectedPriceRange === 'under-25k' ? '₹25వేల లోపు' :
                      selectedPriceRange === '25k-50k' ? '₹25వేలు - ₹50వెలు' :
                      '₹50వేల పైన'
                    }
                  </span>
                )}

                {selectedAge !== 'All' && (
                  <span className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full font-bold text-[11px]">
                    వయస్సు: {
                      selectedAge === 'new' ? 'సరికొత్త నిర్మాణం' :
                      selectedAge === '1-5' ? '1-5 సంవత్సరాలు' :
                      '5+ సంవత్సరాలు'
                    }
                  </span>
                )}

                {showOnlyBookmarked && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-bold text-[11px] flex items-center gap-1">
                    <Bookmark className="w-3 h-3 fill-current text-amber-600" />
                    <span>బుక్‌మార్క్స్ మాత్రమే ({bookmarkedIds.length})</span>
                  </span>
                )}

                {(selectedCity !== 'All' || selectedArea !== 'All' || selectedType !== 'All' || selectedStatus !== 'All' || selectedPriceRange !== 'All' || selectedAge !== 'All' || showOnlyBookmarked || searchQuery !== '' || sortBy !== 'newest') && (
                  <button
                    id="reset-all-filters"
                    onClick={() => {
                      setSelectedCity('All');
                      setSelectedArea('All');
                      setSelectedType('All');
                      setSelectedStatus('All');
                      setSelectedPriceRange('All');
                      setSelectedAge('All');
                      setShowOnlyBookmarked(false);
                      setSearchQuery('');
                      setSortBy('newest');
                    }}
                    className="ml-auto text-amber-600 hover:text-amber-800 font-bold underline text-[11px] cursor-pointer"
                  >
                    అన్ని ఫిల్టర్స్ తీసివేయండి (Reset)
                  </button>
                )}
              </div>

            </div>

            {/* Price Analytics Trends Visualization */}
            <div className="mb-6">
              <PriceAnalytics listings={listings} />
            </div>

            {/* List Header & Grid Feed */}
            <div className="space-y-4">
              {selectedType === 'farm_land' ? (
                /* Agricultural Lands & Gardens Header with Dual Tabs (Listings / Buyer Requests) */
                <div className="space-y-4 border-b border-stone-200 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="font-display font-extrabold text-stone-900 text-lg md:text-xl flex items-center gap-2">
                        <span>🌾 వ్యవసాయ భూములు & తోటలు</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">
                          AP Agricultural Portal
                        </span>
                      </h2>
                      <p className="text-xs text-stone-400 font-bold">
                        పంట పొలాలు • తోటలు • వ్యవసాయ భూములు • ఫామ్ ల్యాండ్స్
                      </p>
                    </div>

                    {/* Tabs switcher segment control */}
                    <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200/50 self-start sm:self-auto shrink-0 shadow-xs">
                      <button
                        onClick={() => setAgriTab('listings')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                          agriTab === 'listings'
                            ? 'bg-white text-amber-700 shadow-sm border border-stone-200/20'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        <span>🏷️ అమ్మకం / లీజు (Listings)</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${agriTab === 'listings' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'}`}>
                          {filteredListings.length}
                        </span>
                      </button>
                      <button
                        onClick={() => setAgriTab('buyer_requests')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                          agriTab === 'buyer_requests'
                            ? 'bg-white text-emerald-700 shadow-sm border border-stone-200/20'
                            : 'text-stone-500 hover:text-stone-900'
                        }`}
                      >
                        <span>🛒 కొనుగోలు కావాలి (Buyer Requests)</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${agriTab === 'buyer_requests' ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'}`}>
                          {filteredBuyerRequests.length}
                        </span>
                      </button>
                    </div>

                    <div className="flex gap-2 self-stretch sm:self-auto">
                      {agriTab === 'listings' ? (
                        <button
                          onClick={() => setIsAddModalOpen(true)}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          + భూమి నమోదు చేయండి (Sell/Lease)
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsBuyerModalOpen(true)}
                          className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                        >
                          + కొనుగోలు అభ్యర్థన (Wanted to Buy)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Urban Real Estate Header */
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-stone-950 text-lg md:text-xl flex items-center gap-2">
                      <span>లభించగల ఇళ్ళు మరియు ప్లాట్లు</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        {filteredListings.length} వెరిఫైడ్ లిస్టింగ్స్
                      </span>
                    </h2>
                    <p className="text-xs text-stone-400">అనధికారిక సమాచారం లేని సురక్షితమైన స్థిరాస్తుల వివరాలు.</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Sort Dropdown */}
                    <div className="relative flex items-center bg-stone-100 hover:bg-stone-200 rounded-xl px-2.5 py-2 transition-all border border-stone-200/40">
                      <ArrowUpDown className="w-3.5 h-3.5 text-stone-500 mr-1.5" />
                      <select
                        id="sort-listings-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent border-0 p-0 text-xs font-bold text-stone-700 focus:ring-0 focus:outline-hidden cursor-pointer pr-2"
                      >
                        <option value="newest">కొత్తవి మొదట (Newest)</option>
                        <option value="price-low-to-high">ధర: తక్కువ ➔ ఎక్కువ (Low to High)</option>
                        <option value="price-high-to-low">ధర: ఎక్కువ ➔ తక్కువ (High to Low)</option>
                      </select>
                    </div>

                    <button
                      id="bookmark-quick-filter-toggle"
                      onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        showOnlyBookmarked
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                      title="దాచుకున్న బుక్‌మార్క్స్ మాత్రమే చూడండి"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${showOnlyBookmarked ? 'fill-current' : ''}`} />
                      <span className="hidden sm:inline">దాచుకున్నవి ({bookmarkedIds.length})</span>
                      <span className="sm:hidden">{bookmarkedIds.length}</span>
                    </button>

                    <button
                      id="feed-add-listing-trigger"
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    >
                      + ఇల్లు నమోదు చేయండి
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Content Grid depending on selection and Tab */}
              {selectedType === 'farm_land' && agriTab === 'buyer_requests' ? (
                /* BUYER REQUESTS GRID FEED VIEW */
                filteredBuyerRequests.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 space-y-4 max-w-lg mx-auto">
                    <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-stone-800 text-sm">కొనుగోలు అభ్యర్థనలు ఏవీ లేవు!</p>
                      <p className="text-stone-400 text-xs">
                        ప్రస్తుతం ఈ ప్రాంతంలో కొనుగోలుదారులు ఎవరూ నమోదు చేసుకోలేదు. మీరే మొదటగా నమోదు చేసుకోండి.
                      </p>
                    </div>
                    <button
                      onClick={() => setIsBuyerModalOpen(true)}
                      className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
                    >
                      కొనుగోలు అభ్యర్థనను సబ్మిట్ చేయండి
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredBuyerRequests.map((req) => (
                      <div key={req.id} className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-200 relative overflow-hidden">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider border ${
                                req.buyOrLease === 'buy'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/50'
                                  : 'bg-blue-50 text-blue-700 border-blue-200/50'
                              }`}>
                                {req.buyOrLease === 'buy' ? '🏷️ కొనుగోలు కావాలి (Wanted to Buy)' : '🔄 లీజుకు కావాలి (Wanted to Lease)'}
                              </span>
                              <h4 className="font-display font-extrabold text-stone-900 text-base mt-2 flex items-center gap-1.5">
                                <span>{req.customerName} గారు</span>
                              </h4>
                            </div>
                            <span className="text-[10px] text-stone-400 font-mono font-medium shrink-0">
                              {new Date(req.createdAt).toLocaleDateString('te-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-stone-600 border-t border-b border-stone-100 py-3 font-sans">
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">కావలసిన లొకేషన్</span>
                              <span className="font-semibold text-stone-800">{req.village}, {req.mandal}, {req.district}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">భూమి రకం (Land Type)</span>
                              <span className="font-semibold text-stone-850">{req.requiredLandType}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">వైశాల్యం (Required Acres)</span>
                              <span className="font-bold text-stone-900 font-mono">{req.requiredAcres} ఎకరాలు (Acres)</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">గరిష్ట బడ్జెట్ (Budget)</span>
                              <span className="font-black text-amber-600 font-mono">₹ {(req.budget / 100000).toFixed(1)} లక్షలు</span>
                            </div>
                          </div>

                          {req.cropGardenPreference && (
                            <div className="text-xs text-stone-650 flex items-start gap-1">
                              <span className="font-bold shrink-0">పంట ప్రాధాన్యత:</span>
                              <span className="text-stone-600">{req.cropGardenPreference}</span>
                            </div>
                          )}
                          {req.waterRequirement && (
                            <div className="text-xs text-stone-650 flex items-start gap-1">
                              <span className="font-bold shrink-0">నీటి వసతి కోరిక:</span>
                              <span className="text-stone-600">{req.waterRequirement}</span>
                            </div>
                          )}
                          {req.additionalRequirements && (
                            <div className="text-xs text-stone-500 italic bg-stone-50 p-2.5 rounded-xl border border-stone-150/40 relative">
                              <span className="absolute -top-1.5 left-3 bg-white px-1 text-[8px] font-bold text-stone-400">అదనపు అవసరాలు</span>
                              "{req.additionalRequirements}"
                            </div>
                          )}
                        </div>

                        {/* Interactive actions for buyer requests */}
                        <div className="grid grid-cols-2 gap-2.5 border-t border-stone-100 pt-3 text-center text-xs">
                          <a
                            href={`tel:${req.mobileNumber}`}
                            className="flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs border border-amber-200/20"
                          >
                            <Phone className="w-3.5 h-3.5 text-amber-600" />
                            <span>కాల్ (Call Buyer)</span>
                          </a>
                          <a
                            href={`https://wa.me/91${req.mobileNumber}?text=${encodeURIComponent(
                              `హలో ${req.customerName} గారు, 'మనం గృహం ఏపీ రియల్ యాప్' ద్వారా మీరు సమర్పించిన వ్యవసాయ భూమి కొనుగోలు అభ్యర్థన గురించి సంప్రదిస్తున్నాను:\n` +
                              `- కావలసిన విస్తీర్ణం: ${req.requiredAcres} ఎకరాలు\n` +
                              `- బడ్జెట్: ₹${(req.budget / 100000).toFixed(1)} లక్షలు\n` +
                              `- లొకేషన్: ${req.village}, ${req.mandal}\n` +
                              `నా వద్ద దీనికి తగిన భూమి వివరాలు ఉన్నాయి. మాట్లాడదామా?`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs border border-emerald-200/20"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>వాట్సాప్ (Chat)</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : filteredListings.length === 0 ? (
                /* Standard Empty Search State */
                <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 space-y-4 max-w-lg mx-auto">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-stone-800 text-sm">ప్రాపర్టీస్ ఏవీ లభించలేదు!</p>
                    <p className="text-stone-400 text-xs">
                      {showOnlyBookmarked 
                        ? 'మీరు ఇంకా ఏ ప్రాపర్టీని కూడా దాచుకోలేదు (బుక్‌మార్క్ చేయలేదు).' 
                        : 'మీరు ఎంచుకున్న నగరంలో లేదా ఏరియాలో ప్రస్తుతానికి అప్రూవ్డ్ ఇళ్ళు లేవు. దయచేసి వేరే ఫిల్టర్స్ మార్చి చూడండి.'}
                    </p>
                  </div>
                  <button
                    id="search-empty-reset-btn"
                    onClick={() => {
                      setSelectedCity('All');
                      setSelectedArea('All');
                      setSelectedType('All');
                      setSelectedStatus('All');
                      setSelectedPriceRange('All');
                      setShowOnlyBookmarked(false);
                      setSearchQuery('');
                      setSortBy('newest');
                      setAgriDistrict('All');
                      setAgriMandal('All');
                      setAgriVillage('All');
                      setAgriMinAcres(0);
                      setAgriMaxBudget(0);
                      setAgriCropType('All');
                      setAgriGardenType('All');
                      setAgriWaterFacility('All');
                    }}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl hover:bg-stone-800 cursor-pointer"
                  >
                    అన్ని ఫిల్టర్స్ క్లియర్ చేయండి
                  </button>
                </div>
              ) : (
                /* Standard Listings Grid Feed */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((property) => (
                    <ListingCard
                      key={property.id}
                      property={property}
                      isBookmarked={bookmarkedIds.includes(property.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onViewDetails={(prop) => setSelectedProperty(prop)}
                      onContactWhatsApp={(prop) => handleContactWhatsApp(prop)}
                      isComparing={compareIds.includes(property.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Simulated Banner to contact Raghava for Turangi plots */}
            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-display font-bold text-amber-900 text-sm md:text-base">
                  తూరంగి (Turangi) కాకినాడ పరిసరాల్లో ల్యాండ్ ప్లాట్లు కావలెనా?
                </h4>
                <p className="text-xs text-amber-700">
                  డైరెక్ట్ ఓనర్ రిజిస్ట్రేషన్ తో క్లియర్ ల్యాండ్ టైటిల్స్ కోసం శివ రాఘవ గారిని సంప్రదించండి.
                </p>
              </div>
              <a
                id="banner-whatsapp-quick"
                href="https://wa.me/918977776111?text=%E0%B0%B9%E0%B0%B2%E0%B1%8B%20%E0%B0%B0%E0%B0%BE%E0%B0%98%E0%B0%B5%20%E0%B0%97%E0%B0%BE%E0%B0%B0%E0%B1%81%2C%20%E0%B0%A8%E0%B1%87%E0%B0%A8%E0%B1%81%20%E0%B0%A4%E0%B1%82%E0%B0%B0%E0%B0%82%E0%B0%97%E0%B0%BF%20%E0%B0%AA%E0%B1%8D%E0%B0%B2%E0%B0%BE%E0%B0%9F%E0%B1%8D%E0%B0%B2%20%E0%B0%B5%E0%B0%BF%E0%B0%B5%E0%B0%B0%E0%B0%BE%E0%B0%B2%20%E0%B0%95%E0%B1%8A%E0%B0%B0%E0%B0%95%E0%B1%81%20%E0%B0%B8%E0%B0%82%E0%B0%AA%E0%B1%8D%E0%B0%B0%E0%B0%A6%E0%B0%BF%E0%B0%82%E0%B0%9A%E0%B0%BE%E0%B0%B2%E0%B0%A8%E0%B1%8D%E0%B0%95%E0%B1%81%E0%B0%82%E0%B0%9F%E0%B1%81%E0%B0%A8%E0%B1%8D%E0%B0%A8%E0%B0%BE%E0%B0%A8%E0%B1%81%E0%B1%8D"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 shadow-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>తూరంగి ప్లాట్ల విచారణ</span>
              </a>
            </div>

          </div>
        )}

        {/* --- VIEW 7: DEDICATED FAVORITES / SAVED PROPERTIES SECTION --- */}
        {activeTab === 'favorites' && (() => {
          const favoritedListings = listings.filter((l) => bookmarkedIds.includes(l.id));
          const filteredFavorites = favoritedListings.filter((item) => {
            const matchesSearch = 
              favSearchQuery.trim() === '' ||
              item.title.toLowerCase().includes(favSearchQuery.toLowerCase()) ||
              item.area.toLowerCase().includes(favSearchQuery.toLowerCase()) ||
              item.city.toLowerCase().includes(favSearchQuery.toLowerCase()) ||
              (item.village && item.village.toLowerCase().includes(favSearchQuery.toLowerCase())) ||
              (item.mandal && item.mandal.toLowerCase().includes(favSearchQuery.toLowerCase())) ||
              (item.district && item.district.toLowerCase().includes(favSearchQuery.toLowerCase()));

            const matchesCategory = 
              favCategoryFilter === 'All' ||
              (favCategoryFilter === 'agricultural' && item.type === 'farm_land') ||
              (favCategoryFilter === 'residential' && (item.type === 'house' || item.type === 'apartment' || item.type === 'villa')) ||
              (favCategoryFilter === 'commercial' && (item.type === 'commercial' || item.type === 'plot')) ||
              (favCategoryFilter === 'rentals' && item.status === 'rent');

            return matchesSearch && matchesCategory;
          });

          const handleShareFavoritesList = () => {
            if (favoritedListings.length === 0) return;
            const titleText = `నా 'మన గృహం ఏపీ' ఇష్టమైన ప్రాపర్టీస్ జాబితా (${favoritedListings.length} సేవ్ చెయ్యబడ్డాయి):\n\n`;
            const listText = favoritedListings.map((prop, idx) => 
              `${idx + 1}. ${prop.title} - ₹${prop.priceFormatted}\n   📍 ${prop.village ? `${prop.village}, ${prop.district}` : `${prop.area}, ${prop.city}`}\n`
            ).join('\n');
            const fullShareText = titleText + listText + `\nమరిన్ని వివరాలకు మన గృహం యాప్ చూడండి!`;
            
            if (navigator.share) {
              navigator.share({
                title: 'మన గృహం ఇష్టమైన ప్రాపర్టీస్',
                text: fullShareText,
                url: window.location.origin
              }).catch(() => {});
            } else {
              window.open(`https://wa.me/?text=${encodeURIComponent(fullShareText)}`, '_blank');
            }
          };

          const handleClearAllFavorites = () => {
            if (window.confirm("మీరు నిజంగా అన్ని ఇష్టమైన ప్రాపర్టీలను తీసివేయాలనుకుంటున్నారా? (Clear all favorites?)")) {
              setBookmarkedIds([]);
              localStorage.removeItem('mana_gruham_bookmarks_v1');
            }
          };

          return (
            <div className="space-y-8 animate-fadeIn">
              {/* Header Banner */}
              <div className="bg-linear-to-r from-rose-900 via-rose-800 to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-400/30 rounded-full text-rose-200 text-xs font-semibold backdrop-blur-md">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                      <span>ఇష్టమైన ప్రాపర్టీస్ (Saved Favorites)</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                      నా సేవ్ చేసుకున్న ఇళ్ళు & ల్యాండ్లు
                    </h2>
                    <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                      మీకు అత్యంత నచ్చిన ప్రాపర్టీలను ఒకే చోట సులభంగా పోల్చండి, ఓనర్లను నేరుగా సంప్రదించండి మరియు వాట్సాప్‌లో పంచుకోండి.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {favoritedListings.length > 0 && (
                      <>
                        <button
                          onClick={handleShareFavoritesList}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                          title="వాట్సాప్ ద్వారా ఈ లిస్ట్ పంచుకోండి"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>లిస్ట్ షేర్ చేయండి (Share)</span>
                        </button>

                        <button
                          onClick={handleClearAllFavorites}
                          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-rose-200 border border-rose-400/30 font-bold text-xs rounded-xl backdrop-blur-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                          title="ఇష్టమైనవి అన్ని ఖాళీ చేయి"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                          <span>అన్నీ తీసివేయి (Clear All)</span>
                        </button>
                      </>
                    )}

                    <div className="px-4 py-2 bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5">
                      <span>సేవ్‌ చేసినవి:</span>
                      <span className="text-sm font-mono">{favoritedListings.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter Bar */}
              {favoritedListings.length > 0 && (
                <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-4">
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={favSearchQuery}
                      onChange={(e) => setFavSearchQuery(e.target.value)}
                      placeholder="ఇష్టమైనవాటిలో వెతకండి (టైటిల్, లొకేషన్, ఊరు...)"
                      className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-hidden"
                    />
                    {favSearchQuery && (
                      <button
                        onClick={() => setFavSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                      value={favCategoryFilter}
                      onChange={(e) => setFavCategoryFilter(e.target.value)}
                      className="w-full md:w-auto px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
                    >
                      <option value="All">అన్ని క్యాటగిరీలు (All Categories)</option>
                      <option value="agricultural">🌾 వ్యవసాయ భూములు & తోటలు</option>
                      <option value="residential">🏡 నివాస ఇళ్ళు & అపార్ట్‌మెంట్లు</option>
                      <option value="commercial">🏢 కమర్షియల్ & ప్లాట్లు</option>
                      <option value="rentals">🔑 అద్దె ఇళ్ళు (Rentals)</option>
                    </select>

                    {(favSearchQuery || favCategoryFilter !== 'All') && (
                      <button
                        onClick={() => {
                          setFavSearchQuery('');
                          setFavCategoryFilter('All');
                        }}
                        className="px-3 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl shrink-0 cursor-pointer"
                      >
                        రీసెట్
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Grid or Empty State */}
              {favoritedListings.length === 0 ? (
                /* Primary Empty State */
                <div className="bg-white rounded-3xl border border-stone-200/80 p-8 sm:p-14 text-center max-w-xl mx-auto space-y-5 shadow-xs">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-inner">
                    <Heart className="w-10 h-10 fill-rose-100 animate-pulse text-rose-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-extrabold text-stone-900">
                      మీరు ఇంకా ఏ ప్రాపర్టీని కూడా ఇష్టమైనవిలో దాచుకోలేదు!
                    </h3>
                    <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">
                      ప్రాపర్టీ కార్డుల పైభాగంలో ఉన్న <span className="text-rose-600 font-bold inline-flex items-center gap-0.5">❤️ గుండె గుర్తు</span> పై క్లిక్ చేయడం ద్వారా మీకు నచ్చిన ఇళ్ళు మరియు తోటలను ఇక్కడ సేవ్ చేసుకోవచ్చు.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      id="favorites-empty-browse-btn"
                      onClick={() => setActiveTab('listings')}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>ఇళ్ళు & భూములు వెతకండి (Browse Properties)</span>
                    </button>
                  </div>
                </div>
              ) : filteredFavorites.length === 0 ? (
                /* Search Filter Empty State */
                <div className="bg-white rounded-3xl border border-stone-200/80 p-10 text-center max-w-md mx-auto space-y-4">
                  <Search className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="font-bold text-stone-800 text-sm">ఎంచుకున్న ఫిల్టర్‌కు తగ్గట్టుగా ఇష్టమైనవి లభించలేదు</p>
                  <p className="text-stone-400 text-xs">దయచేసి వేరే పదం వెతికి చూడండి లేదా ఫిల్టర్లు రీసెట్ చేయండి.</p>
                  <button
                    onClick={() => {
                      setFavSearchQuery('');
                      setFavCategoryFilter('All');
                    }}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    ఫిల్టర్లు రీసెట్ చేయండి (Reset)
                  </button>
                </div>
              ) : (
                /* Property Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFavorites.map((property) => (
                    <ListingCard
                      key={property.id}
                      property={property}
                      isBookmarked={bookmarkedIds.includes(property.id)}
                      onToggleBookmark={handleToggleBookmark}
                      onViewDetails={(prop) => setSelectedProperty(prop)}
                      onContactWhatsApp={(prop) => handleContactWhatsApp(prop)}
                      isComparing={compareIds.includes(property.id)}
                      onToggleCompare={handleToggleCompare}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* --- VIEW 2: ADMIN IS_APPROVED MANAGEMENT BOARD --- */}
        {activeTab === 'admin' && (
          <AdminPanel
            listings={listings}
            onUpdateApproval={handleUpdateApproval}
            onDeleteListing={handleDeleteListing}
            onViewProperty={(prop) => setSelectedProperty(prop)}
            feedbacks={feedbacks}
            onDeleteFeedback={handleDeleteFeedback}
            onExtendExpiry={handleExtendExpiry}
            payments={payments}
            onVerifyPayment={handleVerifyPayment}
            onRejectPayment={handleRejectPayment}
          />
        )}

        {/* --- VIEW 6: SERVICES & PRODUCTS MARKETPLACE --- */}
        {activeTab === 'services' && (
          <ServicesProductsPanel
            payments={payments}
            onInitiatePayment={(item) => {
              setCurrentPaymentProps({
                purpose: `${item.nameTe} (${item.nameEn})`,
                amount: item.price,
                itemId: item.id,
                itemType: item.category,
              });
              setIsPaymentModalOpen(true);
            }}
          />
        )}

        {/* --- VIEW 4: USER CONTROL PANEL --- */}
        {activeTab === 'user' && (
          <UserPanel
            listings={listings}
            onRenewListing={handleRenewListing}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onDeleteListing={handleDeleteListing}
            onEditListing={(property) => {
              setEditingListing(property);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* --- VIEW 5: PRICING PACKAGES VIEW --- */}
        {activeTab === 'pricing' && (
          <PricingPackages
            listings={listings}
            onActivateListing={handleActivateListing}
            onOpenAddModalWithPackage={(pkgId) => {
              setPreselectedPackage(pkgId);
              setIsAddModalOpen(true);
            }}
          />
        )}

        {/* --- VIEW 3: CONTACT CENTER & APK DOWNLOAD PORTAL --- */}
        {activeTab === 'contact' && (
          <ContactCard />
        )}

      </main>

      {/* 4. Real-estate Local Area Guides & Bottom Info Section */}
      <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Prominent App Download & QR Code Section at App Bottom */}
          <FooterAppDownload />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Branding widget */}
            <div className="space-y-3 col-span-1 md:col-span-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-stone-950 font-bold">
                  మ
                </div>
                <span className="font-display font-extrabold text-white text-base">
                  మన గృహం రియల్ ఎస్టేట్
                </span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                మన గృహం యాప్ — ఆంధ్రప్రదేశ్ నగరాల్లో నమ్మకమైన ఇల్లు మరియు ప్లాట్లు కొనుగోలు చేయడానికి లేదా అద్దెకు తీసుకోవడానికి ఒక వెరిఫైడ్ లొకేషన్ ఆధారిత వేదిక.
              </p>
              <p className="text-[10px] text-stone-500">
                © {new Date().getFullYear()} Mana Gruham Apps. All rights reserved. Built with love in Turangi.
              </p>
            </div>

            {/* Areas widget */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                కవర్ చేసే ప్రధాన నగరాలు (Cities Covered)
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-400">
                <li>• కాకినాడ (Kakinada / Turangi)</li>
                <li>• విజయవాడ (Vijayawada Benz Circle)</li>
                <li>• గుంటూరు (Guntur Gorantla)</li>
                <li>• అమరావతి రాజధాని (Amaravati CG)</li>
                <li>• తిరుపతి & విశాఖపట్నం</li>
              </ul>
            </div>

            {/* Contacts widget */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">
                సంప్రదింపు వివరాలు (Quick Help)
              </h4>
              <div className="space-y-1.5 text-xs text-stone-400 font-mono">
                <p>ఫోన్: 8977776111</p>
                <p>మెయిల్: injarapusivaraghava@gmail.com</p>
                <p>లొకేషన్: తూరంగి, కాకినాడ - 533016</p>
                <p className="text-amber-400 font-bold">డెమో కోడ్: raghava123</p>
              </div>
            </div>

          </div>

          {/* Bottom attribution & credits */}
          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
            <p>మన గృహం యాప్‌ను సపోర్ట్ చేస్తున్న ఆంధ్రప్రదేశ్ రియల్టర్లకు ధన్యవాదాలు.</p>
            <div className="flex gap-4">
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('గోప్యతా విధానం (Privacy Policy): మీ వివరాలు అడ్మిన్ శివ రాఘవ అనుమతి లేనిదే ఏ ఇతర ప్లాట్‌ఫామ్‌లలో పంచుకోబడవు.'); }} className="hover:underline">Privacy Policy</a>
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert('నిబంధనలు (Terms of Use): అప్లోడ్ చేసే ప్రతి స్థిరాస్తి ఒరిజినల్ ఫోటోలు మరియు సరైన ధర వివరాలు కలిగి ఉండాలి.'); }} className="hover:underline">Terms of Use</a>
            </div>
          </div>

        </div>
      </footer>

      {/* --- MODAL DIALOG 1: VIEW PROPERTY DETAILS --- */}
      <ListingDetailsModal
        property={selectedProperty}
        isBookmarked={selectedProperty ? bookmarkedIds.includes(selectedProperty.id) : false}
        onToggleBookmark={handleToggleBookmark}
        onClose={() => setSelectedProperty(null)}
      />

      {/* --- MODAL DIALOG 2: UPLOAD/ADD PROPERTY LISTING --- */}
      {isAddModalOpen && (
        <AddListingModal
          onClose={() => {
            setIsAddModalOpen(false);
            setPreselectedPackage(undefined);
            setEditingListing(null);
          }}
          onSubmit={(listing) => {
            handleAddListing(listing);
            setPreselectedPackage(undefined);
            setEditingListing(null);
          }}
          initialPackageId={preselectedPackage}
          editListing={editingListing || undefined}
        />
      )}

      {/* --- MODAL DIALOG 2.2: SUBMIT BUYER REQUEST FOR AGRICULTURAL PROPERTIES --- */}
      {isBuyerModalOpen && (
        <BuyerRequestModal
          onClose={() => setIsBuyerModalOpen(false)}
          onSubmit={(newRequest) => {
            setBuyerRequests((prev) => [newRequest, ...prev]);
            setIsBuyerModalOpen(false);
          }}
          currentUserUid={currentUser?.uid}
        />
      )}

      {/* --- MODAL DIALOG 2.5: SUGGESTIONS AND FEEDBACK MODAL --- */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSaveFeedback={handleSaveFeedback}
      />

      {/* --- MODAL DIALOG 3: COMPARE PROPERTIES SIDE-BY-SIDE --- */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        selectedProperties={comparedProperties}
        onRemoveProperty={(id) => setCompareIds((prev) => prev.filter((item) => item !== id))}
        onViewDetails={(prop) => setSelectedProperty(prop)}
        onContactWhatsApp={(prop) => handleContactWhatsApp(prop)}
      />

      {/* Floating Comparison Control Bar */}
      <AnimatePresence>
        {compareIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-45 bg-stone-900/95 backdrop-blur-md border border-stone-800 text-white rounded-3xl p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4 w-[92%] max-w-2xl"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-amber-500 rounded-xl text-stone-900 shrink-0">
                <GitCompare className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h5 className="text-xs font-bold text-white">పోల్చడానికి ఎంచుకున్నవి ({compareIds.length}/2)</h5>
                <p className="text-[10px] text-stone-400">రెండు వేర్వేరు ఆస్తుల వివరాలను పక్కపక్కనే సరిపోల్చుకోండి.</p>
              </div>
            </div>

            {/* Selected items thumbs */}
            <div className="flex items-center gap-2">
              {comparedProperties.map((p) => (
                <div key={p.id} className="relative w-10 h-10 rounded-lg overflow-hidden border border-stone-800 shrink-0 group">
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleToggleCompare(p)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white cursor-pointer"
                    title="తొలగించు (Remove)"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              {compareIds.length < 2 && (
                <div className="w-10 h-10 rounded-lg border border-dashed border-stone-700 flex items-center justify-center text-stone-600 shrink-0">
                  <span className="text-xs">+1</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setCompareIds([])}
                className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-all cursor-pointer"
              >
                క్లియర్ (Clear)
              </button>
              
              <button
                type="button"
                onClick={() => setIsCompareModalOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>ఇప్పుడే పోల్చండి</span>
                <span className="bg-stone-950/15 text-[10px] font-mono font-black px-1.5 py-0.5 rounded-md">{compareIds.length}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Error Notification */}
      <AnimatePresence>
        {compareError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white rounded-2xl px-5 py-3 text-xs font-bold shadow-xl flex items-center gap-2 max-w-md w-[90%] text-center justify-center"
          >
            <span>⚠️ {compareError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Mana Gruham Secure UPI Payment Modal */}
      {isPaymentModalOpen && currentPaymentProps && (
        <ManaGruhamPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setCurrentPaymentProps(null);
          }}
          purpose={currentPaymentProps.purpose}
          amount={currentPaymentProps.amount}
          itemId={currentPaymentProps.itemId}
          itemType={currentPaymentProps.itemType}
          packageName={currentPaymentProps.packageName}
          onSubmitPayment={handleSubmitPayment}
          defaultCustomerName="గృహ వినియోగదారుడు"
        />
      )}

    </div>
  );
}
