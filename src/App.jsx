import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { HOURS, HIGHLIGHTS, MENU, MODEL_MENU, NAV_ITEMS, ORDER_URL } from './data'

gsap.registerPlugin(ScrollTrigger)

function FoodImage({ src, ...props }) {
  const modernSrc = src.replace(/\.jpg$/i, '.webp')
  return <picture><source srcSet={modernSrc} type="image/webp" /><img src={src} {...props} /></picture>
}

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
}

function SpinIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4.7 8.2A8 8 0 0 1 19 7l1.5 2M19.3 15.8A8 8 0 0 1 5 17l-1.5-2M20.5 4.5V9H16M3.5 19.5V15H8" /></svg>
}

function OrderLink({ children = 'Order Online', className = '' }) {
  return <a className={`button button--primary ${className}`} href={ORDER_URL} target="_blank" rel="noopener noreferrer" data-order-link>{children}<ArrowIcon /></a>
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

const FILM_CLIPS = [
  { src: '/assets/restaurant_walkthrough-scrub.mp4', poster: '/assets/restaurant_exterior.webp', scroll: 3.2 },
  { src: '/assets/burger_transition-scrub.mp4', poster: '/assets/restaurant_interior.jpeg', scroll: 2.2 },
  { src: '/assets/classic_burger_showcase-scrub.mp4', poster: '/assets/classic.webp', scroll: 1.9 },
]

function fadeRange(progress, start, end, feather = .035) {
  return Math.max(0, Math.min(1, (progress - start) / feather, (end - progress) / feather))
}

function CinematicStory() {
  const ref = useRef(null)
  const videoRefs = useRef([])
  const captionRefs = useRef([])
  const progressRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const videos = [...videoRefs.current]
    const durations = FILM_CLIPS.map(() => 8)
    const loaded = new Set()
    const blobUrls = []
    const fetchControllers = []
    const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const totalScroll = FILM_CLIPS.reduce((total, clip) => total + clip.scroll, 0)
    let animationFrame = 0
    let renderQueued = false
    let scrollProgress = 0
    let activeIndex = -1
    let disposed = false
    let userReady = !coarse
    let initialMediaReady = document.readyState === 'complete'

    const primeVideo = (video) => {
      if (!coarse || !userReady || !video || video.readyState < 2) return
      const promise = video.play()
      if (promise?.then) promise.then(() => video.pause()).catch(() => {})
    }

    const clipOffset = (index) => durations.slice(0, index).reduce((total, duration) => total + duration, 0)
    const totalDuration = () => durations.reduce((total, duration) => total + duration, 0)

    const findClip = (globalTime) => {
      let elapsed = 0
      for (let index = 0; index < durations.length; index += 1) {
        if (globalTime < elapsed + durations[index] || index === durations.length - 1) {
          return { index, time: Math.min(durations[index] - .04, Math.max(0, globalTime - elapsed)) }
        }
        elapsed += durations[index]
      }
      return { index: durations.length - 1, time: durations.at(-1) - .04 }
    }

    const loadClip = async (index) => {
      if (index < 0 || index >= videos.length || loaded.has(index)) return
      loaded.add(index)
      videos[index].poster = FILM_CLIPS[index].poster
      const controller = new AbortController()
      fetchControllers.push(controller)

      try {
        const response = await fetch(FILM_CLIPS[index].src, { signal: controller.signal })
        if (!response.ok) throw new Error(`Video request failed: ${response.status}`)
        const blobUrl = URL.createObjectURL(await response.blob())
        if (disposed) {
          URL.revokeObjectURL(blobUrl)
          return
        }
        blobUrls.push(blobUrl)
        videos[index].src = blobUrl
        videos[index].load()
      } catch (error) {
        if (error.name === 'AbortError' || disposed) return
        videos[index].src = FILM_CLIPS[index].src
        videos[index].load()
      }
    }

    const mapScrollToTime = (progress) => {
      const position = progress * totalScroll
      let scrollOffset = 0
      for (let index = 0; index < FILM_CLIPS.length; index += 1) {
        const clip = FILM_CLIPS[index]
        if (position <= scrollOffset + clip.scroll || index === FILM_CLIPS.length - 1) {
          const local = Math.max(0, Math.min(1, (position - scrollOffset) / clip.scroll))
          return clipOffset(index) + local * durations[index]
        }
        scrollOffset += clip.scroll
      }
      return totalDuration()
    }

    const scheduleRender = () => {
      if (disposed || renderQueued) return
      renderQueued = true
      animationFrame = requestAnimationFrame(() => {
        renderQueued = false
        renderTarget()
      })
    }

    const renderInterface = (progress) => {
      const captionWindows = [[-.035, .285], [.35, .62], [.7, 1.035]]
      captionRefs.current.forEach((caption, index) => {
        if (!caption) return
        const opacity = fadeRange(progress, ...captionWindows[index])
        caption.style.opacity = opacity
        caption.style.transform = `translate3d(0, ${(1 - opacity) * 22}px, 0)`
        caption.style.pointerEvents = opacity > .75 ? 'auto' : 'none'
      })

      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`
    }

    const showActiveVideo = (state) => {
      const remaining = durations[state.index] - state.time
      const shouldCrossfade = remaining < .14 && state.index < videos.length - 1 && videos[state.index + 1].readyState >= 1
      const blend = shouldCrossfade ? 1 - (remaining / .14) : 0

      videos.forEach((video, index) => {
        let opacity = index === state.index ? 1 : 0
        if (shouldCrossfade && index === state.index) opacity = 1 - blend
        if (shouldCrossfade && index === state.index + 1) opacity = blend
        video.style.opacity = opacity
      })
    }

    const loadAround = (state, force = false) => {
      if (!force && !initialMediaReady && scrollProgress <= .002) return
      loadClip(state.index)
      if (state.time / durations[state.index] > .35) loadClip(state.index + 1)
    }

    const renderTarget = () => {
      if (disposed) return

      const targetGlobalTime = mapScrollToTime(scrollProgress)
      const state = findClip(targetGlobalTime)
      activeIndex = state.index
      loadAround(state)
      const activeVideo = videos[activeIndex]
      const epsilon = coarse ? .02 : .008

      if (activeVideo.readyState >= 1 && !activeVideo.seeking && Math.abs(activeVideo.currentTime - state.time) > epsilon) {
        try { activeVideo.currentTime = state.time } catch { /* A poster remains visible until seeking is available. */ }
      }

      const nextVideo = videos[activeIndex + 1]
      if (nextVideo && nextVideo.readyState >= 1 && durations[activeIndex] - state.time < .2 && !nextVideo.seeking && nextVideo.currentTime > .03) {
        try { nextVideo.currentTime = 0 } catch { /* The next frame will be primed on the following tick. */ }
      }

      showActiveVideo(state)
      renderInterface(scrollProgress)
    }

    const setScrollProgress = (progress, immediate = false) => {
      scrollProgress = Math.max(0, Math.min(1, progress))
      const targetState = findClip(mapScrollToTime(scrollProgress))
      loadAround(targetState)

      if (immediate) {
        if (renderQueued) cancelAnimationFrame(animationFrame)
        renderQueued = false
        renderTarget()
      } else {
        scheduleRender()
      }
    }

    const metadataHandlers = videos.map((video, index) => {
      const onMetadata = () => {
        durations[index] = Number.isFinite(video.duration) ? video.duration : 8
        scheduleRender()
      }
      video.addEventListener('loadedmetadata', onMetadata)
      if (video.readyState >= 1) onMetadata()
      return onMetadata
    })

    const dataHandlers = videos.map((video) => {
      const onData = () => {
        primeVideo(video)
        scheduleRender()
      }
      video.addEventListener('loadeddata', onData)
      return onData
    })

    // While the decoder is busy, retain only the newest requested frame. Once
    // that seek finishes, jump straight to the latest scroll position instead
    // of playing through stale intermediate targets.
    const seekHandlers = videos.map((video, index) => {
      const onSeeked = () => {
        if (index === activeIndex) scheduleRender()
      }
      video.addEventListener('seeked', onSeeked)
      return onSeeked
    })

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: () => `+=${window.innerHeight * totalScroll}`,
      pin: ref.current,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => setScrollProgress(progress),
      onLeave: () => setScrollProgress(1, true),
      onLeaveBack: () => setScrollProgress(0, true),
    })

    const onFirstGesture = () => {
      userReady = true
      videos.forEach(primeVideo)
    }
    window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true })
    window.addEventListener('touchstart', onFirstGesture, { once: true, passive: true })

    const onPageLoad = () => {
      initialMediaReady = true
      loadAround(findClip(mapScrollToTime(scrollProgress)), true)
      scheduleRender()
    }
    if (document.readyState === 'complete') onPageLoad()
    else window.addEventListener('load', onPageLoad, { once: true })

    videos.forEach((video, index) => { video.style.opacity = index === 0 ? 1 : 0 })
    renderInterface(0)
    setScrollProgress(trigger.progress, true)
    return () => {
      disposed = true
      cancelAnimationFrame(animationFrame)
      trigger.kill()
      fetchControllers.forEach((controller) => controller.abort())
      blobUrls.forEach((url) => URL.revokeObjectURL(url))
      window.removeEventListener('pointerdown', onFirstGesture)
      window.removeEventListener('touchstart', onFirstGesture)
      window.removeEventListener('load', onPageLoad)
      videos.forEach((video, index) => {
        video?.pause()
        video?.removeAttribute('src')
        video?.load()
        video?.removeEventListener('loadedmetadata', metadataHandlers[index])
        video?.removeEventListener('loadeddata', dataHandlers[index])
        video?.removeEventListener('seeked', seekHandlers[index])
      })
    }
  }, [])

  return (
    <section className="cinema" id="home" ref={ref} aria-labelledby="cinema-title">
      <div className="cinema__stage">
        <div className="cinema__media" aria-hidden="true">
          {FILM_CLIPS.map((clip, index) => (
            <video
              className="cinema__video"
              key={clip.src}
              ref={(element) => { videoRefs.current[index] = element }}
              poster={index === 0 ? clip.poster : undefined}
              preload="none"
              muted
              playsInline
              disablePictureInPicture
            />
          ))}
          <div className="cinema__shade" />
        </div>

        <div className="cinema__chrome" aria-hidden="true">
          <span>BURGERTONE / TORONTO</span>
          <span>MT PLEASANT — COMING SOON</span>
        </div>

        <div className="cinema__caption cinema__caption--arrival" ref={(element) => { captionRefs.current[0] = element }}>
          <p className="eyebrow">Burgers with a beat</p>
          <h1 id="cinema-title">Walk in<br /><em>hungry.</em></h1>
          <p>Fresh Angus, hand-cut fries and good music—open in Burlington and coming soon to Toronto.</p>
          <div className="cinema__actions"><OrderLink /><a className="button button--ghost" href="#menu">View menu</a></div>
        </div>

        <div className="cinema__caption cinema__caption--serve" ref={(element) => { captionRefs.current[1] = element }}>
          <p className="eyebrow">Made fresh / Served loud</p>
          <h2>Here comes<br /><em>the Classic.</em></h2>
        </div>

        <div className="cinema__caption cinema__caption--classic" ref={(element) => { captionRefs.current[2] = element }}>
          <p className="eyebrow">Track 01 / The Classic</p>
          <h2>One patty.<br /><em>Full volume.</em></h2>
          <p>Mouth-watering beef patty with toppings of your choice on a toasted brioche bun.</p>
          <div className="cinema__product-cta"><strong>$9.99</strong><OrderLink>Order the Classic</OrderLink></div>
        </div>

        <div className="cinema__timeline" aria-hidden="true">
          <span><i ref={progressRef} /></span>
          <div><b>01</b><small>Arrive</small></div>
          <div><b>02</b><small>Served</small></div>
          <div><b>03</b><small>The Classic</small></div>
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
              <p>{item.description}</p>
              <div><strong>{item.price}</strong><OrderLink>Get this track</OrderLink></div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

const MODEL_CATEGORIES = ['All', 'Burgers', 'Chicken & More', 'Sides', 'Drinks']

function InteractiveModel({ item }) {
  const shellRef = useRef(null)
  const viewerRef = useRef(null)
  const [viewerReady, setViewerReady] = useState(() => typeof window !== 'undefined' && Boolean(window.customElements?.get('model-viewer')))
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [progress, setProgress] = useState(0)
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (viewerReady) return
    let active = true
    const host = shellRef.current
    const loadViewer = () => {
      import('@google/model-viewer')
        .then(() => active && setViewerReady(true))
        .catch(() => active && setFailed(true))
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      loadViewer()
    }, { rootMargin: '900px 0px' })

    if (host) observer.observe(host)
    else loadViewer()
    return () => {
      active = false
      observer.disconnect()
    }
  }, [viewerReady])

  useEffect(() => {
    if (!viewerReady || !viewerRef.current) return

    const viewer = viewerRef.current
    const onProgress = (event) => setProgress(event.detail?.totalProgress || 0)
    const onLoad = () => {
      setProgress(1)
      setLoaded(true)
    }
    const onError = () => setFailed(true)
    viewer.addEventListener('progress', onProgress)
    viewer.addEventListener('load', onLoad)
    viewer.addEventListener('error', onError)
    if (viewer.loaded) onLoad()
    return () => {
      viewer.removeEventListener('progress', onProgress)
      viewer.removeEventListener('load', onLoad)
      viewer.removeEventListener('error', onError)
    }
  }, [viewerReady])

  const resetView = () => {
    const viewer = viewerRef.current
    if (!viewer) return
    viewer.cameraOrbit = '25deg 70deg auto'
    viewer.fieldOfView = '28deg'
    viewer.jumpCameraToGoal?.()
  }

  return (
    <div className="model-stage" id="interactive-model" ref={shellRef}>
      <div className="model-stage__rings" aria-hidden="true" />
      <img className={`model-stage__poster ${loaded ? 'is-hidden' : ''}`} src={item.poster} alt="" />
      {viewerReady && !failed && (
        <model-viewer
          key={item.id}
          ref={viewerRef}
          class={loaded ? 'is-loaded' : ''}
          src={item.model}
          poster={item.poster}
          alt={`Interactive 3D model of Burgertone’s ${item.name}`}
          loading="eager"
          reveal="auto"
          camera-controls
          touch-action="pan-y"
          disable-pan
          environment-image="neutral"
          tone-mapping="aces"
          shadow-intensity="1.4"
          shadow-softness="0.9"
          exposure="1.05"
          camera-orbit="25deg 70deg auto"
          min-camera-orbit="auto 25deg auto"
          max-camera-orbit="auto 105deg auto"
          field-of-view="28deg"
          min-field-of-view="18deg"
          max-field-of-view="42deg"
          interaction-prompt="none"
          auto-rotate={!reduceMotion}
          auto-rotate-delay="1400"
          rotation-per-second="12deg"
          tabIndex="0"
        />
      )}

      {!loaded && !failed && (
        <div className="model-stage__loader" role="status" aria-live="polite">
          <span><i style={{ transform: `scaleX(${progress})` }} /></span>
          <small>{viewerReady ? `Loading model · ${Math.round(progress * 100)}%` : 'Preparing 3D player'}</small>
        </div>
      )}
      {failed && <p className="model-stage__error" role="alert">The 3D model could not load. The product photo remains available.</p>}
      <div className="model-stage__hint"><SpinIcon /><span>Drag to spin</span></div>
      <button className="model-stage__reset" type="button" onClick={resetView} disabled={!loaded}>Reset view</button>
    </div>
  )
}

function MenuArchive() {
  return (
    <section className="menu-archive" id="menu" aria-labelledby="full-menu-title">
      <header className="menu-archive__head">
        <div><p className="eyebrow">Every track / No hidden details</p><h3 id="full-menu-title">The full setlist.</h3></div>
        <p>Everything stays readable here—no animation required. Order online for current customization and availability.</p>
      </header>
      <div className="menu-archive__groups">
        {MENU.map((group) => (
          <article className="menu-archive__group" key={group.category}>
            <header><span>{group.number}</span><h4>{group.category}</h4></header>
            <div>
              {group.items.map((entry) => (
                <div className="menu-archive__item" key={entry.name}>
                  <div><h5>{entry.name}</h5>{entry.description && <p>{entry.description}</p>}</div>
                  <strong>{entry.price}</strong>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div className="menu-archive__cta"><p>Ready to build your order?</p><OrderLink>Customize & order</OrderLink></div>
    </section>
  )
}

function MenuExperience() {
  const [category, setCategory] = useState('All')
  const [selectedId, setSelectedId] = useState(MODEL_MENU[0].id)
  const selected = MODEL_MENU.find((item) => item.id === selectedId) || MODEL_MENU[0]
  const visibleItems = category === 'All' ? MODEL_MENU : MODEL_MENU.filter((item) => item.category === category)
  const activeTrack = visibleItems.findIndex((item) => item.id === selected.id)
  const familyMeal = MENU[0].items[0]

  const chooseCategory = (nextCategory) => {
    setCategory(nextCategory)
    const nextItems = nextCategory === 'All' ? MODEL_MENU : MODEL_MENU.filter((item) => item.category === nextCategory)
    if (!nextItems.some((item) => item.id === selectedId)) setSelectedId(nextItems[0].id)
  }

  const moveTrack = (direction) => {
    const nextIndex = (activeTrack + direction + visibleItems.length) % visibleItems.length
    setSelectedId(visibleItems[nextIndex].id)
  }

  return (
    <section className="menu-experience" id="tracks" aria-labelledby="tracks-title">
      <div className="container">
        <header className="menu-experience__head">
          <div>
            <p className="eyebrow">Interactive menu / 14 playable tracks</p>
            <h2 id="tracks-title">Choose a track.<br /><em>Spin the plate.</em></h2>
          </div>
          <div className="menu-experience__intro">
            <p>Each 3D model represents a real item from Burgertone’s current menu. Pick a dish, then drag it around to inspect it from every angle.</p>
            <span><SpinIcon /> Drag horizontally · scroll normally</span>
          </div>
        </header>

        <div className="menu-tabs" aria-label="Filter interactive menu models">
          {MODEL_CATEGORIES.map((label) => (
            <button key={label} type="button" className={category === label ? 'is-active' : ''} aria-pressed={category === label} onClick={() => chooseCategory(label)}>{label}</button>
          ))}
        </div>

        <div className="menu-console">
          <InteractiveModel key={selected.id} item={selected} />
          <div className="menu-console__info" aria-live="polite">
            <span className="menu-console__track">Track {String(MODEL_MENU.indexOf(selected) + 1).padStart(2, '0')} / {selected.category}</span>
            <h3>{selected.name}</h3>
            <p>{selected.description}</p>
            <div className="menu-console__buy"><strong>{selected.price}</strong><OrderLink>Order this track</OrderLink></div>
            <div className="menu-console__nav">
              <button type="button" onClick={() => moveTrack(-1)} aria-label="Previous menu model">← Previous</button>
              <span>{activeTrack + 1} / {visibleItems.length}</span>
              <button type="button" onClick={() => moveTrack(1)} aria-label="Next menu model">Next →</button>
            </div>
          </div>
        </div>

        <div className="model-tracks" aria-label="Interactive product selection">
          {visibleItems.map((item) => (
            <button key={item.id} type="button" className={selected.id === item.id ? 'is-active' : ''} aria-pressed={selected.id === item.id} aria-controls="interactive-model" onClick={() => setSelectedId(item.id)}>
              <span>{String(MODEL_MENU.indexOf(item) + 1).padStart(2, '0')}</span>
              <span><strong>{item.name}</strong><small>{item.category}</small></span>
              <b>{item.price}</b>
            </button>
          ))}
        </div>

        <article className="family-feature">
          <div className="family-feature__image"><img src="/assets/family-meal-reference.jpg" alt="Burgertone Family Meal with two burgers, Philly cheesesteak, chicken tenders, fries and canned pop" loading="lazy" width="4032" height="3024" /></div>
          <div className="family-feature__copy">
            <p className="eyebrow">The group track</p>
            <h3>Feed the<br /><em>whole band.</em></h3>
            <p>{familyMeal.description}</p>
            <div><strong>{familyMeal.price}</strong><OrderLink>Order the Family Meal</OrderLink></div>
          </div>
        </article>

        <MenuArchive />
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
          <p className="eyebrow">Track 03 / Our story</p>
          <h2 id="story-title">Good food.<br /><em>Good music.</em></h2>
          <p>Burgertone was born out of a love for both good food and good music. Years of passion and love of food came together in hamburgers, smash burgers, cheesesteaks, hot dogs and refreshing shakes—all served with the grooviest of tunes.</p>
          <p>Our fries are freshly hand-cut, our beef is halal and ground every day, and our in-house, one-of-a-kind ToneSauce ties it all together.</p>
          <a className="text-link" href="#location">Come orchestrate your burger <ArrowIcon /></a>
        </div>
        <div className="brand-story__visual">
          <figure className="brand-story__interior"><img src="/assets/restaurant_interior.jpeg" alt="Approved Burgertone restaurant interior concept" loading="lazy" width="1920" height="1080" /></figure>
          <figure className="brand-story__counter"><img src="/assets/restaurant_counter.jpeg" alt="Approved Burgertone service counter concept" loading="lazy" width="1920" height="1080" /></figure>
          <span>Original location<br />Burlington</span>
        </div>
      </div>
    </section>
  )
}

function Location() {
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
            <p className="visit-card__note">The new Mt Pleasant location featured in our cinematic walkthrough.</p>
            <address>505 Mt Pleasant Rd<br />Toronto, ON M4S 2L9</address>
            <div className="visit-card__details">
              <div><span>Phone</span><strong>To be announced</strong></div>
              <div><span>Planned hours</span><strong>Same hours as Burlington</strong></div>
            </div>
            <a className="button button--primary" href="https://maps.google.com/?q=505+Mt+Pleasant+Rd+Toronto+ON+M4S+2L9" target="_blank" rel="noopener noreferrer">View Toronto location <ArrowIcon /></a>
          </article>

          <article className="visit-card visit-card--open">
            <header><span>02 / Burlington</span><b>Open now</b></header>
            <h3>Burlington</h3>
            <address>2025 Upper Middle Road<br />Burlington, ON L7P 4K1</address>
            <div className="visit-card__hours">
              <h4>Hours</h4>
              <dl>{HOURS.map(([day, time]) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}</dl>
            </div>
            <div className="visit-card__actions"><a className="button button--ghost" href="https://maps.google.com/?q=2025+Upper+Middle+Road+Burlington+ON+L7P+4K1" target="_blank" rel="noopener noreferrer">Directions <ArrowIcon /></a><OrderLink>Order Burlington pickup</OrderLink></div>
          </article>
        </div>
        <div className="visit__contact-bar">
          <div><span>Burlington phone</span><a href="tel:+12893138225">(289) 313-8225</a></div>
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
          <div>{NAV_ITEMS.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</div>
          <p>Burlington open · Toronto coming soon</p>
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
        <CinematicStory />
        <ProductStory />
        <MenuExperience />
        <Story />
        <Location />
      </main>
      <Footer />
    </>
  )
}
