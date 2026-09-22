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
