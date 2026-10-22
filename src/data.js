export const ORDER_URL = 'https://burgertone.orderingclub.com/en/burgertone?menu=61439df1967db3aeae03277e_2'

export const NAV_ITEMS = [
  ['Home', 'home'],
  ['Our Burgers', 'burgers'],
  ['Menu', 'menu'],
  ['Our Story', 'story'],
  ['Location', 'location'],
]

export const HIGHLIGHTS = [
  { name: 'Classic Burger', price: '$9.99', image: '/assets/classic.jpg', description: 'Beef patty and cheese with lettuce, onion, pickles, tomato and Tone Sauce on a toasted brioche bun.' },
  { name: 'Rock Burger', price: '$14.99', image: '/assets/rock.jpg', description: 'Beef patty, beef bacon, cheese and mushrooms with lettuce, onion, pickles, tomato and Tone Sauce.' },
  { name: 'Heavy Metal Burger', price: '$17.99', image: '/assets/heavy-metal.jpg', description: 'Beef patty, beef bacon, egg, cheese and grilled mushrooms with lettuce, onion, pickles, tomato and Tone Sauce.' },
  { name: 'Pop Burger', price: '$12.99', image: '/assets/pop.jpg', description: 'A marble cheese-stuffed beef patty with lettuce, onion, pickles, tomato and Tone Sauce on a toasted brioche bun.' },
]

// Burgertone record turning at 33⅓ rpm (Higgsfield photo, label animated in place); portrait cut for phones.
export const HERO_LOOP = {
  video: '/assets/hero-loop.mp4',
  mobileVideo: '/assets/hero-loop-portrait.mp4',
  poster: '/assets/hero-loop-poster.webp',
}

export const STORY_TRACKS = [
  ['Halal beef', 'Ground fresh every day'],
  ['Fries', 'Freshly hand-cut'],
  ['ToneSauce', 'Our one-of-a-kind house sauce'],
  ['Brioche buns', 'Toasted for every burger'],
  ['Good music', 'The grooviest tunes, always on'],
]

// Mirrors the in-store menu boards (Beef Burgers, Chicken & More, Sides & Shakes); `notes` are the board footers.
export const MENU = [
  {
    category: 'Beef Burgers', number: '01',
    items: [
      { name: 'Classic', price: '$9.99', description: 'Beef Patty • Cheese • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
      { name: 'Pop', price: '$12.99', description: 'Marble Cheese-Stuffed Beef Patty • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
      { name: 'Rock', price: '$14.99', description: 'Beef Patty • Beef Bacon • Cheese • Mushrooms • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
      { name: 'Heavy Metal', price: '$17.99', description: 'Beef Patty • Beef Bacon • Egg • Cheese • Grilled Mushrooms • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
    ],
    notes: ['Classic, Rock & Heavy Metal: double +$2.99 / triple +$5.99', 'Customise any burger on request. All toppings available; some extras cost more.'],
  },
  {
    category: 'Chicken & More', number: '02',
    items: [
      { name: 'Country', price: '$11.99', description: 'Grilled Chicken • Cheese • Jalapeños • Lettuce • Pickles • Tomato • Spicy Tone Sauce' },
      { name: 'Jazz', price: '$11.99', description: 'Crispy Chicken • Cheese • Lettuce • Pickles • Tomato • Mayo' },
      { name: 'Alternative', price: '$11.99', description: 'Beyond Meat • Cheese • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
      { name: 'R&B', price: '$15.99', description: 'Philly Cheesesteak • Cheese • Sautéed Onions • Grilled Mushrooms • Jalapeños • Mayo' },
      { name: 'Who Let The Dogs Out', price: '$7.99', description: 'Hot Dog • Your Choice of Toppings' },
    ],
  },
  {
    category: 'Sides & Shakes', number: '03',
    items: [
      { name: 'Featuring', price: '$5.99', description: 'Fresh-Cut Fries' },
      { name: 'Loops', price: '$6.99', description: 'Onion Rings' },
      { name: 'Remix', price: '$8.99', description: 'Poutine • Gravy & Cheese Curds' },
      { name: 'Album', price: '$7.99', description: 'Loaded Fries • Cheese • Sour Cream • Green Onions & Tomatoes' },
      { name: 'Chicken Dance', price: '$13.99', description: '3 Chicken Tenders & Fries' },
      { name: 'Shake It Off', price: '$7.99', description: 'Milkshakes: Vanilla • Chocolate • Strawberry • Banana • Oreo • Nutella • Lotus • Caramel. Whipped cream optional.' },
      { name: 'Canned Pop', price: '$1.99', description: '' },
      { name: 'Gravy', price: '$1.50', description: '' },
      { name: 'Tone Sauce on the Side', price: '$0.50', description: 'Our house sauce on the side.' },
    ],
  },
  {
    category: 'Combos', number: '04',
    items: [
      { name: 'Classic', price: '$16.99', description: '' },
      { name: 'Pop', price: '$19.99', description: '' },
      { name: 'Rock', price: '$21.99', description: '' },
      { name: 'Heavy Metal', price: '$24.99', description: '' },
      { name: 'Country', price: '$18.99', description: '' },
      { name: 'Jazz', price: '$18.99', description: '' },
      { name: 'Alternative', price: '$18.99', description: '' },
      { name: 'R&B', price: '$23.99', description: '' },
      { name: 'Who Let The Dogs Out', price: '$14.99', description: '' },
    ],
    notes: ['Combos include fresh-cut fries + canned pop', 'Swap fries: Loops +$0.99 / Album +$1.99 / Remix +$3.99', 'Swap your combo pop for a shake +$5.99'],
  },
]

export const HOURS = [
  ['Monday', '11:00 AM – 9:00 PM'],
  ['Tuesday', '11:00 AM – 9:00 PM'],
  ['Wednesday', '11:00 AM – 9:00 PM'],
  ['Thursday', '11:00 AM – 10:00 PM'],
  ['Friday', '11:00 AM – 10:00 PM'],
  ['Saturday', '11:00 AM – 10:00 PM'],
  ['Sunday', '11:00 AM – 10:00 PM'],
]
