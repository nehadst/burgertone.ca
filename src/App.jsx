import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HERO_LOOP, HOURS, HIGHLIGHTS, MENUS, NAV_ITEMS, OFFER, ORDER_URLS, REVIEW_URLS, STORY_TRACKS } from './data'

gsap.registerPlugin(ScrollTrigger)

function FoodImage({ src, ...props }) {
  const modernSrc = src.replace(/\.jpg$/i, '.webp')
  return <picture><source srcSet={modernSrc} type="image/webp" /><img src={src} {...props} /></picture>
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
}

function LoopIcon({ paused }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24">{paused ? <path d="M8 5.5v13l10-6.5z" /> : <path d="M8.5 5v14M15.5 5v14" />}</svg>
}

function CloseIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" /></svg>
}

const openOrderPicker = () => document.getElementById('order-picker')?.showModal()

// With a location it links straight to that location's ordering site; without one it asks which location first.
function OrderLink({ children = 'Order Online', className = '', location }) {
  if (location) return <a className={`button button--primary ${className}`} href={ORDER_URLS[location]} target="_blank" rel="noopener noreferrer" data-order-link>{children}<ArrowIcon /></a>
  return <button className={`button button--primary ${className}`} type="button" aria-haspopup="dialog" onClick={openOrderPicker}>{children}<ArrowIcon /></button>
}

function OrderPicker() {
  const ref = useRef(null)
  const close = () => ref.current?.close()
  const options = [['burlington', 'Burlington', '2025 Upper Middle Road'], ['toronto', 'Toronto', '505 Mt Pleasant Rd']]

  return (
    <dialog className="order-picker" id="order-picker" ref={ref} aria-labelledby="order-picker-title" onClick={(event) => event.target === ref.current && close()}>
      <div className="order-picker__panel">
        <p className="eyebrow">Order online</p>
        <h2 id="order-picker-title">Pick your<br /><em>Burgertone.</em></h2>
        <button className="order-picker__close" type="button" aria-label="Close" onClick={close}><CloseIcon /></button>
        {options.map(([id, name, address]) => (
          <a className="order-picker__option" key={id} href={ORDER_URLS[id]} target="_blank" rel="noopener noreferrer" data-order-link onClick={close}>
            <span>{name}</span><small>{address}</small><ArrowIcon />
          </a>
        ))}
      </div>
    </dialog>
  )
}

function BrandMark({ light = false }) {
  return <a className={`brand ${light ? 'brand--light' : ''}`} href="/" aria-label="Burgertone home"><img src="/assets/burgertone-logo.png" alt="Burgertone" width="500" height="73" /></a>
}

function Navigation({ page }) {
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
    <header className={`nav-shell ${scrolled || page !== 'home' ? 'is-scrolled' : ''}`}>
      <OfferBar />
      <nav className="nav" aria-label="Main navigation">
        <BrandMark />
        <div className={`nav__links ${open ? 'is-open' : ''}`} id="mobile-menu">
          {NAV_ITEMS.map(([label, href, id]) => <a key={href} href={href} aria-current={id === page ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</a>)}
          <OrderLink className="nav__order" />
        </div>
        <button className="nav__toggle" type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
          <span /><span />
        </button>
      </nav>
    </header>
  )
}

// Browser-only values read through useSyncExternalStore: the pre-rendered HTML uses the server value and the
// page switches to the real one right after hydrating, without a hydration mismatch.
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const subscribeReducedMotion = (onChange) => {
  const query = window.matchMedia(REDUCED_MOTION)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
const usePrefersReducedMotion = () => useSyncExternalStore(subscribeReducedMotion, () => window.matchMedia(REDUCED_MOTION).matches, () => false)

function Entrance() {
  const ref = useRef(null)
  const videoRef = useRef(null)
  const reduceMotion = usePrefersReducedMotion()
  // null until the video reports play/pause; until then it is paused only for reduced-motion visitors.
  const [playState, setPlayState] = useState(null)
  const paused = playState === null ? reduceMotion : playState === 'paused'

  // The pre-rendered HTML autoplays; stop it for visitors who asked for less motion.
  useEffect(() => { if (reduceMotion) videoRef.current?.pause() }, [reduceMotion])

  useLayoutEffect(() => {
    if (reduceMotion || window.matchMedia(REDUCED_MOTION).matches) return
    const root = document.documentElement
    const interactions = ['wheel', 'touchstart', 'keydown', 'pointerdown']
    let intro

    // Any input during the title card fast-forwards it instead of blocking the visitor.
    const hurry = () => intro?.progress() < 1 && intro.timeScale(6)

    const ctx = gsap.context(() => {
      root.classList.add('is-intro')
      intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .set('.entrance__card', { autoAlpha: 1 })
        .from('.entrance__card .eyebrow', { autoAlpha: 0, y: 14, duration: .7 }, .2)
        .from('.entrance__card-line > span', { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: .24 }, .35)
        .to('.entrance__card', { autoAlpha: 0, scale: 1.05, filter: 'blur(12px)', duration: .8, ease: 'power2.in' }, 2.2)
        .from('.entrance__frame', { autoAlpha: 0, scale: 1.1, duration: 2, ease: 'power2.out' }, 2.55)
        .call(() => root.classList.remove('is-intro'), null, 3.2)
        .from('.entrance__reveal', { autoAlpha: 0, y: 36, duration: 1, stagger: .09 }, 3.2)

      gsap.timeline({ scrollTrigger: { trigger: ref.current, start: 'top top', end: '+=80%', pin: true, scrub: .6, anticipatePin: 1 } })
        .to('.entrance__copy', { autoAlpha: 0, y: -80, duration: .55, ease: 'none' }, 0)
        .to('.entrance__media', { autoAlpha: 0, scale: .84, duration: 1, ease: 'power1.in' }, 0)
    }, ref)

    if (window.scrollY > 10 || (window.location.hash && window.location.hash !== '#home')) {
      intro.progress(1)
      root.classList.remove('is-intro')
    } else {
      interactions.forEach((type) => window.addEventListener(type, hurry, { passive: true }))
    }

    return () => {
      interactions.forEach((type) => window.removeEventListener(type, hurry))
      root.classList.remove('is-intro')
      ctx.revert()
    }
  }, [reduceMotion])

  const toggleLoop = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  }

  return (
    <section className={`entrance ${HERO_LOOP.mobileVideo ? 'has-portrait' : ''}`} id="home" ref={ref} aria-labelledby="entrance-title">
      <div className="entrance__media" aria-hidden="true">
        <div className="entrance__frame">
          <div className="entrance__picture">
            {HERO_LOOP.video ? (
              <video
                ref={videoRef}
                className="entrance__video"
                poster={HERO_LOOP.poster}
                autoPlay={!reduceMotion}
                muted
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                onPlay={() => setPlayState('playing')}
                onPause={() => setPlayState('paused')}
              >
                {HERO_LOOP.mobileVideo && <source src={HERO_LOOP.mobileVideo} type="video/mp4" media="(max-aspect-ratio: 4/5)" />}
                <source src={HERO_LOOP.video} type="video/mp4" />
              </video>
            ) : (
              <img className="entrance__video" src={HERO_LOOP.poster} alt="" width="1600" height="900" fetchPriority="high" />
            )}
          </div>
        </div>
      </div>
      <div className="entrance__shade" />

      <div className="entrance__card" aria-hidden="true">
        <p className="eyebrow">Burgertone presents</p>
        <p className="entrance__card-line"><span>Real beef.</span></p>
        <p className="entrance__card-line"><span><em>Real burgers.</em></span></p>
      </div>

      <div className="entrance__copy">
        <div className="entrance__chrome entrance__reveal">
          <span>Burlington · Open now</span>
          <span>Toronto · Coming soon</span>
          {HERO_LOOP.video && (
            <button type="button" onClick={toggleLoop} aria-label={paused ? 'Play background video' : 'Pause background video'}>
              <LoopIcon paused={paused} />{paused ? 'Play' : 'Pause'}
            </button>
          )}
        </div>
        <div className="entrance__bottom">
          <div>
            <p className="eyebrow entrance__reveal">Burgers with a beat</p>
            <h1 id="entrance-title" className="entrance__reveal">Turn up<br /><em>the flavour.</em></h1>
          </div>
          <div className="entrance__aside entrance__reveal">
            <p>Fresh Angus, hand-cut fries and good music—open in Burlington and coming soon to Toronto.</p>
            <div className="entrance__actions"><OrderLink /><a className="button button--ghost" href="/menu">View menu</a></div>
          </div>
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
    <section className="products" id="burgers" ref={ref} aria-labelledby="highlights-title">
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
              <div><OrderLink>Get this track</OrderLink></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Menu() {
  const [active, setActive] = useState(MENUS[0].id)
  const menu = MENUS.find((entry) => entry.id === active)

  return (
    <section className="menu-experience" id="menu" aria-labelledby="full-menu-title">
      <div className="container">
        <div className="menu-archive">
          <header className="menu-archive__head">
            <div><p className="eyebrow">Every track / No hidden details</p><h1 id="full-menu-title">The full setlist.</h1></div>
            <p>Each location has its own menu. Prices, customization and availability are on that location's online ordering.</p>
          </header>
          <div className="menu-archive__switch" role="group" aria-label="Choose a location">
            {MENUS.map(({ id, location }) => <button key={id} type="button" aria-pressed={id === active} aria-controls={`menu-${id}`} onClick={() => setActive(id)}>{location}</button>)}
          </div>
          {/* Both menus are in the page (and in the pre-rendered HTML for search engines); only the chosen one shows. */}
          {MENUS.map(({ id, location, groups }) => (
            <div className="menu-archive__groups" id={`menu-${id}`} key={id} hidden={id !== active} aria-label={`${location} menu`}>
              {groups.map((group) => (
                <article className="menu-archive__group" key={group.category}>
                  <header><span>{group.number}</span><h3>{group.category}</h3></header>
                  <div>
                    {group.items.map((entry) => (
                      <div className="menu-archive__item" key={entry.name}><h4>{entry.name}</h4>{entry.description && <p>{entry.description}</p>}</div>
                    ))}
                  </div>
                  {group.notes?.map((note) => <p className="menu-archive__note" key={note}>{note}</p>)}
                </article>
              ))}
            </div>
          ))}
          <div className="menu-archive__cta"><p>Ready to order from {menu.location}?</p><OrderLink location={menu.id}>Order from {menu.location}</OrderLink></div>
        </div>
      </div>
    </section>
  )
}

function Story() {
  return (
    <section className="brand-story" id="story" aria-labelledby="story-title">
      <div className="brand-story__ticker" aria-hidden="true"><span>GOOD FOOD · GOOD MUSIC · FRESHLY HAND-CUT FRIES · BEEF GROUND EVERY DAY · </span><span>GOOD FOOD · GOOD MUSIC · FRESHLY HAND-CUT FRIES · BEEF GROUND EVERY DAY · </span></div>
      <div className="container brand-story__grid">
        <div className="brand-story__copy">
          <p className="eyebrow">Liner notes / Our story</p>
          <h1 id="story-title">Good food.<br /><em>Good music.</em></h1>
          <p>Burgertone was born out of a love for both good food and good music. Years of passion and love of food came together in hamburgers, smash burgers, cheesesteaks, hot dogs and refreshing shakes—all served with the grooviest of tunes.</p>
          <p>Our fries are freshly hand-cut, our beef is halal and ground every day, and our in-house, one-of-a-kind ToneSauce ties it all together.</p>
          <a className="text-link" href="/#location">Come orchestrate your burger <ArrowIcon /></a>
        </div>
        <div className="sleeve">
          <div className="sleeve__record" aria-hidden="true">
            <div className="sleeve__vinyl"><div className="sleeve__label"><b>Burgertone</b><small>Side A · 33⅓</small></div></div>
            <span className="sleeve__sheen" />
          </div>
          <div className="sleeve__cover">
            <header><span>Burgertone</span><span>Side A</span></header>
            <h3>House<br />rules.</h3>
            <ol className="sleeve__tracks">
              {STORY_TRACKS.map(([title, note], index) => (
                <li key={title}><b>{String(index + 1).padStart(2, '0')}</b><strong>{title}</strong><small>{note}</small></li>
              ))}
            </ol>
            <footer><span>Burlington · Open now</span><span>Toronto · Coming soon</span></footer>
          </div>
        </div>
      </div>
    </section>
  )
}

function Location() {
  const grandOpening = useOfferLive()

  return (
    <section className="visit" id="location" aria-labelledby="location-title">
      <div className="visit__backdrop">
        <picture>
          <source srcSet="/assets/restaurant_exterior.webp" type="image/webp" />
          <img src="/assets/restaurant_exterior.png" alt="Approved Burgertone storefront concept" loading="lazy" width="946" height="1034" />
        </picture>
        <div />
      </div>
      <div className="container visit__content">
        <header className="visit__head">
          <p className="eyebrow">Two locations / One frequency</p>
          <h2 id="location-title">Find your<br /><em>Burgertone.</em></h2>
        </header>
        <div className="visit__locations">
          <article className="visit-card visit-card--featured">
            <header><span>01 / Featured location</span><b>Coming soon</b></header>
            <h3>Toronto</h3>
            <p className="visit-card__note">Our second location, opening soon on Mt Pleasant Road.</p>
            <address>505 Mt Pleasant Rd<br />Toronto, ON M4S 2L9</address>
            <div className="visit-card__details">
              <div><span>Phone</span><strong><a href="tel:+14164856608">(416) 485-6608</a></strong></div>
            </div>
            <div className="visit-card__hours">
              <h4>Hours</h4>
              <dl>{HOURS.toronto.map(([day, time]) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}</dl>
              {grandOpening && <p className="visit-card__special">Grand opening Fri, Oct 30: 4 PM – 10 PM</p>}
            </div>
            <div className="visit-card__actions"><a className="button button--ghost" href="https://maps.google.com/?q=505+Mt+Pleasant+Rd+Toronto+ON+M4S+2L9" target="_blank" rel="noopener noreferrer">View Toronto location <ArrowIcon /></a><OrderLink location="toronto">Order Toronto pickup</OrderLink></div>
          </article>

          <article className="visit-card visit-card--open">
            <header><span>02 / Burlington</span><b>Open now</b></header>
            <h3>Burlington</h3>
            <p className="visit-card__note">Our original location on Upper Middle Road.</p>
            <address>2025 Upper Middle Road<br />Burlington, ON L7P 4K1</address>
            <div className="visit-card__details">
              <div><span>Phone</span><strong><a href="tel:+12893138225">(289) 313-8225</a></strong></div>
            </div>
            <div className="visit-card__hours">
              <h4>Hours</h4>
              <dl>{HOURS.burlington.map(([day, time]) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}</dl>
            </div>
            <div className="visit-card__actions"><a className="button button--ghost" href="https://maps.google.com/?q=2025+Upper+Middle+Road+Burlington+ON+L7P+4K1" target="_blank" rel="noopener noreferrer">Directions <ArrowIcon /></a><OrderLink location="burlington">Order Burlington pickup</OrderLink></div>
          </article>
        </div>
        <div className="visit__contact-bar">
          <div><span>Burlington phone</span><a href="tel:+12893138225">(289) 313-8225</a></div>
          <div><span>Toronto phone</span><a href="tel:+14164856608">(416) 485-6608</a></div>
          <div><span>Email</span><a href="mailto:info@burgertone.com">info@burgertone.com</a></div>
          <div><a href="https://www.instagram.com/burgertone.ca/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.facebook.com/burgertone.ca/" target="_blank" rel="noopener noreferrer">Facebook ↗</a></div>
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
          <div>{NAV_ITEMS.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div>
          <p>Burlington open · Toronto coming soon</p>
          <p suppressHydrationWarning>© {new Date().getFullYear()} Burgertone</p>
        </div>
      </div>
    </footer>
  )
}

function NotFound() {
  return (
    <section className="feedback" aria-labelledby="not-found-title">
      <div className="container">
        <header className="feedback__head">
          <p className="eyebrow">404 / Track not found</p>
          <h1 id="not-found-title">Wrong<br /><em>track.</em></h1>
          <p>That page isn't on the setlist anymore. Head back home or check out the menu.</p>
        </header>
        <div className="entrance__actions"><a className="button button--primary" href="/">Back to home <ArrowIcon /></a><a className="button button--ghost" href="/menu">View menu</a></div>
      </div>
    </section>
  )
}

function Feedback() {
  const cards = [
    { id: 'toronto', number: '01', name: 'Toronto', address: ['505 Mt Pleasant Rd', 'Toronto, ON M4S 2L9'], tone: 'featured' },
    { id: 'burlington', number: '02', name: 'Burlington', address: ['2025 Upper Middle Road', 'Burlington, ON L7P 4K1'], tone: 'open' },
  ]

  return (
    <section className="feedback" aria-labelledby="feedback-title">
      <div className="container">
        <header className="feedback__head">
          <p className="eyebrow">Feedback / Leave a review</p>
          <h1 id="feedback-title">How did<br /><em>we sound?</em></h1>
          <p>Your feedback keeps the music right. Pick the location you visited and leave us a Google review.</p>
        </header>
        <div className="visit__locations">
          {cards.map(({ id, number, name, address, tone }) => (
            <article className={`visit-card visit-card--${tone}`} key={id}>
              <header><span>{number} / {name}</span></header>
              <h2>{name}</h2>
              <address>{address[0]}<br />{address[1]}</address>
              <a className="button button--primary" href={REVIEW_URLS[id]} target="_blank" rel="noopener noreferrer">Review {name} on Google <ArrowIcon /></a>
            </article>
          ))}
        </div>
        <p className="feedback__private">Something we should know privately? Email <a href="mailto:info@burgertone.com">info@burgertone.com</a></p>
      </div>
    </section>
  )
}

// The grand-opening offer (announcement bar + poster popup) only renders in the browser, until the event ends.
const subscribeNever = () => () => {}
const useOfferLive = () => useSyncExternalStore(subscribeNever, () => Date.now() < Date.parse(OFFER.endsAt), () => false)

const openOffer = () => document.getElementById('offer-dialog')?.showModal()

function OfferBar() {
  if (!useOfferLive()) return null
  return (
    <button className="offer-bar" type="button" aria-haspopup="dialog" onClick={openOffer}>
      <b>Free beef cheeseburgers</b><span className="offer-bar__detail">Toronto grand opening</span><span>Fri Oct 30<span className="offer-bar__detail"> · 4–10 PM</span></span><em>View offer <ArrowIcon /></em>
    </button>
  )
}

function Offer() {
  const ref = useRef(null)
  const live = useOfferLive()
  if (!live) return null
  const close = () => ref.current?.close()

  return (
    <>
      <dialog className="offer-dialog" id="offer-dialog" ref={ref} aria-label="Toronto grand opening offer" onClick={(event) => event.target === ref.current && close()}>
        <button className="offer-dialog__close" type="button" aria-label="Close" onClick={close}><CloseIcon /></button>
        <img src={OFFER.image} alt={OFFER.alt} width={OFFER.width} height={OFFER.height} />
        <div className="offer-dialog__bar">
          <p>Follow <strong>@burgertone.ca</strong> on Instagram to get a free beef cheeseburger at our Toronto grand opening.</p>
          <div>
            <a className="button button--primary" href="https://www.instagram.com/burgertone.ca/" target="_blank" rel="noopener noreferrer">Follow on Instagram <ArrowIcon /></a>
            <a className="button button--ghost" href="https://maps.google.com/?q=505+Mt+Pleasant+Rd+Toronto+ON+M4S+2L9" target="_blank" rel="noopener noreferrer">Directions <ArrowIcon /></a>
          </div>
        </div>
      </dialog>
    </>
  )
}

export default function App({ page = 'home' }) {
  useEffect(() => {
    // Pinned sections change the page height once measured, so re-jump to a #section link (e.g. /#location
    // from another page) after ScrollTrigger has settled.
    const onLoad = () => requestAnimationFrame(() => requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' })
    }))
    if (document.readyState === 'complete') onLoad()
    else window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <Navigation page={page} />
      <main id="main" className={page === 'home' ? undefined : 'main--page'}>
        {page === 'home' && <><Entrance /><ProductStory /><Location /></>}
        {page === 'menu' && <Menu />}
        {page === 'about' && <Story />}
        {page === 'feedback' && <Feedback />}
        {page === 'notFound' && <NotFound />}
      </main>
      <Footer />
      <OrderPicker />
      <Offer />
    </>
  )
}
