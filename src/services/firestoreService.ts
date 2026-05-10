import { db, auth } from '../lib/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp,
  getDocs,
  where
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// MOCK DATA for local testing/fallback
const MOCK_CATEGORIES = [
  { id: 'mock-cat-1', name: '純粹好茶', order: 1 },
  { id: 'mock-cat-2', name: '醇乳奶茶', order: 2 },
  { id: 'mock-cat-3', name: '季節特調', order: 3 },
];

const MOCK_PRODUCTS = [
  { id: 'mock-p-1', categoryId: 'mock-cat-1', name: '莊園琥珀紅茶', price: 30, description: '產自斯里蘭卡高海拔莊園，帶有淡淡肉桂與花香。', available: true },
  { id: 'mock-p-2', categoryId: 'mock-cat-1', name: '沁香四季春茶', price: 30, description: '台灣在地四季春，茶湯翠綠，香氣持久。', available: true },
  { id: 'mock-p-3', categoryId: 'mock-cat-2', name: '經典錫蘭奶茶', price: 50, description: '濃厚錫蘭茶底搭配鮮乳，純粹奶香。', available: true },
  { id: 'mock-p-4', categoryId: 'mock-cat-3', name: '楊枝甘露', price: 75, description: '新鮮芒果、西米露與椰奶的完美融合。', available: true },
];

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firestoreService = {
  // Check if we are in demo mode (using placeholder config)
  isDemoMode: () => {
    try {
      // @ts-ignore
      return !auth.app.options.apiKey || auth.app.options.apiKey === "YOUR_API_KEY";
    } catch (e) {
      return true;
    }
  },

  // Categories
  subscribeCategories: (callback: (categories: any[]) => void) => {
    if (firestoreService.isDemoMode()) {
      callback(MOCK_CATEGORIES);
      return () => {};
    }
    try {
      const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
      return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          callback(MOCK_CATEGORIES);
        } else {
          const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(categories);
        }
      }, (error) => {
        console.warn("Using mock categories due to firestore error:", error);
        callback(MOCK_CATEGORIES);
      });
    } catch (e) {
      callback(MOCK_CATEGORIES);
      return () => {};
    }
  },

  // Products
  subscribeProducts: (callback: (products: any[]) => void) => {
    if (firestoreService.isDemoMode()) {
      callback(MOCK_PRODUCTS);
      return () => {};
    }
    try {
      const q = query(collection(db, 'products'));
      return onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
          callback(MOCK_PRODUCTS);
        } else {
          const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(products);
        }
      }, (error) => {
        console.warn("Using mock products due to firestore error:", error);
        callback(MOCK_PRODUCTS);
      });
    } catch (e) {
      callback(MOCK_PRODUCTS);
      return () => {};
    }
  },

  // Orders
  subscribeOrders: (callback: (orders: any[]) => void) => {
    if (firestoreService.isDemoMode()) {
      // In demo mode, we could use localStorage to persist a few orders
      const saved = localStorage.getItem('mock_orders');
      callback(saved ? JSON.parse(saved) : []);
      return () => {};
    }
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(orders);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));
  },

  createOrder: async (orderData: any) => {
    if (firestoreService.isDemoMode()) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      const newOrder = {
        id: 'DEMO-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
        ...orderData,
        createdAt: { seconds: Date.now() / 1000 },
        status: 'pending'
      };
      // Keep a small list in memory/localstorage for the dashborad
      const current = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      localStorage.setItem('mock_orders', JSON.stringify([newOrder, ...current]));
      return newOrder;
    }

    try {
      return await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: Timestamp.now(),
        status: 'pending'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    if (firestoreService.isDemoMode()) {
      const current = JSON.parse(localStorage.getItem('mock_orders') || '[]');
      const updated = current.map((o: any) => o.id === orderId ? { ...o, status } : o);
      localStorage.setItem('mock_orders', JSON.stringify(updated));
      return;
    }

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    }
  },

  // Admin: Category management
  addCategory: async (name: string, order: number) => {
    try {
      await addDoc(collection(db, 'categories'), { name, order });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  },

  // Admin: Product management
  addProduct: async (productData: any) => {
    try {
      await addDoc(collection(db, 'products'), { ...productData, available: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'products');
    }
  }
};
