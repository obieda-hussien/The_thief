/**
 * Main Game Engine and Visualization
 */
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 500;
        
        // Game components
        this.environment = new Environment(this.canvas.width, this.canvas.height);
        this.evolution = new Evolution();
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        
        // UI elements
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.generationDisplay = document.getElementById('generation');
        this.bestFitnessDisplay = document.getElementById('bestFitness');
        this.populationStatsDisplay = document.getElementById('populationStats');
        
        this.setupEventListeners();
        this.updateUI();
        
        // Initialize physics
        this.evolution.initializePhysics(this.environment);
        
        console.log('Resource Runners initialized! Click Start Evolution to begin.');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'KeyR':
                    this.reset();
                    break;
                case 'KeyS':
                    this.start();
                    break;
            }
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.gameLoop();
            console.log('Evolution started!');
        }
        this.updateUI();
    }
    
    togglePause() {
        if (this.isRunning) {
            this.isPaused = !this.isPaused;
            if (!this.isPaused) {
                this.gameLoop();
            }
            console.log(this.isPaused ? 'Game paused' : 'Game resumed');
        }
        this.updateUI();
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        
        // Clean up current generation
        this.evolution.cleanupPhysics(this.environment);
        
        // Reset everything
        this.evolution.reset();
        this.environment.reset();
        
        // Reinitialize
        this.evolution.initializePhysics(this.environment);
        
        this.updateUI();
        console.log('Game reset!');
    }
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) {
            return;
        }
        
        // Update game logic
        this.update();
        
        // Render everything
        this.render();
        
        // Update UI
        this.updateUI();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Update environment physics
        this.environment.update();
        
        // Update evolution (agents thinking and acting)
        this.evolution.update(this.environment);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0f1419';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render environment
        this.environment.render(this.ctx);
        
        // Render agents
        this.renderAgents();
        
        // Render UI overlays
        this.renderOverlays();
    }
    
    renderAgents() {
        for (const agent of this.evolution.agents) {
            if (!agent.body || !agent.isAlive) continue;
            
            // Render agent body
            this.ctx.fillStyle = agent.color;
            this.ctx.strokeStyle = agent.hasCrystal ? '#f1c40f' : '#34495e';
            this.ctx.lineWidth = agent.hasCrystal ? 3 : 1;
            
            this.renderPhysicsBody(agent.body);
            
            // Render wheels
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.strokeStyle = '#34495e';
            this.ctx.lineWidth = 1;
            
            if (agent.leftWheel) this.renderPhysicsBody(agent.leftWheel);
            if (agent.rightWheel) this.renderPhysicsBody(agent.rightWheel);
            
            // Render sensor rays (for top 3 agents)
            const topAgents = this.evolution.agents.slice(0, 3);
            if (topAgents.includes(agent)) {
                this.renderSensorRays(agent);
            }
        }
    }
    
    renderPhysicsBody(body) {
        const position = body.position;
        const angle = body.angle;
        
        this.ctx.save();
        this.ctx.translate(position.x, position.y);
        this.ctx.rotate(angle);
        
        if (body.circleRadius) {
            // Circle
            this.ctx.beginPath();
            this.ctx.arc(0, 0, body.circleRadius, 0, 2 * Math.PI);
            this.ctx.fill();
            if (this.ctx.lineWidth > 0) this.ctx.stroke();
        } else {
            // Polygon
            const vertices = body.vertices;
            if (vertices.length > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(vertices[0].x - position.x, vertices[0].y - position.y);
                for (let i = 1; i < vertices.length; i++) {
                    this.ctx.lineTo(vertices[i].x - position.x, vertices[i].y - position.y);
                }
                this.ctx.closePath();
                this.ctx.fill();
                if (this.ctx.lineWidth > 0) this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    renderSensorRays(agent) {
        if (!agent.body) return;
        
        const angles = [-Math.PI/4, 0, Math.PI/4, Math.PI/2];
        this.ctx.strokeStyle = agent.color + '40'; // Semi-transparent
        this.ctx.lineWidth = 1;
        
        for (const angleOffset of angles) {
            const angle = agent.body.angle + angleOffset;
            const distance = agent.castRay(this.environment, angle);
            
            const startX = agent.body.position.x;
            const startY = agent.body.position.y;
            const endX = startX + Math.cos(angle) * distance;
            const endY = startY + Math.sin(angle) * distance;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
    }
    
    renderOverlays() {
        // Render generation progress bar
        const stats = this.evolution.getStatistics();
        const progressWidth = (this.canvas.width - 40) * (stats.progress / 100);
        
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(20, 20, this.canvas.width - 40, 10);
        
        this.ctx.fillStyle = '#4cc9f0';
        this.ctx.fillRect(20, 20, progressWidth, 10);
        
        // Progress text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Generation ${stats.generation} Progress: ${stats.progress}%`, 20, 45);
        
        // Time remaining
        const timeRemaining = Math.ceil(stats.timeRemaining / 60);
        this.ctx.fillText(`Time: ${timeRemaining}s`, this.canvas.width - 80, 45);
        
        // Crystal counter
        this.ctx.fillText(`Crystals Delivered: ${stats.totalCrystalsDelivered}`, 20, this.canvas.height - 10);
    }
    
    updateUI() {
        const stats = this.evolution.getStatistics();
        
        // Update button states
        this.startBtn.disabled = this.isRunning;
        this.pauseBtn.disabled = !this.isRunning;
        this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        
        // Update displays
        this.generationDisplay.textContent = `Generation: ${stats.generation}`;
        this.bestFitnessDisplay.textContent = `Best Fitness: ${stats.bestFitness}`;
        
        // Update population stats
        this.populationStatsDisplay.innerHTML = `
            <div>Progress: ${stats.progress}%</div>
            <div>Best Fitness: ${stats.bestFitness}</div>
            <div>Avg Fitness: ${stats.averageFitness}</div>
            <div>Crystals Delivered: ${stats.totalCrystalsDelivered}</div>
            <br>
            <div><strong>Top Performers:</strong></div>
            ${stats.topAgents.map((agent, i) => `
                <div>Agent ${i + 1}: ${agent.fitness} pts 
                (${agent.crystalsDelivered} delivered)</div>
            `).join('')}
        `;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    window.game = game; // For debugging
    
    // Add some helpful instructions
    console.log('=== Resource Runners Controls ===');
    console.log('Space: Pause/Resume');
    console.log('R: Reset simulation');
    console.log('S: Start evolution');
    console.log('=====================================');
});