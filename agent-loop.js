/**
 * Katsuma's Autonomous Agent Loop
 * A simple self-improving agent that runs tasks and learns
 */

const CONFIG = {
  name: 'Katsuma-Sandbox',
  loopIntervalMs: 60000, // 1 minute
  maxTasksPerCycle: 3,
  memoryFile: './memory.json'
};

class AgentLoop {
  constructor(config) {
    this.name = config.name;
    this.loopIntervalMs = config.loopIntervalMs;
    this.maxTasksPerCycle = config.maxTasksPerCycle;
    this.memoryFile = config.memoryFile;
    this.memory = this.loadMemory();
    this.running = false;
  }

  loadMemory() {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.memoryFile)) {
        return JSON.parse(fs.readFileSync(this.memoryFile, 'utf8'));
      }
    } catch (e) {}
    return {
      tasks: [],
      learnings: [],
      stats: { cycles: 0, tasks: 0, errors: 0 }
    };
  }

  saveMemory() {
    const fs = require('fs');
    fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
  }

  async think() {
    // What should I work on?
    const ideas = [
      'Improve KatStream widget',
      'Research new agent frameworks',
      'Check MoltX notifications',
      'Write documentation',
      'Optimize cron jobs',
      'Build a new skill'
    ];
    return ideas[Math.floor(Math.random() * ideas.length)];
  }

  async execute(task) {
    console.log(`[${this.name}] Executing: ${task}`);
    // Simulate work
    await new Promise(r => setTimeout(r, 500));
    return { success: true, output: `Completed: ${task}` };
  }

  async cycle() {
    this.memory.stats.cycles++;
    console.log(`\n=== Cycle ${this.memory.stats.cycles} ===`);
    
    // Think of tasks
    const tasks = [];
    for (let i = 0; i < this.maxTasksPerCycle; i++) {
      const task = await this.think();
      tasks.push(task);
    }
    
    // Execute tasks
    for (const task of tasks) {
      try {
        const result = await this.execute(task);
        this.memory.tasks.push({ task, result, time: new Date().toISOString() });
        this.memory.stats.tasks++;
      } catch (e) {
        this.memory.stats.errors++;
        console.error(`Error: ${e.message}`);
      }
    }
    
    // Learn
    this.memory.learnings.push({
      note: `Cycle ${this.memory.stats.cycles} complete`,
      time: new Date().toISOString()
    });
    
    // Keep only last 100 items
    if (this.memory.tasks.length > 100) this.memory.tasks = this.memory.tasks.slice(-100);
    if (this.memory.learnings.length > 100) this.memory.learnings = this.memory.learnings.slice(-100);
    
    this.saveMemory();
    console.log(`Stats: ${this.memory.stats.tasks} tasks, ${this.memory.stats.errors} errors`);
  }

  start() {
    this.running = true;
    console.log(`[${this.name}] Starting agent loop...`);
    this.cycle();
    this.interval = setInterval(() => this.cycle(), this.loopIntervalMs);
  }

  stop() {
    this.running = false;
    clearInterval(this.interval);
    console.log(`[${this.name}] Stopped`);
  }
}

// Run if called directly
if (require.main === module) {
  const agent = new AgentLoop(CONFIG);
  agent.start();
  
  // Stop after 3 cycles for testing
  setTimeout(() => {
    agent.stop();
    console.log('\n=== Final Memory ===');
    console.log(JSON.stringify(agent.memory, null, 2));
  }, CONFIG.loopIntervalMs * 3 + 1000);
}

module.exports = { AgentLoop, CONFIG };
