
export interface Service {
  name: string;
  price: number;
}

export interface Salon {
  id: string;
  name: string;
  ownerId: string;
  state: string;
  city: string;
  landmark: string;
  address: string;
  services: Service[];
  isAuthorized: boolean;
  isPaid: boolean;
  lastPaymentDate: string;
  imageUrl: string;
}

export const MOCK_SALONS: Salon[] = [
  {
    id: "1",
    name: "Classic Cuts & Shave",
    ownerId: "owner_1",
    state: "Karnataka",
    city: "Bangalore",
    landmark: "Opposite Big Banyan Tree",
    address: "123 Green Street, Kengeri",
    services: [
      { name: "Haircut", price: 150 },
      { name: "Beard Trim", price: 80 },
      { name: "Head Massage", price: 100 }
    ],
    isAuthorized: true,
    isPaid: true,
    lastPaymentDate: "2024-05-01",
    imageUrl: "https://picsum.photos/seed/salon1/600/400"
  },
  {
    id: "2",
    name: "Elite Beauty Hub",
    ownerId: "owner_2",
    state: "Maharashtra",
    city: "Mumbai",
    landmark: "Near Gateway of India",
    address: "45 Marine Drive, Colaba",
    services: [
      { name: "Hair Styling", price: 500 },
      { name: "Facial", price: 800 },
      { name: "Manicure", price: 350 }
    ],
    isAuthorized: true,
    isPaid: true,
    lastPaymentDate: "2024-04-20",
    imageUrl: "https://picsum.photos/seed/salon2/600/400"
  },
  {
    id: "3",
    name: "Glow Parlor",
    ownerId: "owner_3",
    state: "Karnataka",
    city: "Bangalore",
    landmark: "Beside Metro Pillar 44",
    address: "78 Indiranagar Main Rd",
    services: [
      { name: "Pedicure", price: 400 },
      { name: "Hair Coloring", price: 1200 }
    ],
    isAuthorized: false,
    isPaid: true,
    lastPaymentDate: "2024-05-15",
    imageUrl: "https://picsum.photos/seed/salon4/600/400"
  }
];

export interface Booking {
  id: string;
  salonId: string;
  userId: string;
  userName: string;
  userPhone: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'NoShow';
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: "b1",
    salonId: "1",
    userId: "user_1",
    userName: "Rahul Sharma",
    userPhone: "+91 9876543210",
    serviceName: "Haircut",
    date: "2024-06-10",
    time: "10:30 AM",
    status: "Pending"
  }
];
