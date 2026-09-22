const sections = [...document.querySelectorAll('.day')]
const links = [...document.querySelectorAll('.day-nav a')]

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (!current) return
      links.forEach((link) => {
        link.classList.toggle('is-active', link.hash === `#${current.target.id}`)
      })
    },
    { rootMargin: '-20% 0px -65%', threshold: [0, 0.25, 0.5] },
  )
  sections.forEach((section) => observer.observe(section))
}

const routeMapElement = document.querySelector('#route-map')

if (routeMapElement && window.L) {
  const stops = {
    hotel: { name: '霞浦县城大本营', point: [26.88168, 120.018927] },
    beiqi: { name: '北岐滩涂', point: [26.877711, 120.064868] },
    xiaohao: { name: '小皓海滩', point: [26.928016, 120.146599] },
    dongbi: { name: '东壁村', point: [26.921002, 120.190122] },
    huazhu: { name: '花竹观景台', point: [26.941401, 120.234441] },
    sansha: { name: '三沙镇', point: [26.92615, 120.242485] },
    liuyun: { name: '留云禅寺', point: [26.922699, 120.192535] },
    yangjiaxi: { name: '杨家溪', point: [27.039476, 120.145443] },
    jishi: { name: '积石海滨', point: [26.742233, 120.101585] },
    banyueli: { name: '半月里畲族村', point: [26.750619, 119.890127] },
    gaoluo: { name: '高罗海滩', point: [26.751283, 120.09809] },
    xiaojing: { name: '小京沙滩（近似）', point: [26.662813, 120.109648] },
    pujiang: { name: '浦江', point: [29.448011, 119.899445] },
    yiwu: { name: '义乌国际商贸城', point: [29.327904, 120.103175] },
    hangzhou: { name: '杭州', point: [30.2741, 120.1551] },
  }
  const routes = {
    1: { label: 'D1 · 抵达与北岐日落', copy: '县城入住后往返北岐，不在抵达日拉长路线。', color: '#e86e4d', stops: ['hotel', 'beiqi', 'hotel'] },
    2: { label: 'D2 · 北线滩涂与东壁', copy: '北岐日出 → 县城早餐 → 小皓 → 三沙 → 东壁日落。', color: '#c98d25', stops: ['hotel', 'beiqi', 'hotel', 'xiaohao', 'sansha', 'dongbi', 'hotel'] },
    3: { label: 'D3 · 花竹与三沙人文', copy: '花竹日出 → 三沙镇 → 留云禅寺 → 小皓补拍。', color: '#2f8d83', stops: ['hotel', 'huazhu', 'sansha', 'liuyun', 'xiaohao', 'hotel'] },
    4: { label: 'D4 · 杨家溪山水线', copy: '县城往返杨家溪，午后回县城吃饭和休整。', color: '#4d7b62', stops: ['hotel', 'yangjiaxi', 'hotel'] },
    5: { label: 'D5 · 南线赶海与沙滩', copy: '积石 → 半月里 → 高罗 → 小京；小京为村级近似点位。', color: '#8d6aad', stops: ['hotel', 'jishi', 'banyueli', 'gaoluo', 'xiaojing', 'hotel'] },
    6: { label: 'D6 · 霞浦返程浦江', copy: '早市采购后离开霞浦，长途自驾到浦江。', color: '#4f73a1', stops: ['hotel', 'pujiang'] },
    7: { label: 'D7 · 浦江经义乌回杭州', copy: '浦江 → 义乌国际商贸城 → 杭州。', color: '#7d6a58', stops: ['pujiang', 'yiwu', 'hangzhou'] },
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

  const addRoute = (dayKey, showStopNumbers, markerSet) => {
    const route = routes[dayKey]
    const routeStops = route.stops.map((key) => stops[key])
    L.polyline(routeStops.map((stop) => stop.point), {
      color: route.color,
      weight: 4,
      opacity: 0.84,
      lineJoin: 'round',
    }).addTo(routeLayer)
    routeStops.forEach((stop, index) => {
      const markerKey = stop.point.join(',')
      if (markerSet.has(markerKey)) return
      markerSet.add(markerKey)
      const markerLabel = showStopNumbers ? String(index + 1) : '•'
      const icon = L.divIcon({
        className: '',
        html: `<span class="route-marker" style="--marker-color:${route.color}">${markerLabel}</span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
      L.marker(stop.point, { icon }).bindPopup(`<strong>${stop.name}</strong><br>D${dayKey} · 第 ${index + 1} 站`).addTo(routeLayer)
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
      copyElement.textContent = '县城为大本营，北线、杨家溪和南线各跑一个方向。'
      routeLink.href = '#day-1'
      routeLink.textContent = '从 D1 开始看'
    } else {
      bounds = addRoute(routeKey, true, markerSet)
      const route = routes[routeKey]
      labelElement.textContent = route.label
      copyElement.textContent = route.copy
      routeLink.href = `#day-${routeKey}`
      routeLink.textContent = `查看 D${routeKey} 行程`
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

if (lightbox && lightboxImage && lightboxCaption && lightboxSource) {
  document.querySelectorAll('.photo-thumb').forEach((button) => {
    button.addEventListener('click', () => {
      const image = button.querySelector('img')
      lightboxImage.src = button.dataset.photo
      lightboxImage.alt = image?.alt || ''
      lightboxCaption.textContent = button.dataset.caption || image?.alt || ''
      lightboxSource.href = button.dataset.source
      lightbox.showModal()
    })
  })
  lightbox.querySelector('.lightbox__close').addEventListener('click', () => lightbox.close())
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) lightbox.close()
  })
}
