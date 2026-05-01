const imageMap = {
  'Classic Smash Burger':'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
  'Bacon BBQ Burger':'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
  'Crispy Chicken Sandwich':'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80',
  'Buffalo Chicken Wrap':'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
  'Loaded Street Tacos':'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=800&q=80',
  'Philly Cheesesteak':'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80',
  'Pulled Pork Sandwich':'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=800&q=80',
  'Loaded Nachos':'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80',
  'Chicken Quesadilla':'https://images.unsplash.com/photo-1618040996337-56904b7850b9?auto=format&fit=crop&w=800&q=80',
  'Foodtruck Combo Basket':'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=800&q=80',
  'Seasoned Fries':'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
  'Onion Rings':'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80',
  'Mozzarella Sticks':'https://static01.nyt.com/images/2024/02/08/multimedia/ND-mozzarella-sticks-pvfm/ND-mozzarella-sticks-pvfm-mediumSquareAt3X.jpg', 
  'Mac Bites':'https://cookingformysoul.com/wp-content/uploads/2023/03/feat-mac-cheese-bites-min.jpg',
  'Drink':'https://www.tastyoptionsnj.com/cdn/shop/files/mixedcans@2x.jpg?v=1736435817'
};

const modValues = ['Regular', 'Extra', 'None'];

const drinkOptions = [
  'Coke', 'Diet Coke', 'Sprite', 'Dr Pepper',
  'Mountain Dew', 'Root Beer', 'Lemonade',
  'Sweet Tea', 'Unsweet Tea', 'Water'
];

const menuData = {
  mains: [
    { name: 'Classic Smash Burger', price: 10.99, description: 'Beef patty, cheese, pickles, onions, house sauce.', mods: ['Onions', 'Pickles', 'Cheese', 'Sauce'] },
    { name: 'Bacon BBQ Burger', price: 12.49, description: 'Bacon, cheddar, BBQ sauce, crispy onions.', mods: ['Onions', 'Cheese', 'BBQ Sauce', 'Bacon'] },
    { name: 'Crispy Chicken Sandwich', price: 10.49, description: 'Crispy chicken, lettuce, tomato, ranch.', mods: ['Lettuce', 'Tomato', 'Ranch', 'Pickles'] },
    { name: 'Buffalo Chicken Wrap', price: 9.99, description: 'Buffalo chicken, lettuce, cheese, ranch wrap.', mods: ['Lettuce', 'Cheese', 'Buffalo Sauce', 'Ranch'] },
    { name: 'Loaded Street Tacos', price: 11.99, description: 'Three tacos with meat, cheese, salsa, onions.', mods: ['Onions', 'Cheese', 'Salsa', 'Cilantro'] },
    { name: 'Philly Cheesesteak', price: 12.99, description: 'Steak, peppers, onions, cheese sauce.', mods: ['Peppers', 'Onions', 'Cheese Sauce', 'Mayo'] },
    { name: 'Pulled Pork Sandwich', price: 11.49, description: 'Slow pulled pork, BBQ, slaw, toasted bun.', mods: ['BBQ Sauce', 'Slaw', 'Pickles', 'Onions'] },
    { name: 'Loaded Nachos', price: 10.99, description: 'Chips, cheese, meat, salsa, sour cream.', mods: ['Cheese', 'Salsa', 'Sour Cream', 'Jalapenos'] },
    { name: 'Chicken Quesadilla', price: 9.49, description: 'Grilled tortilla, chicken, cheese, salsa.', mods: ['Cheese', 'Salsa', 'Sour Cream', 'Jalapenos'] },
    { name: 'Foodtruck Combo Basket', price: 13.99, description: 'Choice of main, side, and drink.', mods: ['Sauce', 'Cheese', 'Onions', 'Pickles'] }
  ],

  sides: [
    { name: 'Seasoned Fries', price: 3.50, description: 'Crispy fries with house seasoning.', mods: ['Salt', 'Seasoning'] },
    { name: 'Onion Rings', price: 4.25, description: 'Golden fried onion rings.', mods: ['Salt', 'Sauce'] },
    { name: 'Mozzarella Sticks', price: 5.25, description: 'Fried mozzarella with marinara.', mods: ['Marinara', 'Seasoning'] },
    { name: 'Mac Bites', price: 4.75, description: 'Crispy mac and cheese bites.', mods: ['Salt', 'Sauce'] }
  ],

  drinks: [
    { name: 'Drink', price: 2.00, description: 'Choose your drink.', type: 'drink' }
  ]
};