class JellyPoint {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        const dx = this.baseX - this.x;
        const dy = this.baseY - this.y;
        const springForce = 0.2;
        const dampening = 0.8;

        this.vx += dx * springForce;
        this.vy += dy * springForce;
        
        this.vx *= dampening;
        this.vy *= dampening;

        this.x += this.vx;
        this.y += this.vy;
    }
}

class JellyBody {
    constructor(x, y, radius, points = 8, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.points = [];
        this.vx = 0;
        this.vy = 0;
        this.onGround = false;

        for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            this.points.push(new JellyPoint(px, py));
        }
    }

    update() {
        // Update base position of all points
        this.points.forEach((point, i) => {
            const angle = (i / this.points.length) * Math.PI * 2;
            point.baseX = this.x + Math.cos(angle) * this.radius;
            point.baseY = this.y + Math.sin(angle) * this.radius;
            point.update();
        });
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i <= this.points.length; i++) {
            const point = this.points[i % this.points.length];
            const prevPoint = this.points[i - 1];
            const nextPoint = this.points[(i + 1) % this.points.length];
            
            const cx = (prevPoint.x + point.x) / 2;
            const cy = (prevPoint.y + point.y) / 2;
            
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cx, cy);
        }

        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}
