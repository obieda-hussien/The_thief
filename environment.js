/**
 * Game Environment with physics world, terrain, and objects
 */
class Environment {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Matter.js setup
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.engine.world.gravity.y = 0.8;
        
        // Game objects
        this.obstacles = [];
        this.crystals = [];
        this.bases = [];
        
        // Environment settings
        this.numCrystals = 8;
        this.crystalRespawnTime = 300; // frames
        
        this.setupWorld();
        this.createObstacles();
        this.createCrystals();
        this.createBases();
    }
    
    setupWorld() {
        // Create world boundaries
        const ground = Matter.Bodies.rectangle(this.width / 2, this.height - 10, this.width, 20, {
            isStatic: true,
            render: { fillStyle: '#2c3e50' }
        });
        
        const leftWall = Matter.Bodies.rectangle(10, this.height / 2, 20, this.height, {
            isStatic: true,
            render: { fillStyle: '#2c3e50' }
        });
        
        const rightWall = Matter.Bodies.rectangle(this.width - 10, this.height / 2, 20, this.height, {
            isStatic: true,
            render: { fillStyle: '#2c3e50' }
        });
        
        const ceiling = Matter.Bodies.rectangle(this.width / 2, 10, this.width, 20, {
            isStatic: true,
            render: { fillStyle: '#2c3e50' }
        });
        
        Matter.World.add(this.world, [ground, leftWall, rightWall, ceiling]);
    }
    
    createObstacles() {
        // Create interesting terrain and obstacles
        
        // Central hill
        const hill = Matter.Bodies.circle(this.width / 2, this.height - 100, 60, {
            isStatic: true,
            render: { fillStyle: '#34495e' }
        });
        this.obstacles.push(hill);
        
        // Platforms
        const platform1 = Matter.Bodies.rectangle(150, this.height - 200, 100, 20, {
            isStatic: true,
            render: { fillStyle: '#34495e' }
        });
        this.obstacles.push(platform1);
        
        const platform2 = Matter.Bodies.rectangle(this.width - 150, this.height - 200, 100, 20, {
            isStatic: true,
            render: { fillStyle: '#34495e' }
        });
        this.obstacles.push(platform2);
        
        // Moving platform (pendulum)
        const pendulumBase = Matter.Bodies.circle(this.width / 2, 100, 5, {
            isStatic: true,
            render: { fillStyle: '#e74c3c' }
        });
        
        const pendulumBob = Matter.Bodies.rectangle(this.width / 2, 200, 40, 20, {
            density: 0.001,
            render: { fillStyle: '#e74c3c' }
        });
        
        const pendulumConstraint = Matter.Constraint.create({
            bodyA: pendulumBase,
            bodyB: pendulumBob,
            length: 100,
            stiffness: 0.8
        });
        
        this.obstacles.push(pendulumBob);
        
        // Seesaw
        const seesawBase = Matter.Bodies.circle(this.width / 4, this.height - 50, 10, {
            isStatic: true,
            render: { fillStyle: '#95a5a6' }
        });
        
        const seesawPlank = Matter.Bodies.rectangle(this.width / 4, this.height - 70, 120, 10, {
            density: 0.001,
            render: { fillStyle: '#95a5a6' }
        });
        
        const seesawConstraint = Matter.Constraint.create({
            bodyA: seesawBase,
            bodyB: seesawPlank,
            pointA: { x: 0, y: 0 },
            pointB: { x: 0, y: 0 },
            length: 0
        });
        
        this.obstacles.push(seesawPlank);
        
        // Add all dynamic obstacles to world
        Matter.World.add(this.world, [
            hill, platform1, platform2,
            pendulumBase, pendulumBob, pendulumConstraint,
            seesawBase, seesawPlank, seesawConstraint
        ]);
    }
    
    createCrystals() {
        this.crystals = [];
        
        for (let i = 0; i < this.numCrystals; i++) {
            this.spawnCrystal();
        }
    }
    
    spawnCrystal() {
        let x, y;
        let validPosition = false;
        let attempts = 0;
        
        // Try to find a valid spawn position
        while (!validPosition && attempts < 50) {
            x = Math.random() * (this.width - 100) + 50;
            y = Math.random() * (this.height - 200) + 50;
            
            validPosition = true;
            
            // Check against obstacles
            for (const obstacle of this.obstacles) {
                const dx = x - obstacle.position.x;
                const dy = y - obstacle.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 50) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check against existing crystals
            for (const crystal of this.crystals) {
                const dx = x - crystal.position.x;
                const dy = y - crystal.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 40) {
                    validPosition = false;
                    break;
                }
            }
            
            attempts++;
        }
        
        // Create crystal
        const crystal = Matter.Bodies.polygon(x, y, 4, 12, {
            isSensor: true,
            render: {
                fillStyle: '#f1c40f',
                strokeStyle: '#f39c12',
                lineWidth: 2
            }
        });
        
        crystal.collected = false;
        crystal.respawnTimer = 0;
        
        this.crystals.push(crystal);
        Matter.World.add(this.world, crystal);
    }
    
    createBases() {
        this.bases = [];
        
        // Create 4 bases in corners
        const basePositions = [
            { x: 50, y: this.height - 50 },
            { x: this.width - 50, y: this.height - 50 },
            { x: 50, y: 50 },
            { x: this.width - 50, y: 50 }
        ];
        
        for (const pos of basePositions) {
            const base = Matter.Bodies.rectangle(pos.x, pos.y, 30, 30, {
                isSensor: true,
                isStatic: true,
                render: {
                    fillStyle: '#27ae60',
                    strokeStyle: '#2ecc71',
                    lineWidth: 3
                }
            });
            
            this.bases.push(base);
            Matter.World.add(this.world, base);
        }
    }
    
    update() {
        // Update physics
        Matter.Engine.update(this.engine);
        
        // Handle crystal respawning
        this.updateCrystals();
    }
    
    updateCrystals() {
        for (let i = this.crystals.length - 1; i >= 0; i--) {
            const crystal = this.crystals[i];
            
            if (crystal.collected) {
                crystal.respawnTimer++;
                
                if (crystal.respawnTimer >= this.crystalRespawnTime) {
                    // Remove old crystal
                    Matter.World.remove(this.world, crystal);
                    this.crystals.splice(i, 1);
                    
                    // Spawn new crystal
                    this.spawnCrystal();
                }
            }
        }
    }
    
    checkCollisions(agents) {
        const pairs = Matter.Pairs.create();
        const collisions = Matter.Detector.create();
        
        // Check agent-crystal collisions
        for (const agent of agents) {
            if (!agent.body || !agent.isAlive) continue;
            
            for (const crystal of this.crystals) {
                if (!crystal.collected) {
                    const dx = agent.body.position.x - crystal.position.x;
                    const dy = agent.body.position.y - crystal.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 25) {
                        // Agent collects crystal
                        agent.collectCrystal();
                        crystal.collected = true;
                        crystal.respawnTimer = 0;
                        break;
                    }
                }
            }
            
            // Check agent-base collisions
            for (const base of this.bases) {
                const dx = agent.body.position.x - base.position.x;
                const dy = agent.body.position.y - base.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 30 && agent.hasCrystal) {
                    // Agent delivers crystal
                    if (agent.deliverCrystal()) {
                        // Successfully delivered to base
                        console.log(`Agent delivered crystal! Total: ${agent.crystalsDelivered}`);
                    }
                    break;
                }
            }
        }
        
        // Check agent-agent collisions for crystal stealing
        for (let i = 0; i < agents.length; i++) {
            for (let j = i + 1; j < agents.length; j++) {
                const agentA = agents[i];
                const agentB = agents[j];
                
                if (!agentA.body || !agentB.body || !agentA.isAlive || !agentB.isAlive) continue;
                
                const dx = agentA.body.position.x - agentB.body.position.x;
                const dy = agentA.body.position.y - agentB.body.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 35) {
                    // Physical collision
                    agentA.onCollision();
                    agentB.onCollision();
                    
                    // Crystal stealing mechanic
                    const velocityA = Math.sqrt(agentA.body.velocity.x ** 2 + agentA.body.velocity.y ** 2);
                    const velocityB = Math.sqrt(agentB.body.velocity.x ** 2 + agentB.body.velocity.y ** 2);
                    
                    if (agentA.hasCrystal && velocityB > velocityA + 2) {
                        // Agent B steals from A
                        agentA.dropCrystal();
                        agentB.collectCrystal();
                    } else if (agentB.hasCrystal && velocityA > velocityB + 2) {
                        // Agent A steals from B
                        agentB.dropCrystal();
                        agentA.collectCrystal();
                    }
                }
            }
        }
    }
    
    render(ctx) {
        // Clear canvas
        ctx.fillStyle = '#0f1419';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Render static obstacles
        ctx.fillStyle = '#34495e';
        for (const obstacle of this.obstacles) {
            this.renderBody(ctx, obstacle);
        }
        
        // Render crystals
        for (const crystal of this.crystals) {
            if (!crystal.collected) {
                ctx.fillStyle = '#f1c40f';
                ctx.strokeStyle = '#f39c12';
                ctx.lineWidth = 2;
                this.renderBody(ctx, crystal);
            }
        }
        
        // Render bases
        ctx.fillStyle = '#27ae60';
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 3;
        for (const base of this.bases) {
            this.renderBody(ctx, base);
        }
    }
    
    renderBody(ctx, body) {
        const position = body.position;
        const angle = body.angle;
        
        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.rotate(angle);
        
        if (body.circleRadius) {
            // Circle
            ctx.beginPath();
            ctx.arc(0, 0, body.circleRadius, 0, 2 * Math.PI);
            ctx.fill();
            if (ctx.lineWidth > 0) ctx.stroke();
        } else {
            // Polygon
            const vertices = body.vertices;
            if (vertices.length > 0) {
                ctx.beginPath();
                ctx.moveTo(vertices[0].x - position.x, vertices[0].y - position.y);
                for (let i = 1; i < vertices.length; i++) {
                    ctx.lineTo(vertices[i].x - position.x, vertices[i].y - position.y);
                }
                ctx.closePath();
                ctx.fill();
                if (ctx.lineWidth > 0) ctx.stroke();
            }
        }
        
        ctx.restore();
    }
    
    reset() {
        // Remove all existing crystals from physics world
        for (const crystal of this.crystals) {
            Matter.World.remove(this.world, crystal);
        }
        
        // Clear the crystals array
        this.crystals = [];
        
        // Recreate all crystals fresh
        for (let i = 0; i < this.numCrystals; i++) {
            this.spawnCrystal();
        }
    }
}