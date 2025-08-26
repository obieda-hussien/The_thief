/**
 * Genetic Algorithm Evolution System
 */
class Evolution {
    constructor() {
        this.populationSize = 50; // Reduced for better performance
        this.generation = 1;
        this.agents = [];
        this.simulationTime = 1800; // 30 seconds at 60 FPS
        this.currentFrame = 0;
        
        // Evolution parameters
        this.eliteCount = 5; // Top 10% (5 out of 50)
        this.mutationRate = 0.1;
        this.mutationStrength = 0.3;
        
        // Statistics
        this.bestFitness = 0;
        this.averageFitness = 0;
        this.generationHistory = [];
        
        this.createInitialPopulation();
    }
    
    createInitialPopulation() {
        this.agents = [];
        
        for (let i = 0; i < this.populationSize; i++) {
            // Distribute agents among the 4 bases
            const baseIndex = i % 4;
            const basePositions = [
                { x: 50, y: 450 },   // Bottom left
                { x: 750, y: 450 },  // Bottom right
                { x: 50, y: 50 },    // Top left
                { x: 750, y: 50 }    // Top right
            ];
            
            const pos = basePositions[baseIndex];
            const agent = new Agent(pos.x, pos.y);
            this.agents.push(agent);
        }
    }
    
    initializePhysics(environment) {
        // Create physics bodies for all agents
        for (let i = 0; i < this.agents.length; i++) {
            const agent = this.agents[i];
            const baseIndex = i % 4;
            const basePositions = [
                { x: 50, y: 450 },
                { x: 750, y: 450 },
                { x: 50, y: 50 },
                { x: 750, y: 50 }
            ];
            
            const pos = basePositions[baseIndex];
            agent.createPhysicsBody(environment.world, pos.x, pos.y);
        }
    }
    
    update(environment) {
        this.currentFrame++;
        
        // Let all agents think and act
        for (const agent of this.agents) {
            if (agent.isAlive) {
                agent.think(environment);
            }
        }
        
        // Check for collisions
        environment.checkCollisions(this.agents);
        
        // Check if simulation time is up
        if (this.currentFrame >= this.simulationTime) {
            this.evolve(environment);
        }
    }
    
    evolve(environment) {
        console.log(`Generation ${this.generation} complete`);
        
        // Calculate fitness for all agents
        for (const agent of this.agents) {
            agent.calculateFitness();
        }
        
        // Sort agents by fitness (descending)
        this.agents.sort((a, b) => b.fitness - a.fitness);
        
        // Calculate statistics
        this.updateStatistics();
        
        // Create next generation
        const newAgents = this.createNextGeneration();
        
        // Remove old physics bodies
        this.cleanupPhysics(environment);
        
        // Replace agents
        this.agents = newAgents;
        
        // Initialize new physics bodies
        this.initializePhysics(environment);
        
        // Reset environment
        environment.reset();
        
        // Reset simulation
        this.currentFrame = 0;
        this.generation++;
        
        console.log(`Generation ${this.generation} started - Best fitness: ${this.bestFitness.toFixed(2)}`);
    }
    
    createNextGeneration() {
        const newAgents = [];
        
        // Keep elite agents (top performers)
        for (let i = 0; i < this.eliteCount; i++) {
            const baseIndex = i % 4;
            const basePositions = [
                { x: 50, y: 450 },
                { x: 750, y: 450 },
                { x: 50, y: 50 },
                { x: 750, y: 50 }
            ];
            
            const pos = basePositions[baseIndex];
            const elite = new Agent(pos.x, pos.y, this.agents[i].brain.copy());
            newAgents.push(elite);
        }
        
        // Create offspring through crossover and mutation
        while (newAgents.length < this.populationSize) {
            // Select parents (tournament selection)
            const parent1 = this.tournamentSelect();
            const parent2 = this.tournamentSelect();
            
            // Create child through crossover
            const childBrain = parent1.brain.crossover(parent2.brain);
            childBrain.mutate(this.mutationRate, this.mutationStrength);
            
            const baseIndex = newAgents.length % 4;
            const basePositions = [
                { x: 50, y: 450 },
                { x: 750, y: 450 },
                { x: 50, y: 50 },
                { x: 750, y: 50 }
            ];
            
            const pos = basePositions[baseIndex];
            const child = new Agent(pos.x, pos.y, childBrain);
            newAgents.push(child);
        }
        
        return newAgents;
    }
    
    tournamentSelect() {
        const tournamentSize = 3;
        let best = null;
        
        for (let i = 0; i < tournamentSize; i++) {
            const candidate = this.agents[Math.floor(Math.random() * this.eliteCount * 2)];
            if (!best || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        
        return best;
    }
    
    updateStatistics() {
        this.bestFitness = this.agents[0].fitness;
        
        let totalFitness = 0;
        for (const agent of this.agents) {
            totalFitness += agent.fitness;
        }
        this.averageFitness = totalFitness / this.agents.length;
        
        // Store generation data
        this.generationHistory.push({
            generation: this.generation,
            bestFitness: this.bestFitness,
            averageFitness: this.averageFitness,
            crystalsDelivered: this.agents[0].crystalsDelivered
        });
        
        // Keep only last 50 generations
        if (this.generationHistory.length > 50) {
            this.generationHistory.shift();
        }
    }
    
    cleanupPhysics(environment) {
        for (const agent of this.agents) {
            if (agent.body) {
                Matter.World.remove(environment.world, [
                    agent.body,
                    agent.leftWheel,
                    agent.rightWheel,
                    agent.leftConstraint,
                    agent.rightConstraint
                ]);
            }
        }
    }
    
    getStatistics() {
        const topAgents = this.agents.slice(0, 5);
        
        return {
            generation: this.generation,
            progress: (this.currentFrame / this.simulationTime * 100).toFixed(1),
            bestFitness: this.bestFitness.toFixed(2),
            averageFitness: this.averageFitness.toFixed(2),
            topAgents: topAgents.map(agent => ({
                fitness: agent.fitness.toFixed(2),
                crystalsDelivered: agent.crystalsDelivered,
                crystalsCollected: agent.crystalsCollected,
                collisions: agent.collisions
            })),
            totalCrystalsDelivered: this.agents.reduce((sum, agent) => sum + agent.crystalsDelivered, 0),
            timeRemaining: Math.max(0, this.simulationTime - this.currentFrame)
        };
    }
    
    reset() {
        this.generation = 1;
        this.currentFrame = 0;
        this.bestFitness = 0;
        this.averageFitness = 0;
        this.generationHistory = [];
        this.createInitialPopulation();
    }
}