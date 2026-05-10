import { firestoreService } from './services/firestoreService';

export async function seedData() {
  const categories = [
    { name: '純粹好茶', order: 1 },
    { name: '醇乳奶茶', order: 2 },
    { name: '旬味果茶', order: 3 },
  ];

  for (const cat of categories) {
    await firestoreService.addCategory(cat.name, cat.order);
  }

  // Note: Since we don't have cat IDs yet in this simple script, 
  // you might need to add products manually in the UI.
  console.log('Seeding initiated...');
}
