export const ORDER_URLS = {
  burlington: 'https://burgertone.orderingclub.com/en/burgertone?menu=61439df1967db3aeae03277e_2',
  toronto: 'https://www.clover.com/online-ordering/burgertone-toronto',
}

export const SITE_URL = 'https://burgertone.com'

// Each page is pre-rendered to its own HTML file at build time (scripts/prerender.mjs). The paths keep the
// old Wix site's URLs so existing Google rankings carry over.
export const PAGES = {
  home: { path: '/', title: 'Burgertone | Halal Smash Burgers in Burlington & Toronto', description: 'Fresh halal smash burgers, hand-cut fries, Philly cheesesteaks and signature shakes at Burgertone on Upper Middle Road in Burlington and Mt Pleasant Road in Toronto.' },
  menu: { path: '/menu', title: 'Menu | Burgertone Burlington & Toronto', description: 'Smash burgers, chicken burgers, Philly cheesesteak, hot dogs, hand-cut fries, poutine and milkshakes. See the Burgertone Burlington and Toronto menus and order online.' },
  about: { path: '/about', title: 'Our Story | Burgertone', description: 'Burgertone was born from a love of good food and good music: halal beef ground every day, freshly hand-cut fries and our one-of-a-kind ToneSauce.' },
  feedback: { path: '/feedback', title: 'Feedback & Reviews | Burgertone', description: 'Tell us how we did. Leave a Google review for Burgertone Burlington or Burgertone Toronto.' },
  // Written as 404.html: Cloudflare serves it with a 404 status for any unknown URL (not indexed, no canonical).
  notFound: { path: '/404', title: 'Page not found | Burgertone', description: 'This page is not on the Burgertone setlist.' },
}

// Old Wix pages that no longer exist; scripts/prerender.mjs writes Cloudflare 301 redirects to the home page.
export const OLD_PATHS = ['/franchise', '/careers', '/reservations', '/experiences']

export const NAV_ITEMS = [
  ['Home', '/', 'home'],
  ['Menu', '/menu', 'menu'],
  ['Our Story', '/about', 'about'],
  ['Locations', '/#location', null],
  ['Feedback', '/feedback', 'feedback'],
]

export const REVIEW_URLS = {
  burlington: 'https://g.page/r/CfUzVCIXr8DREAE/review',
  toronto: 'https://g.page/r/CSzMTursQow2EAE/review',
}

// Toronto grand opening, Friday Oct 30 2026, special hours 4–10 PM. The "Free burgers" bar, popup and the
// special-hours note on the Toronto card show until it ends (10 PM Toronto time).
export const OFFER = {
  image: '/assets/offer-toronto-grand-opening.webp',
  width: 1600,
  height: 893,
  endsAt: '2026-10-31T02:00:00Z',
  alt: 'Burgertone Toronto grand opening: free beef cheeseburgers on Friday, October 30 from 4 PM to 10 PM at 505 Mt Pleasant Rd, Toronto. Follow @burgertone.ca on Instagram to get a free cheeseburger. In person only, one per guest, while supplies last.',
}

export const HIGHLIGHTS = [
  { name: 'Classic Burger', image: '/assets/classic.jpg' },
  { name: 'Rock Burger', image: '/assets/rock.jpg' },
  { name: 'Heavy Metal Burger', image: '/assets/heavy-metal.jpg' },
  { name: 'Pop Burger', image: '/assets/pop.jpg' },
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

// One menu per location, no prices (each ordering site has the current ones). `notes` print under a group.
export const MENUS = [
  {
    id: 'burlington', location: 'Burlington',
    groups: [
      {
        category: 'Burgers & More', number: '01',
        items: [
          { name: 'Classic Burger', description: 'Mouth-watering beef patty with toppings of your choice on a toasted brioche bun.' },
          { name: 'Rock Burger', description: '2 mouth-watering smashed beef patties topped with the toppings of your choice on a toasted brioche bun.' },
          { name: 'Heavy Metal Burger', description: '3× smashed beef patties topped with cheddar cheese and toppings of your choice on a toasted brioche bun.' },
          { name: 'Pop Burger', description: 'A juicy patty stuffed with marble cheese topped with the toppings of your choice on a toasted brioche bun.' },
          { name: 'Jazz Burger', description: 'Crispy chicken breast topped with cheddar cheese and toppings of your choice on a toasted brioche bun.' },
          { name: 'Country Burger', description: 'A chicken breast grilled to perfection with toppings of your choice on a toasted brioche bun.' },
          { name: 'Alternative', description: 'A juicy Beyond Meat® patty cooked to perfection and topped with topping of your choice.' },
          { name: 'R&B', description: 'Philly cheesesteak with sautéed onions, mushrooms, jalapeño, mayo, and a choice of melted cheese or mozzarella cheese on a toasted bun.' },
          { name: 'Who Let The Dogs Out', description: 'A hot dog topped with toppings of your choice on a hot dog bun.' },
        ],
      },
      {
        category: 'Sides', number: '02',
        items: [
          { name: 'Featuring (Fries)', description: 'Our signature fries.' },
          { name: 'Remix (Poutine)', description: 'Signature fries topped with cheese curds and gravy.' },
          { name: 'Album (Veggie Fries)', description: 'Fries with sour cream, melted cheese, green onions and diced tomatoes.' },
          { name: 'Loops (Onion Rings)', description: 'Crispy onion rings.' },
          { name: 'Chicken Dance (Tenders and Fries)', description: '3× battered crispy chicken breasts with fresh fries.' },
          { name: 'Gravy', description: '' },
          { name: 'Tone Sauce on the Side', description: 'Our house sauce on the side.' },
        ],
      },
      {
        category: 'Drinks', number: '03',
        items: [
          { name: 'Shake it Off', description: 'Signature milkshake. Vanilla, chocolate and strawberry flavours are listed on the restaurant menu.' },
          { name: 'Canned Pop', description: 'Pick your choice in store.' },
        ],
      },
      {
        category: 'Combos', number: '04',
        items: [
          { name: 'Classic Burger Combo', description: 'Classic Burger, Featuring fries and soft drink.' },
          { name: 'Jazz Burger Combo', description: 'Crispy chicken burger, medium fries and soft drink.' },
          { name: 'Rock Burger Combo', description: 'Rock Burger, Featuring fries and soft drink.' },
          { name: 'Country Burger Combo', description: 'Grilled chicken burger, medium fries and soft drink.' },
          { name: 'Heavy metal Combo', description: 'Heavy Metal Burger, fries and soft drink.' },
          { name: 'R&B combo', description: '' },
          { name: 'Hot Dog Combo', description: 'Signature hot dog, Featuring fries and soft drink.' },
          { name: 'Alternative Combo', description: 'Alternative burger, Featuring fries and soft drink.' },
          { name: 'Pop Burger Combo 1', description: 'Angus beef patty stuffed with cheddar cheese with toppings of your choice, Featuring fries and soft drink.' },
        ],
      },
    ],
  },
  {
    // Mirrors the Toronto in-store menu boards (Beef Burgers, Chicken & More, Sides & Shakes).
    id: 'toronto', location: 'Toronto',
    groups: [
      {
        category: 'Beef Burgers', number: '01',
        items: [
          { name: 'Classic', description: 'Beef Patty • Cheese • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
          { name: 'Pop', description: 'Marble Cheese-Stuffed Beef Patty • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
          { name: 'Rock', description: 'Double Beef Patty • Beef Bacon • Cheese • Mushrooms • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
          { name: 'Heavy Metal', description: 'Triple Beef Patty • Egg • Cheese • Grilled Mushrooms • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
        ],
        notes: ['Customise any burger on request. All toppings available; some extras cost more.'],
      },
      {
        category: 'Chicken & More', number: '02',
        items: [
          { name: 'Country', description: 'Grilled Chicken • Cheese • Jalapeños • Lettuce • Pickles • Tomato • Spicy Tone Sauce' },
          { name: 'Jazz', description: 'Crispy Chicken • Cheese • Lettuce • Pickles • Tomato • Mayo' },
          { name: 'Alternative', description: 'Beyond Meat • Cheese • Lettuce • Onion • Pickles • Tomato • Tone Sauce' },
          { name: 'R&B', description: 'Philly Cheesesteak • Cheese • Sautéed Onions • Grilled Mushrooms • Jalapeños • Mayo' },
          { name: 'Who Let The Dogs Out', description: 'Hot Dog • Your Choice of Toppings' },
        ],
      },
      {
        category: 'Sides & Shakes', number: '03',
        items: [
          { name: 'Featuring', description: 'Fresh-Cut Fries' },
          { name: 'Loops', description: 'Onion Rings' },
          { name: 'Remix', description: 'Poutine • Gravy & Cheese Curds' },
          { name: 'Album', description: 'Loaded Fries • Cheese • Sour Cream • Green Onions & Tomatoes' },
          { name: 'Chicken Dance', description: '3 Chicken Tenders & Fries' },
          { name: 'Shake It Off', description: 'Milkshakes: Vanilla • Chocolate • Strawberry • Banana • Oreo • Nutella • Lotus • Caramel. Whipped cream optional.' },
          { name: 'Canned Pop', description: '' },
          { name: 'Gravy', description: '' },
          { name: 'Tone Sauce on the Side', description: 'Our house sauce on the side.' },
        ],
      },
      {
        category: 'Combos', number: '04',
        items: [
          { name: 'Make it a combo', description: 'Any beef burger, chicken & more item or hot dog with fresh-cut fries + a canned pop' },
          { name: 'Swap your fries', description: 'Upgrade the combo fries to Loops, Album or Remix' },
          { name: 'Swap your pop', description: 'Upgrade the combo pop to a Shake It Off milkshake' },
        ],
      },
    ],
  },
]

// From the Google Business listings.
export const HOURS = {
  burlington: [
    ['Monday', '11:00 AM – 9:00 PM'],
    ['Tuesday', '11:00 AM – 9:00 PM'],
    ['Wednesday', '11:00 AM – 9:00 PM'],
    ['Thursday', '11:00 AM – 9:00 PM'],
    ['Friday', '11:00 AM – 10:00 PM'],
    ['Saturday', '11:00 AM – 10:00 PM'],
    ['Sunday', '11:00 AM – 9:00 PM'],
  ],
  toronto: [
    ['Monday', '11:00 AM – 11:00 PM'],
    ['Tuesday', '11:00 AM – 11:00 PM'],
    ['Wednesday', '11:00 AM – 11:00 PM'],
    ['Thursday', '11:00 AM – 11:00 PM'],
    ['Friday', '11:00 AM – 11:00 PM'],
    ['Saturday', '11:00 AM – 11:00 PM'],
    ['Sunday', '11:00 AM – 11:00 PM'],
  ],
}
