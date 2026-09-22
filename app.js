const sections = [...document.querySelectorAll('.day')]
const links = [...document.querySelectorAll('.day-nav a')]

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const current = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!current) return
      links.forEach((link) => link.classList.toggle('is-active', link.hash === `#${current.target.id}`))
    },
    { rootMargin: '-20% 0px -65%', threshold: [0, 0.25, 0.5] },
  )
  sections.forEach((section) => observer.observe(section))
}

const routeMapElement = document.querySelector('#route-map')

if (routeMapElement && window.L) {
  const stops = {
    hangzhou: { name: '杭州', point: [30.2741, 120.1551] },
    hotel: { name: '霞浦县城酒店', point: [26.88168, 120.018927] },
    beiqi: { name: '北岐滩涂', point: [26.877711, 120.064868] },
    xiaohao: { name: '小皓海滩', point: [26.928016, 120.146599] },
    dongbi: { name: '东壁村', point: [26.921002, 120.190122] },
    station: { name: '霞浦站', point: [26.9127474, 120.0282365] },
    xinmeiwei: { name: '新美味园（县城）', point: [26.8842, 120.0218] },
    yangjiaxi: { name: '杨家溪', point: [27.039476, 120.145443] },
    sansha: { name: '三沙古镇码头', point: [26.92615, 120.242485] },
    yushan: { name: '大嵛山岛', point: [26.9475673, 120.3447143] },
    banyueli: { name: '半月里畲族村', point: [26.750619, 119.890127] },
    gaoluo: { name: '高罗海滩', point: [26.751283, 120.09809] },
  }

  const routes = {
    1: { label: 'D1 · 杭州抵达霞浦', copy: '杭州 → 县城酒店 → 北岐（可选）→ 酒店。', color: '#e86e4d', stops: ['hangzhou', 'hotel', 'beiqi', 'hotel'] },
    2: { label: 'D2 · 北线滩涂与东壁', copy: '酒店 → 北岐 → 县城早餐 → 小皓 → 东壁 → 酒店。', color: '#c98d25', stops: ['hotel', 'beiqi', 'hotel', 'xiaohao', 'dongbi', 'hotel'] },
    3: { label: 'D3 · B 组接站与杨家溪', copy: '酒店 → 霞浦站 → 新美味园 → 杨家溪 → 酒店。', color: '#2f8d83', stops: ['hotel', 'station', 'xinmeiwei', 'yangjiaxi', 'hotel'] },
    4: { label: 'D4 · 三沙乘船去嵛山岛', copy: '酒店 → 三沙码头 → 大嵛山岛 → 三沙码头 → 酒店。海上连线为船程示意。', color: '#3977a6', stops: ['hotel', 'sansha', 'yushan', 'sansha', 'hotel'], dashed: true },
    5: { label: 'D5 · 半月里与高罗', copy: '酒店 → 半月里 → 高罗海滩 → 酒店。', color: '#8d6aad', stops: ['hotel', 'banyueli', 'gaoluo', 'hotel'] },
    home: { label: '10/4 · 一早返程', copy: '酒店退房后离开霞浦，返程途中每 2 小时休息。', color: '#4f73a1', stops: ['hotel', 'hangzhou'] },
  }

  const map = L.map(routeMapElement, { zoomControl: false, scrollWheelZoom: false })
  L.control.zoom({ position: 'topright' }).addTo(map)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)

  const routeLayer = L.layerGroup().addTo(map)
  const labelElement = document.querySelector('#route-map-label')
  const copyElement = document.querySelector('#route-map-copy')
  const routeLink = document.querySelector('#route-map-link')
  const routeTabs = [...document.querySelectorAll('.route-map-tab')]

  const addRoute = (dayKey, showStopNumbers, aggregateMarkerSet) => {
    const route = routes[dayKey]
    const routeStops = route.stops.map((key) => stops[key])
    L.polyline(routeStops.map((stop) => stop.point), {
      color: route.color,
      weight: 4,
      opacity: 0.84,
      dashArray: route.dashed ? '9 7' : null,
      lineJoin: 'round',
    }).addTo(routeLayer)

    const groupedStops = new Map()
    routeStops.forEach((stop, index) => {
      const markerKey = stop.point.join(',')
      if (!groupedStops.has(markerKey)) groupedStops.set(markerKey, { stop, indexes: [] })
      groupedStops.get(markerKey).indexes.push(index + 1)
    })

    groupedStops.forEach(({ stop, indexes }, markerKey) => {
      if (aggregateMarkerSet.has(markerKey)) return
      aggregateMarkerSet.add(markerKey)
      const markerLabel = showStopNumbers ? indexes.join('/') : '•'
      const icon = L.divIcon({
        className: '',
        html: `<span class="route-marker ${markerLabel.length > 3 ? 'route-marker--wide' : ''}" style="--marker-color:${route.color}">${markerLabel}</span>`,
        iconSize: markerLabel.length > 3 ? [42, 28] : [28, 28],
        iconAnchor: markerLabel.length > 3 ? [21, 14] : [14, 14],
      })
      const stopLabel = indexes.length > 1 ? `第 ${indexes.join('、')} 站` : `第 ${indexes[0]} 站`
      L.marker(stop.point, { icon }).bindPopup(`<strong>${stop.name}</strong><br>${dayKey === 'home' ? '返程' : `D${dayKey}`} · ${stopLabel}`).addTo(routeLayer)
    })

    return routeStops.map((stop) => stop.point)
  }

  const renderRoute = (routeKey) => {
    routeLayer.clearLayers()
    let bounds = []
    const markerSet = new Set()
    if (routeKey === 'xiapu') {
      ;['1', '2', '3', '4', '5'].forEach((dayKey) => { bounds = bounds.concat(addRoute(dayKey, false, markerSet)) })
      labelElement.textContent = '霞浦段 · D1—D5'
      copyElement.textContent = '以县城为驻点，串联北线滩涂、杨家溪、嵛山岛与南线畲乡。'
      routeLink.href = '#day-1'
      routeLink.textContent = '从 D1 开始看'
    } else {
      bounds = addRoute(routeKey, true, markerSet)
      const route = routes[routeKey]
      labelElement.textContent = route.label
      copyElement.textContent = route.copy
      routeLink.href = routeKey === 'home' ? '#return-day' : `#day-${routeKey}`
      routeLink.textContent = routeKey === 'home' ? '查看返程安排' : `查看 D${routeKey} 行程`
    }
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: routeKey === 'xiapu' ? 11 : 12 })
    routeTabs.forEach((tab) => {
      const active = tab.dataset.route === routeKey
      tab.classList.toggle('is-active', active)
      tab.setAttribute('aria-pressed', String(active))
    })
  }

  routeTabs.forEach((tab) => tab.addEventListener('click', () => renderRoute(tab.dataset.route)))
  renderRoute('xiapu')
}

const lightbox = document.querySelector('#lightbox')
const lightboxImage = document.querySelector('#lightbox-image')
const lightboxCaption = document.querySelector('#lightbox-caption')
const lightboxSource = document.querySelector('#lightbox-source')
const lightboxCounter = document.querySelector('#lightbox-counter')
const lightboxPrevious = document.querySelector('.lightbox__nav--prev')
const lightboxNext = document.querySelector('.lightbox__nav--next')

if (lightbox && lightboxImage && lightboxCaption && lightboxSource && lightboxCounter && lightboxPrevious && lightboxNext) {
  let galleryItems = []
  let currentIndex = 0
  let gestureStart = null
  let imageScale = 1
  let imageX = 0
  let imageY = 0
  const activePointers = new Map()

  const updateImageTransform = () => {
    const maxX = lightboxImage.clientWidth * (imageScale - 1) / 2
    const maxY = lightboxImage.clientHeight * (imageScale - 1) / 2
    imageX = Math.max(-maxX, Math.min(maxX, imageX))
    imageY = Math.max(-maxY, Math.min(maxY, imageY))
    lightboxImage.style.transform = `translate3d(${imageX}px, ${imageY}px, 0) scale(${imageScale})`
    lightboxImage.classList.toggle('is-zoomed', imageScale > 1)
  }

  const resetImageTransform = () => {
    activePointers.clear()
    gestureStart = null
    imageScale = 1
    imageX = 0
    imageY = 0
    updateImageTransform()
  }

  const pointerDistance = () => {
    const [first, second] = [...activePointers.values()]
    return Math.hypot(second.x - first.x, second.y - first.y)
  }

  const showPhoto = (index) => {
    const button = galleryItems[index]
    if (!button) return
    const image = button.querySelector('img')
    currentIndex = index
    resetImageTransform()
    lightboxImage.src = button.dataset.photo
    lightboxImage.alt = image?.alt || ''
    lightboxCaption.textContent = button.dataset.caption || image?.alt || ''
    lightboxSource.href = button.dataset.source
    lightboxCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`
    lightboxPrevious.disabled = currentIndex === 0
    lightboxNext.disabled = currentIndex === galleryItems.length - 1
    lightboxPrevious.hidden = galleryItems.length < 2
    lightboxNext.hidden = galleryItems.length < 2
  }

  const movePhoto = (step) => showPhoto(currentIndex + step)

  document.querySelectorAll('.photo-thumb').forEach((button) => {
    button.addEventListener('click', () => {
      galleryItems = [...button.closest('.place-gallery').querySelectorAll('.photo-thumb')]
      showPhoto(galleryItems.indexOf(button))
      lightbox.showModal()
    })
  })

  lightboxPrevious.addEventListener('click', () => movePhoto(-1))
  lightboxNext.addEventListener('click', () => movePhoto(1))
  lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close())
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close() })
  document.addEventListener('keydown', (event) => {
    if (!lightbox.open || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return
    event.preventDefault()
    movePhoto(event.key === 'ArrowLeft' ? -1 : 1)
  })
  lightboxImage.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return
    lightboxImage.setPointerCapture(event.pointerId)
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (activePointers.size === 2) {
      gestureStart = { type: 'pinch', distance: pointerDistance(), scale: imageScale }
    } else if (activePointers.size === 1) {
      gestureStart = { type: imageScale > 1 ? 'pan' : 'swipe', x: event.clientX, y: event.clientY, imageX, imageY }
    }
  })
  lightboxImage.addEventListener('pointermove', (event) => {
    if (!activePointers.has(event.pointerId)) return
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (activePointers.size === 2 && gestureStart?.type === 'pinch') {
      imageScale = Math.max(1, Math.min(4, gestureStart.scale * pointerDistance() / gestureStart.distance))
      if (imageScale === 1) imageX = imageY = 0
      updateImageTransform()
    } else if (activePointers.size === 1 && gestureStart?.type === 'pan') {
      imageX = gestureStart.imageX + event.clientX - gestureStart.x
      imageY = gestureStart.imageY + event.clientY - gestureStart.y
      updateImageTransform()
    }
  })
  lightboxImage.addEventListener('pointerup', (event) => {
    if (!activePointers.has(event.pointerId)) return
    const wasSinglePointer = activePointers.size === 1
    const horizontalDistance = event.clientX - (gestureStart?.x || event.clientX)
    const verticalDistance = event.clientY - (gestureStart?.y || event.clientY)
    const wasSwipe = wasSinglePointer && gestureStart?.type === 'swipe'
    activePointers.delete(event.pointerId)

    if (wasSwipe && Math.abs(horizontalDistance) >= 45 && Math.abs(horizontalDistance) >= Math.abs(verticalDistance) * 1.25) {
      movePhoto(horizontalDistance < 0 ? 1 : -1)
      return
    }

    const remainingPointer = [...activePointers.values()][0]
    gestureStart = remainingPointer && imageScale > 1
      ? { type: 'pan', x: remainingPointer.x, y: remainingPointer.y, imageX, imageY }
      : null
  })
  lightboxImage.addEventListener('pointercancel', (event) => {
    activePointers.delete(event.pointerId)
    gestureStart = null
  })
}
