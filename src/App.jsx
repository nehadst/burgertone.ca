import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HOURS, HIGHLIGHTS, MENU, NAV_ITEMS, ORDER_URL } from './data'

gsap.registerPlugin(ScrollTrigger)

function FoodImage({ src, ...props }) {
  const modernSrc = src.replace(/\.jpg$/i, '.webp')
  return <picture><source srcSet={modernSrc} type="image/webp" /><img src={src} {...props} /></picture>
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
}

function OrderLink({ children = 'Order Online', className = '' }) {
  return <a className={`button button--primary ${className}`} href={ORDER_URL} target="_blank" rel="noopener noreferrer">{children}<ArrowIcon /></a>
}

function BrandMark({ light = false }) {
  return <a className={`brand ${light ? 'brand--light' : ''}`} href="#home" aria-label="Burgertone home"><img src="/assets/burgertone-logo.png" alt="Burgertone" width="500" height="73" /></a>
}

function Navigation() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`nav-shell ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="nav" aria-label="Main navigation">
        <BrandMark />
        <div className={`nav__links ${open ? 'is-open' : ''}`} id="mobile-menu">
          {NAV_ITEMS.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}
          <OrderLink className="nav__order" />
        </div>
        <button className="nav__toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </nav>
    </header>
  )
}

function Hero() {
  const ref = useRef(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero__eyebrow', { y: 24, opacity: 0, duration: .7 })
        .from('.hero__title-line > span', { yPercent: 110, duration: 1.05, stagger: .12 }, '-=.45')
        .from('.hero__copy, .hero__actions', { y: 24, opacity: 0, duration: .8, stagger: .12 }, '-=.55')
        .from('.hero__visual', { scale: .88, opacity: 0, duration: 1.25 }, '-=1')
      gsap.to('.hero__visual img', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: 'bottom top', scrub: true } })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="hero" id="home" ref={ref} aria-labelledby="hero-title">
      <div className="hero__content container">
        <div className="hero__text">
          <p className="eyebrow hero__eyebrow"><span>Fresh Angus. Halal. Ground daily.</span></p>
          <h1 id="hero-title">
            <span className="hero__title-line"><span>Burgers</span></span>
            <span className="hero__title-line hero__title-line--accent"><span>with a beat.</span></span>
          </h1>
          <p className="hero__copy">Big flavour, fresh smash burgers and signature shakes—served to the rhythm of Burlington.</p>
          <div className="hero__actions">
            <OrderLink />
            <a className="button button--ghost" href="#menu">Explore the menu</a>
          </div>
        </div>
        <div className="hero__visual" aria-hidden="true">
          <div className="hero__halo" />
          <FoodImage src="/assets/heavy-metal.jpg" alt="" width="1920" height="1080" fetchPriority="high" />
          <span className="hero__stamp">03<br /><small>patties</small></span>
        </div>
        <div className="hero__ticker" aria-hidden="true"><span>SMASHED FRESH</span><i /> <span>HOUSE TONESAUCE</span><i /> <span>GOOD MUSIC</span></div>
      </div>
      <a className="scroll-cue" href="#burgers"><span>Scroll to play</span><i /></a>
    </section>
  )
}

function Assembly() {
  const ref = useRef(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=240%', pin: true, scrub: .8, anticipatePin: 1, invalidateOnRefresh: true } })
      tl.from('.slice--top', { yPercent: -80, rotate: -2, opacity: .35 }, 0)
        .from('.slice--middle', { xPercent: 18, scale: 1.08, opacity: .35 }, .08)
        .from('.slice--bottom', { yPercent: 80, rotate: 2, opacity: .35 }, .16)
        .to('.assembly__label--1', { opacity: 1, x: 0 }, .05)
        .to('.assembly__label--2', { opacity: 1, x: 0 }, .28)
        .to('.assembly__label--3', { opacity: 1, x: 0 }, .5)
        .to('.assembly__intro', { opacity: 0, y: -30 }, .58)
        .to('.assembly__reveal', { opacity: 1, y: 0 }, .68)
        .to('.assembly__image', { scale: .93 }, .68)
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="assembly" id="burgers" ref={ref} aria-labelledby="assembly-title">
      <div className="assembly__track container">
        <div className="assembly__intro">
          <p className="eyebrow">Track 01 / The build</p>
          <h2 id="assembly-title">Stacked like<br />a power chord.</h2>
        </div>
        <div className="assembly__image">
          <div className="slice slice--top"><FoodImage src="/assets/heavy-metal.jpg" alt="" width="1920" height="1080" /></div>
          <div className="slice slice--middle"><FoodImage src="/assets/heavy-metal.jpg" alt="" width="1920" height="1080" /></div>
          <div className="slice slice--bottom"><FoodImage src="/assets/heavy-metal.jpg" alt="" width="1920" height="1080" /></div>
          <span className="assembly__label assembly__label--1">01 / Toasted brioche</span>
          <span className="assembly__label assembly__label--2">02 / 3× smashed beef</span>
          <span className="assembly__label assembly__label--3">03 / Cheddar + your toppings</span>
        </div>
        <div className="assembly__reveal">
          <p className="eyebrow">Now playing</p>
          <h3>Heavy<br />Metal</h3>
          <p>Three towering smashed patties, cheddar and your choice of toppings.</p>
          <strong>$17.99</strong>
        </div>
      </div>
    </section>
  )
}

function FlavourStory() {
  const ref = useRef(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.flavour__word span', { yPercent: 100, stagger: .08, duration: 1, ease: 'power4.out', scrollTrigger: { trigger: ref.current, start: 'top 65%' } })
      gsap.from('.equalizer i', { scaleY: .08, transformOrigin: 'bottom', stagger: { each: .04, from: 'random' }, ease: 'power2.inOut', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: .7 } })
      gsap.to('.record', { rotate: 100, ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 } })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="flavour" ref={ref} aria-labelledby="flavour-title">
      <div className="container flavour__grid">
        <div>
          <p className="eyebrow">Track 02 / Turn it up</p>
          <h2 id="flavour-title" className="flavour__word"><span>Turn up</span><span className="outline">the flavour.</span></h2>
          <p className="flavour__copy">Every bite gets its own rhythm: beef smashed on the grill, fresh toppings, in-house ToneSauce, then the perfect brioche finish.</p>
        </div>
        <div className="flavour__graphic" aria-hidden="true">
          <div className="record"><span>BT</span><i /></div>
          <div className="equalizer">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--h': `${28 + ((i * 37) % 70)}%` }} />)}</div>
          <span className="flavour__bpm">289.313.8225<br />BURLINGTON / ON</span>
        </div>
      </div>
    </section>
  )
}

function ProductStory() {
  const ref = useRef(null)
  const rail = useRef(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        '(min-width: 901px)': () => {
          const distance = () => Math.max(0, rail.current.scrollWidth - window.innerWidth)
          gsap.to(rail.current, { x: () => -distance(), ease: 'none', scrollTrigger: { trigger: ref.current, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1 } })
        },
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section className="products" ref={ref} aria-labelledby="highlights-title">
      <div className="products__rail" ref={rail}>
        <header className="product-intro product-panel">
          <p className="eyebrow">Selected tracks</p>
          <h2 id="highlights-title">The<br />headliners.</h2>
          <p>Four signatures. One very loud appetite.</p>
          <span>Scroll to dig in →</span>
        </header>
        {HIGHLIGHTS.map((item, index) => (
          <article className="product-panel product" key={item.name}>
            <div className="product__image"><FoodImage src={item.image} alt={`${item.name} served with fries`} loading="lazy" width="1920" height="1080" /></div>
            <div className="product__meta">
              <span>0{index + 1}</span>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <div><strong>{item.price}</strong><OrderLink>Get this track</OrderLink></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function FullMenu() {
  return (
    <section className="menu-section" id="menu" aria-labelledby="menu-title">
      <div className="container">
        <header className="section-head">
          <div><p className="eyebrow">The full setlist</p><h2 id="menu-title">Menu</h2></div>
          <p>Prices and availability are sourced from Burgertone’s current pickup menu. Order for live customization options.</p>
        </header>
        <div className="menu-groups">
          {MENU.map((group) => (
            <article className="menu-group" key={group.category}>
              <header><span>{group.number}</span><h3>{group.category}</h3></header>
              <div className="menu-list">
                {group.items.map((item) => (
                  <div className="menu-item" key={item.name}>
                    <div><h4>{item.name}</h4>{item.description && <p>{item.description}</p>}</div>
                    <strong>{item.price}</strong>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        <div className="menu-cta"><p>Want every option and topping?</p><OrderLink>Customize & order</OrderLink></div>
      </div>
    </section>
  )
}

function SidesAndShakes() {
  const ref = useRef(null)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    const ctx = gsap.context(() => {
      gsap.from('.duet-card img', { scale: 1.18, yPercent: 8, duration: 1.5, stagger: .15, ease: 'power2.out', scrollTrigger: { trigger: ref.current, start: 'top 70%' } })
    }, ref)
    return () => ctx.revert()
  }, [])
  return (
    <section className="duet" ref={ref} aria-labelledby="duet-title">
      <div className="container">
        <p className="eyebrow">The encore</p>
        <h2 id="duet-title">Sides. Shakes.<br /><em>No skips.</em></h2>
        <div className="duet-grid">
          <article className="duet-card duet-card--red">
            <FoodImage src="/assets/remix.jpg" alt="Burgertone Remix poutine" loading="lazy" width="1920" height="1080" />
            <div><span>Remix</span><h3>Poutine</h3><p>Signature fries, cheese curds and gravy.</p><strong>$8.99</strong></div>
          </article>
          <article className="duet-card duet-card--cream">
            <FoodImage src="/assets/shakes.jpg" alt="Chocolate, vanilla and strawberry Burgertone milkshakes" loading="lazy" width="1920" height="1080" />
            <div><span>Shake it off</span><h3>Milkshake</h3><p>Vanilla, chocolate or strawberry.</p><strong>$7.99</strong></div>
          </article>
        </div>
      </div>
    </section>
  )
}

function Story() {
  return (
    <section className="story" id="story" aria-labelledby="story-title">
      <div className="container story__grid">
        <div className="story__visual">
          <FoodImage src="/assets/rnb.jpg" alt="Burgertone R&B Philly cheesesteak served with fries" loading="lazy" width="1920" height="1080" />
          <span>Made in Burlington<br />Played loud</span>
        </div>
        <div className="story__copy">
          <p className="eyebrow">Track 03 / Our story</p>
          <h2 id="story-title">Good food.<br /><em>Good music.</em></h2>
          <p>Burgertone was born from a love for both. Years of passion came together in smash burgers, cheesesteaks, hot dogs and refreshing shakes—all served with the grooviest of tunes.</p>
          <p>Our beef is halal and ground daily. Our fries are freshly hand-cut. Our one-of-a-kind ToneSauce ties it all together.</p>
          <a className="text-link" href="#location">Come orchestrate your burger <ArrowIcon /></a>
        </div>
      </div>
    </section>
  )
}

function Location() {
  return (
    <section className="location" id="location" aria-labelledby="location-title">
      <div className="container">
        <header className="location__head">
          <p className="eyebrow">Burlington, Ontario</p>
          <h2 id="location-title">Come hungry.<br />Leave humming.</h2>
        </header>
        <div className="location__grid">
          <div className="location__primary">
            <span>Find us</span>
            <address>2025 Upper Middle Road<br />Burlington, ON L7P 4K1</address>
            <a className="text-link" href="https://maps.google.com/?q=2025+Upper+Middle+Road+Burlington+ON+L7P+4K1" target="_blank" rel="noopener noreferrer">Open in maps <ArrowIcon /></a>
            <OrderLink>Order for pickup</OrderLink>
          </div>
          <div className="hours">
            <h3>Hours</h3>
            <dl>{HOURS.map(([day, time]) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}</dl>
          </div>
          <div className="contact">
            <h3>Say hello</h3>
            <a href="tel:+12893138225">(289) 313-8225</a>
            <a href="mailto:info@burgertone.com">info@burgertone.com</a>
            <div className="socials"><a href="https://www.instagram.com/burgertone.ca/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.facebook.com/burgertone.ca/" target="_blank" rel="noopener noreferrer">Facebook ↗</a></div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top"><BrandMark light /><OrderLink>Turn up the flavour</OrderLink></div>
        <div className="footer__bottom">
          <div>{NAV_ITEMS.slice(0, 5).map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
          <p>2025 Upper Middle Road, Burlington, ON</p>
          <p>© {new Date().getFullYear()} Burgertone</p>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <Navigation />
      <main id="main">
        <Hero />
        <Assembly />
        <FlavourStory />
        <ProductStory />
        <FullMenu />
        <SidesAndShakes />
        <Story />
        <Location />
      </main>
      <Footer />
    </>
  )
}
