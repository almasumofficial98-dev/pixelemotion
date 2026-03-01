const canvas = document.getElementById("canvas");
const arrangeItems = document.querySelectorAll(".draggable");
let activeItem = null;

function init() {
    if (arrangeItems.length === 0) return; 

    arrangeItems.forEach(el => {
        if (!el.style.left) setRandom(el);
        makeDraggable(el);
    });
    
    canvas.addEventListener("mousedown", (e) => {
        if (e.target === canvas) setActiveItem(null);
    });
    canvas.addEventListener("touchstart", (e) => {
        if (e.target === canvas) setActiveItem(null);
    });

    updateURL();
}

function setRandom(el) {
    const maxX = canvas.clientWidth - 80;
    const maxY = canvas.clientHeight - 80;
    el.style.left = Math.random() * maxX + "px";
    el.style.top = Math.random() * maxY + "px";
}

function updateURL() {
    if (arrangeItems.length === 0) return; 
    
    const layout = [];
    arrangeItems.forEach(el => {
        const scale = el.dataset.scale || 1.0;
        const z = el.dataset.z || (el.dataset.id.startsWith('L') ? 1 : 10);
        
        layout.push(
            `${el.dataset.id}:${Math.round(el.offsetLeft)}:${Math.round(el.offsetTop)}:${scale}:${z}`
        );
    });
    const msg = new URLSearchParams(location.search).get("msg") || "";
    history.replaceState(null, "", `?msg=${encodeURIComponent(msg)}&layout=${layout.join(",")}`);
}

function setActiveItem(el) {
    if (activeItem) activeItem.classList.remove("active-item");
    activeItem = el;
    
    const panel = document.getElementById("resize-panel");
    if (!panel) return;

    if (activeItem) {
        activeItem.classList.add("active-item");
        panel.style.opacity = "1";
        panel.style.pointerEvents = "auto";
    } else {
        panel.style.opacity = "0.4";
        panel.style.pointerEvents = "none";
    }
}

function adjustSize(delta) {
    if (!activeItem) return;
    
    let scale = parseFloat(activeItem.dataset.scale) || 1.0;
    scale += delta;
    
    if (scale < 0.4) scale = 0.4; 
    if (scale > 3.5) scale = 3.5; 
    
    activeItem.dataset.scale = scale.toFixed(1);
    activeItem.style.transform = `scale(${scale})`;
    updateURL();
}

function adjustZIndex(delta) {
    if (!activeItem) return;

    let z = parseInt(activeItem.dataset.z) || (activeItem.dataset.id.startsWith('L') ? 1 : 10);
    z += delta;

    activeItem.dataset.z = z;
    activeItem.style.zIndex = z;
    updateURL();
}

function makeDraggable(el) {
    let dragging = false, sx, sy, ix, iy;

    const start = e => {
        dragging = true;
        setActiveItem(el); 
        
        const p = e.touches ? e.touches[0] : e;
        sx = p.clientX;
        sy = p.clientY;
        ix = el.offsetLeft;
        iy = el.offsetTop;
        if (!e.touches) e.preventDefault(); 
    };

    const move = e => {
        if (!dragging) return;
        const p = e.touches ? e.touches[0] : e;
        let x = ix + (p.clientX - sx);
        let y = iy + (p.clientY - sy);

        x = Math.max(0, Math.min(x, canvas.clientWidth - el.offsetWidth));
        y = Math.max(0, Math.min(y, canvas.clientHeight - el.offsetHeight));

        el.style.left = x + "px";
        el.style.top = y + "px";
        e.preventDefault();
    };

    const end = () => {
        if (dragging) {
            dragging = false;
            updateURL();
        }
    };

    el.addEventListener("mousedown", start);
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", end);

    el.addEventListener("touchstart", start, { passive: false });
    document.addEventListener("touchmove", move, { passive: false });
    document.addEventListener("touchend", end);
}

function randomize() {
    arrangeItems.forEach(setRandom);
    updateURL();
}

function share() {
    const shareUrl = new URL(location.href, window.location.origin);
    shareUrl.searchParams.set("readonly", "1");
    
    navigator.clipboard.writeText(shareUrl.toString())
        .then(() => alert("Bouquet link copied!"));
}

init();