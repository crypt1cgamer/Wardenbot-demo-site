// Modifiers
const modValues = ['Regular', 'Extra', 'None'];

// Drinks (if you still want a separate list)
const drinkList = [
  'Coke', 'Diet Coke', 'Sprite', 'Dr Pepper',
  'Mountain Dew', 'Root Beer', 'Lemonade',
  'Sweet Tea', 'Unsweet Tea', 'Water'
];

// Images for menu items
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
  'Mozzarella Sticks':'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
  'Mac Bites':'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=800&q=80'
};