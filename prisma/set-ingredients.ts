import prisma from '../src/lib/prisma'

async function main() {
  const liste_des_ingrédients = [
    "Onion", "Garlic", "Carrot", "Tomato", "Potato",
    "Bell Pepper", "Celery", "Zucchini", "Spinach", "Broccoli",
    "Mushroom", "Parsley", "Basil", "Coriander", "Thyme",
    "Rosemary", "Bay Leaf", "Leek", "Ginger", "Chili Pepper",
    "Lemon", "Orange", "Banana", "Apple", "Strawberry",
    "Chicken", "Beef", "Pork", "Lamb", "Turkey",
    "Salmon", "Tuna", "Shrimp", "Milk", "Butter",
    "Cream", "Cheese", "Yogurt", "Flour", "Rice",
    "Pasta", "Bread", "Eggs", "Sugar", "Honey",
    "Olive Oil", "Vinegar", "Salt", "Black Pepper", "Cinnamon"
  ]

  const promises = []
  for (const ingredient of liste_des_ingrédients) {
    promises.push(prisma.ingredientList.upsert({
        where: { label: ingredient },
        update: {},
        create: {
            label: ingredient
        }
    }))
  }
  await Promise.all(promises)
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });