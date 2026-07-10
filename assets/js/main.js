const workItems = document.querySelectorAll('.work-item');

function randomizeItem(item) {
  const rect = item.getBoundingClientRect();
  const maxX = Math.max(window.innerWidth - rect.width, 0);
  const maxY = Math.max(window.innerHeight - rect.height, 0);
  const x = Math.random() * maxX;
  const y = Math.random() * maxY;
  const degree = Math.random() * 360;

  if (!item.style.position) item.style.position = 'absolute';
  item.style.transform = `translate(${x}px, ${y}px) rotate(${degree}deg)`;
}

function handleMouseEnter() {
  const video = this.querySelector('video');
  if (video) {
    video.play().catch(() => {});
  }
}

function handleMouseLeave() {
  const video = this.querySelector('video');
  if (video) {
    try {
      video.pause();
    } catch (e) {}
  }
}

function initWorkItems() {
  workItems.forEach((item) => {
    randomizeItem(item);
    item.addEventListener('mouseenter', handleMouseEnter);
    item.addEventListener('mouseleave', handleMouseLeave);
  });

  // Reposition items when the viewport changes
  window.addEventListener('resize', () => {
    workItems.forEach(randomizeItem);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorkItems);
} else {
  initWorkItems();
}
