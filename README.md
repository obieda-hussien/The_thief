# Resource Runners - AI Evolution Simulation

A 2D physics-based multi-agent AI simulation game featuring neuroevolution through genetic algorithms. Watch AI agents evolve to collect energy crystals in a complex physics environment!

![Resource Runners Screenshot](https://github.com/user-attachments/assets/678c4786-aeac-479e-9165-c6204cad4d6b)

## 🎮 Game Concept

**Resource Runners** is an AI evolution simulation where neural network-controlled agents compete to collect energy crystals and return them to their bases. The agents evolve over generations using a genetic algorithm, discovering increasingly sophisticated strategies for navigation, collection, and competition.

## 🧠 Core Features

### Physics-Based Multi-Agent AI
- **50 AI agents** compete simultaneously in each generation
- **Neural network brains** control agent movement (8 inputs → 12 hidden → 3 outputs)
- **Physics-driven movement** using wheel torques and jump thrusters
- **Complex terrain** with hills, platforms, moving obstacles, and interactive elements

### Neuroevolution System
- **Genetic Algorithm** evolves agent behaviors over generations
- **Tournament selection** chooses the best performers as parents
- **Crossover and mutation** create new generations with improved capabilities
- **Fitness evaluation** rewards crystal delivery and penalizes collisions

### Interactive Environment
- **Energy Crystals**: Scattered resources that agents must collect
- **Agent Bases**: Corner locations where crystals must be delivered
- **Dynamic Obstacles**: Moving pendulums and interactive seesaws
- **Collision Detection**: Crystal stealing between competing agents

## 🎯 Gameplay Mechanics

### Agent Capabilities
- **Sensor System**: 4 raycasts for obstacle detection + velocity sensing
- **Movement Control**: Independent wheel torques for realistic physics movement  
- **Crystal Interaction**: Pick up, carry, and deliver crystals to bases
- **Competition**: Steal crystals from other agents through physical collisions

### Fitness Evaluation
- **+100 points** per crystal successfully delivered to base
- **+0.1 points** per frame spent holding a crystal (encourages fast delivery)
- **-5 points** per collision with hazards
- **-1 point** for inactivity (encourages exploration)

### Evolution Process
- **30-second generations** with real-time simulation
- **Elite preservation**: Top 5 agents automatically advance
- **Tournament selection**: Best agents chosen as parents
- **10% mutation rate** with controlled mutation strength

## 🚀 Getting Started

### Play Online (Recommended)
🎮 **Play the game directly in your browser:** [https://obieda-hussien.github.io/The_thief/](https://obieda-hussien.github.io/The_thief/)

No installation required! Just click the link above and start watching AI agents evolve.

### Local Development
If you want to run the game locally or modify the code:

#### Prerequisites
- Modern web browser with JavaScript support
- Python 3 (for local server)

#### Installation & Running
1. Clone the repository:
```bash
git clone https://github.com/obieda-hussien/The_thief.git
cd The_thief
```

2. Start a local web server:
```bash
python3 -m http.server 8000
# or use npm script:
npm run serve
```

3. Open your browser and navigate to:
```
http://localhost:8000
```

4. Click **"Start Evolution"** to begin the simulation!

## 🎮 Controls

- **Start Evolution**: Begin the AI evolution simulation
- **Pause/Resume**: Pause or resume the current simulation
- **Reset**: Reset to Generation 1 with new random agents
- **Space**: Pause/Resume (keyboard shortcut)
- **R**: Reset simulation (keyboard shortcut)
- **S**: Start evolution (keyboard shortcut)

## 📊 What to Expect

### Early Generations (1-10)
- Agents exhibit random, uncoordinated movement
- Most agents struggle with basic navigation
- Few crystals are successfully delivered

### Mid Evolution (10-50)
- Agents develop basic movement coordination
- Some discover crystal collection strategies
- Competition behaviors begin to emerge

### Advanced Generations (50+)
- Sophisticated navigation around obstacles
- Efficient crystal collection and delivery routes
- Emergence of specialized behaviors:
  - **"Collectors"**: Efficient at finding and gathering crystals
  - **"Thieves"**: Specialize in stealing from other agents
  - **"Defenders"**: Good at protecting carried crystals

## 🔧 Technical Architecture

### Core Components
- **`neural-network.js`**: Custom neural network implementation with backpropagation
- **`agent.js`**: AI agent class with physics body and behavior logic
- **`environment.js`**: Physics world setup using Matter.js engine
- **`evolution.js`**: Genetic algorithm implementation
- **`game.js`**: Main game loop, rendering, and UI management

### Technology Stack
- **JavaScript** - Core game logic and AI implementation
- **HTML5 Canvas** - Real-time 2D rendering
- **Matter.js** - Physics engine for realistic movement and collisions
- **CSS3** - Modern dark theme UI styling

## 🎯 Emergent Behaviors to Watch For

The beauty of this simulation lies in the emergent behaviors that develop over time:

1. **Adaptive Movement**: Agents learn to balance and navigate complex terrain
2. **Strategic Planning**: Development of efficient collection routes
3. **Social Dynamics**: Cooperation vs. competition strategies
4. **Environmental Exploitation**: Using seesaws and moving platforms creatively
5. **Defensive Tactics**: Protecting crystals while returning to base

## 📈 Performance Metrics

The simulation tracks various metrics to measure evolutionary progress:
- **Best Fitness**: Highest score achieved in the current generation
- **Average Fitness**: Population-wide performance indicator
- **Crystals Delivered**: Total successful deliveries per generation
- **Agent Performance**: Individual agent statistics and rankings

## 🤝 Contributing

This project demonstrates key concepts in:
- Artificial Intelligence and Machine Learning
- Genetic Algorithms and Neuroevolution
- Physics Simulation and Game Development
- Emergent Behavior in Multi-Agent Systems

Feel free to experiment with parameters, add new features, or explore different evolution strategies!

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.