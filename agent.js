/**
 * AI Agent (Runner) class with physics body and neural network
 */
class Agent {
    constructor(x, y, brain = null) {
        // Neural network configuration
        this.inputSize = 8; // raycasts + velocity + crystal direction + base direction
        this.hiddenSize = 12;
        this.outputSize = 3; // left wheel torque, right wheel torque, jump
        
        this.brain = brain || new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
        
        // Fitness tracking
        this.fitness = 0;
        this.crystalsCollected = 0;
        this.crystalsDelivered = 0;
        this.timeHoldingCrystal = 0;
        this.collisions = 0;
        this.isAlive = true;
        
        // Game state
        this.hasCrystal = false;
        this.baseX = x;
        this.baseY = y;
        
        // Physics body will be created by the environment
        this.body = null;
        this.leftWheel = null;
        this.rightWheel = null;
        
        // Sensors
        this.rayLength = 80;
        this.lastAction = [0, 0, 0];
        
        // Color for visualization
        this.color = this.getRandomColor();
    }
    
    getRandomColor() {
        const colors = [
            '#4cc9f0', '#7209b7', '#f72585', '#4361ee', 
            '#f9844a', '#43aa8b', '#277da1', '#90e0ef'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    createPhysicsBody(world, x, y) {
        const Engine = Matter.Engine;
        const Bodies = Matter.Bodies;
        const Constraint = Matter.Constraint;
        const World = Matter.World;
        
        // Main body (circle)
        this.body = Bodies.circle(x, y, 15, {
            density: 0.001,
            frictionAir: 0.02,
            render: {
                fillStyle: this.color
            }
        });
        
        // Wheels
        this.leftWheel = Bodies.circle(x - 12, y + 10, 8, {
            density: 0.002,
            friction: 0.8,
            render: {
                fillStyle: '#333'
            }
        });
        
        this.rightWheel = Bodies.circle(x + 12, y + 10, 8, {
            density: 0.002,
            friction: 0.8,
            render: {
                fillStyle: '#333'
            }
        });
        
        // Constraints to connect wheels to body
        this.leftConstraint = Constraint.create({
            bodyA: this.body,
            bodyB: this.leftWheel,
            pointA: { x: -12, y: 10 },
            pointB: { x: 0, y: 0 },
            stiffness: 0.8,
            length: 0
        });
        
        this.rightConstraint = Constraint.create({
            bodyA: this.body,
            bodyB: this.rightWheel,
            pointA: { x: 12, y: 10 },
            pointB: { x: 0, y: 0 },
            stiffness: 0.8,
            length: 0
        });
        
        // Add to world
        World.add(world, [
            this.body, 
            this.leftWheel, 
            this.rightWheel, 
            this.leftConstraint, 
            this.rightConstraint
        ]);
        
        // Store reference to agent in body for collision detection
        this.body.agent = this;
        this.leftWheel.agent = this;
        this.rightWheel.agent = this;
    }
    
    think(environment) {
        if (!this.isAlive || !this.body) return;
        
        const inputs = this.getSensorInputs(environment);
        const outputs = this.brain.predict(inputs);
        
        // Apply actions
        this.applyActions(outputs);
        this.lastAction = outputs.slice();
        
        // Update fitness tracking
        if (this.hasCrystal) {
            this.timeHoldingCrystal++;
        }
    }
    
    getSensorInputs(environment) {
        const inputs = new Array(this.inputSize);
        let index = 0;
        
        // Raycasting for obstacle detection (4 rays)
        const angles = [-Math.PI/4, 0, Math.PI/4, Math.PI/2];
        for (let i = 0; i < 4; i++) {
            const angle = this.body.angle + angles[i];
            const distance = this.castRay(environment, angle);
            inputs[index++] = distance / this.rayLength; // Normalize
        }
        
        // Agent velocity
        inputs[index++] = this.body.velocity.x / 10; // Normalize
        inputs[index++] = this.body.velocity.y / 10; // Normalize
        
        // Direction to nearest crystal
        const crystal = this.findNearestCrystal(environment);
        if (crystal) {
            const dx = crystal.position.x - this.body.position.x;
            const dy = crystal.position.y - this.body.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            inputs[index++] = dx / distance; // Normalized x direction
            inputs[index++] = dy / distance; // Normalized y direction
        } else {
            inputs[index++] = 0;
            inputs[index++] = 0;
        }
        
        return inputs;
    }
    
    castRay(environment, angle) {
        const startX = this.body.position.x;
        const startY = this.body.position.y;
        const endX = startX + Math.cos(angle) * this.rayLength;
        const endY = startY + Math.sin(angle) * this.rayLength;
        
        // Simple ray casting - check against environment boundaries and obstacles
        const stepSize = 5;
        const steps = this.rayLength / stepSize;
        
        for (let i = 1; i <= steps; i++) {
            const x = startX + (endX - startX) * (i / steps);
            const y = startY + (endY - startY) * (i / steps);
            
            // Check world boundaries
            if (x < 0 || x > environment.width || y < 0 || y > environment.height) {
                return i * stepSize;
            }
            
            // Check against static obstacles
            for (const obstacle of environment.obstacles) {
                const dx = x - obstacle.position.x;
                const dy = y - obstacle.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 20) { // Approximate obstacle radius
                    return i * stepSize;
                }
            }
        }
        
        return this.rayLength;
    }
    
    findNearestCrystal(environment) {
        if (this.hasCrystal) return null;
        
        let nearest = null;
        let minDistance = Infinity;
        
        for (const crystal of environment.crystals) {
            if (!crystal.collected) {
                const dx = crystal.position.x - this.body.position.x;
                const dy = crystal.position.y - this.body.position.y;
                const distance = dx * dx + dy * dy;
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearest = crystal;
                }
            }
        }
        
        return nearest;
    }
    
    applyActions(outputs) {
        const leftTorque = outputs[0] * 0.01;  // Scale down torque
        const rightTorque = outputs[1] * 0.01;
        const jump = outputs[2];
        
        // Apply wheel torques
        if (this.leftWheel) {
            Matter.Body.applyForce(this.leftWheel, this.leftWheel.position, {
                x: leftTorque * Math.cos(this.body.angle + Math.PI/2),
                y: leftTorque * Math.sin(this.body.angle + Math.PI/2)
            });
        }
        
        if (this.rightWheel) {
            Matter.Body.applyForce(this.rightWheel, this.rightWheel.position, {
                x: rightTorque * Math.cos(this.body.angle + Math.PI/2),
                y: rightTorque * Math.sin(this.body.angle + Math.PI/2)
            });
        }
        
        // Jump (small upward force)
        if (jump > 0.5 && this.body) {
            Matter.Body.applyForce(this.body, this.body.position, {
                x: 0,
                y: -jump * 0.003
            });
        }
    }
    
    collectCrystal() {
        if (!this.hasCrystal) {
            this.hasCrystal = true;
            this.crystalsCollected++;
        }
    }
    
    deliverCrystal() {
        if (this.hasCrystal) {
            this.hasCrystal = false;
            this.crystalsDelivered++;
            
            // Check if near base
            const dx = this.body.position.x - this.baseX;
            const dy = this.body.position.y - this.baseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            return distance < 40; // Successfully delivered
        }
        return false;
    }
    
    dropCrystal() {
        this.hasCrystal = false;
    }
    
    onCollision() {
        this.collisions++;
    }
    
    calculateFitness() {
        // Primary goal: delivering crystals to base
        let fitness = this.crystalsDelivered * 100;
        
        // Bonus for holding crystals
        fitness += this.timeHoldingCrystal * 0.1;
        
        // Penalty for collisions
        fitness -= this.collisions * 5;
        
        // Small penalty for inactivity (encourage exploration)
        const totalMovement = Math.abs(this.body.velocity.x) + Math.abs(this.body.velocity.y);
        if (totalMovement < 0.1) {
            fitness -= 1;
        }
        
        this.fitness = Math.max(0, fitness);
        return this.fitness;
    }
    
    reset(x, y) {
        this.fitness = 0;
        this.crystalsCollected = 0;
        this.crystalsDelivered = 0;
        this.timeHoldingCrystal = 0;
        this.collisions = 0;
        this.hasCrystal = false;
        this.isAlive = true;
        
        if (this.body) {
            Matter.Body.setPosition(this.body, { x, y });
            Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(this.body, 0);
        }
    }
}