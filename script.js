// Variables globales
let particles = [];
let floatingShapes = [];
let time = 0;
let mainTextSize = 64;
let clicked = false;
let textAlpha = 0;
let textScale = 0;
let animationStarted = false;

// Palette minimaliste
const colors = {
    bg: '#ffffff',
    text: '#1f2937',
    light: '#f3f4f6',
    accent: '#e5e7eb',
    subtle: '#9ca3af'
};

function setup() {
    let canvas = createCanvas(800, 600);
    canvas.parent('canvas-container');
    
    // Créer quelques formes géométriques simples
    for (let i = 0; i < 6; i++) {
        floatingShapes.push(new FloatingShape());
    }
    
    // Démarrer l'animation du texte après un petit délai
    setTimeout(() => {
        animationStarted = true;
    }, 500);
}

function draw() {
    background(255);
    time += 0.01;
    
    // Animation du texte
    updateTextAnimation();
    
    // Mise à jour des formes flottantes
    updateFloatingShapes();
    
    // Mise à jour des particules
    updateParticles();
    
    // Affichage du texte principal
    drawMainText();
    
    // Effet de clic
    if (clicked) {
        clicked = false;
        createRipple();
    }
}

function updateTextAnimation() {
    if (animationStarted) {
        // Animation fluide du fade-in et scale
        textAlpha = lerp(textAlpha, 255, 0.03);
        textScale = lerp(textScale, 1, 0.04);
    }
}

function updateFloatingShapes() {
    for (let shape of floatingShapes) {
        shape.update();
        shape.display();
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].display();
        
        if (particles[i].isDead()) {
            particles.splice(i, 1);
        }
    }
}

function drawMainText() {
    push();
    
    // Effet de respiration subtil (seulement après l'animation d'entrée)
    let breathe = 1;
    if (textAlpha > 200) {
        breathe = sin(time * 2) * 0.02 + 1;
    }
    
    let currentSize = mainTextSize * breathe * textScale;
    
    // Texte principal avec fade-in
    fill(31, 41, 55, textAlpha);
    textAlign(CENTER, CENTER);
    textSize(currentSize);
    text("Hello Web", width/2, height/2);
    
    // Sous-titre discret (apparaît après le titre principal)
    let subtitleAlpha = max(0, textAlpha - 100);
    textSize(16 * textScale);
    fill(156, 163, 175, subtitleAlpha);
    text("Animation Interactive", width/2, height/2 + 50);
    
    pop();
}

function mousePressed() {
    clicked = true;
    
    // Créer des ondulations au clic
    createRipple();
    
    // Faire réagir les formes
    for (let shape of floatingShapes) {
        let distance = dist(mouseX, mouseY, shape.x, shape.y);
        if (distance < 150) {
            shape.push(mouseX, mouseY);
        }
    }
}

function mouseMoved() {
    // Interaction subtile avec les formes
    for (let shape of floatingShapes) {
        let distance = dist(mouseX, mouseY, shape.x, shape.y);
        if (distance < 100) {
            shape.attract(mouseX, mouseY);
        }
    }
}

function createRipple() {
    for (let i = 0; i < 8; i++) {
        particles.push(new Ripple(mouseX, mouseY, i));
    }
}

// Classe pour les formes flottantes minimalistes
class FloatingShape {
    constructor() {
        this.x = random(100, width - 100);
        this.y = random(100, height - 100);
        this.vx = random(-0.5, 0.5);
        this.vy = random(-0.5, 0.5);
        this.size = random(30, 80);
        this.rotation = 0;
        this.rotationSpeed = random(-0.01, 0.01);
        this.type = random(['circle', 'square']);
        this.baseAlpha = random(10, 30);
        this.currentAlpha = this.baseAlpha;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        // Rebond doux sur les bords
        if (this.x < 50 || this.x > width - 50) this.vx *= -0.8;
        if (this.y < 50 || this.y > height - 50) this.vy *= -0.8;
        
        // Friction
        this.vx *= 0.995;
        this.vy *= 0.995;
        
        // Retour progressif à l'alpha de base
        this.currentAlpha = lerp(this.currentAlpha, this.baseAlpha, 0.05);
    }
    
    display() {
        push();
        translate(this.x, this.y);
        rotate(this.rotation);
        fill(31, 41, 55, this.currentAlpha);
        noStroke();
        
        switch(this.type) {
            case 'circle':
                ellipse(0, 0, this.size);
                break;
            case 'square':
                rectMode(CENTER);
                rect(0, 0, this.size, this.size);
                break;
        }
        pop();
    }
    
    attract(mx, my) {
        let force = createVector(mx - this.x, my - this.y);
        force.normalize();
        force.mult(0.01);
        this.vx += force.x;
        this.vy += force.y;
        this.currentAlpha = min(this.currentAlpha + 5, 60);
    }
    
    push(mx, my) {
        let force = createVector(this.x - mx, this.y - my);
        force.normalize();
        force.mult(2);
        this.vx += force.x;
        this.vy += force.y;
        this.currentAlpha = 80;
    }
}

// Classe pour les ondulations au clic
class Ripple {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 100;
        this.life = 255;
        this.delay = index * 5;
        this.started = false;
    }
    
    update() {
        if (this.delay > 0) {
            this.delay--;
            return;
        }
        
        this.started = true;
        this.radius += 2;
        this.life -= 4;
        
        if (this.radius > this.maxRadius) {
            this.life = 0;
        }
    }
    
    display() {
        if (!this.started || this.life <= 0) return;
        
        push();
        noFill();
        stroke(31, 41, 55, this.life * 0.3);
        strokeWeight(1);
        ellipse(this.x, this.y, this.radius * 2);
        pop();
    }
    
    isDead() {
        return this.life <= 0 && this.started;
    }
}