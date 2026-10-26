export type PropertyType = 'house' | 'apartment' | 'plot' | 'commercial' | 'farm_land';
export type ListingStatus = 'sale' | 'rent' | 'lease' | 'buy'; // Added lease and buy
export type ApprovalStatus = 'Yes' | 'Pending' | 'No';
export type LandAvailabilityStatus = 'Available' | 'Sold' | 'Leased' | 'Under Discussion';

export interface PropertyListing {
  id: string;
  title: string;
  description: string;
  price: number; // in Rupees
  priceFormatted: string; // e.g. "45 Lakhs" or "1.2 Crores"
  type: PropertyType;
  status: 'sale' | 'rent' | 'lease'; // Supports For Sale, For Rent, For Lease
  city: string; // e.g. "Kakinada", "Vijayawada", "Guntur", "Tirupati", "Visakhapatnam", "Amaravati"
  area: string; // e.g. "Turangi", "Benz Circle", "Gorantla", "Bhanugudi"
  beds?: number;
  baths?: number;
  size: string; // e.g. "1200 sqft" or "150 Sq. Yards"
  imageUrl: string;
  images?: string[];
  isApproved: ApprovalStatus;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  submittedBy: string;
  createdAt: string;
  updatedAt?: string; // Date of last update
  features?: string[];
  facing?: 'East' | 'West' | 'North' | 'South' | 'North-East' | 'South-East' | 'North-West' | 'South-West';
  age?: number; // Age in years (0 for new/under-construction, 1-5, or 5+)
  
  // Agricultural / Garden Specific Fields
  district?: string;
  mandal?: string;
  village?: string;
  exactLocation?: string;
  googleMapsUrl?: string;
  landAreaAcres?: number;
  landAreaCents?: number;
  landType?: string; // Subcategory: పంట పొలాలు, మామిడి తోటలు, కొబ్బరి తోటలు, etc.
  cropType?: string;
  gardenType?: string;
  waterFacility?: string[]; // Borewell, Canal Water, Electricity, etc.
  roadAccess?: string; // Yes / No or details
  fencing?: string; // Fencing status
  pricePerAcre?: number;
  whatsappContact?: string;
  videoUrl?: string;
  availabilityStatus?: LandAvailabilityStatus; // Available, Sold, Leased, Under Discussion

  // Paid Listing Fields (Razorpay Integration)
  paymentId?: string;
  paymentAmount?: number;
  packageName?: 'basic' | 'premium' | 'featured';
  paymentStatus?: 'pending' | 'success' | 'failed';
  paymentDate?: string;
  startDate?: string;
  expiryDate?: string;
}

export interface BuyerRequest {
  id: string;
  customerName: string;
  mobileNumber: string;
  district: string;
  mandal: string;
  village: string;
  requiredLandType: string;
  requiredAcres: number;
  budget: number;
  cropGardenPreference?: string;
  waterRequirement?: string;
  buyOrLease: 'buy' | 'lease';
  additionalRequirements?: string;
  createdAt: string;
  submittedBy: string;
}

export interface AreaFilter {
  city: string;
  areas: string[];
}

export interface UserFeedback {
  id: string;
  name: string;
  contact: string;
  type: 'feature' | 'issue';
  message: string;
  createdAt: string;
}

export type PaymentSystemStatus = 'Pending' | 'Verified' | 'Rejected';

export interface ManaGruhamPayment {
  id: string; // generated TXN id, e.g. "TXN-87428472"
  customerName: string;
  paymentPurpose: string;
  amount: number;
  upiId: string; // isivaraghava@okaxis
  utr: string; // User-entered Transaction Reference / UTR
  status: PaymentSystemStatus;
  createdAt: string;
  verifiedAt?: string;
  itemType: 'service' | 'product' | 'booking' | 'other' | 'package';
  itemId: string; // e.g. "vastu-consult" or listing property id
  packageName?: 'basic' | 'premium' | 'featured'; // if listing package
  contactPhone?: string;
}

