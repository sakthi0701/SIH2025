// src/lib/optimizer.ts

// --- TYPE DEFINITIONS ---
// These types match the ones in your DataContext for consistency.

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  weeklyHours: number;
  // ... other course properties
}

interface Faculty {
  id: string;
  name: string;
  maxLoad: number;
  preferences: string[]; // e.g., ['Morning slots']
  // ... other faculty properties
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  // ... other room properties
}

interface Batch {
  id: string;
  name: string;
  studentCount: number;
  department: string;
  // ... other batch properties
}

interface Constraint {
  id: string;
  name: string;
  type: 'hard' | 'soft';
  enabled: boolean;
  priority: number;
  // ... other constraint properties
}

// Represents the input data for the optimizer
export interface OptimizerInput {
  courses: Course[];
  faculty: Faculty[];
  rooms: Room[];
  batches: Batch[];
  constraints: Constraint[];
}

// Represents a single scheduled class in a time slot
interface ScheduledClass {
  course: Course;
  faculty: Faculty;
  room: Room;
  batch: Batch;
}

// The main timetable structure: Day -> Time Slot -> Scheduled Class
type Timetable = Record<string, Record<string, ScheduledClass[]>>;

// A single generated solution with its score and details
export interface OptimizationResult {
  id: number;
  name: string;
  timetable: Timetable;
  score: number;
  conflicts: number; // Should be 0 if successful
  utilization: number;
  facultyBalance: number;
  studentGaps: number;
}

// --- CONSTANTS AND CONFIGURATION ---

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const TIME_SLOTS = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'];
const LUNCH_SLOT = '12:00-13:00';

// --- GENETIC ALGORITHM CONFIGURATION ---
const POPULATION_SIZE = 50;
const MAX_GENERATIONS = 100;
const MUTATION_RATE = 0.1;
const TOURNAMENT_SIZE = 5;


// --- HELPER FUNCTIONS ---

/**
 * Creates a list of individual class sessions to be scheduled.
 * For example, a course with weeklyHours = 3 will create 3 sessions.
 */
const createClassSessions = (courses: Course[], batches: Batch[]): { course: Course; batch: Batch }[] => {
  const sessions: { course: Course; batch: Batch }[] = [];
  courses.forEach(course => {
    // Find a matching batch (simplified logic: matches by department)
    const courseBatch = batches.find(b => b.department === course.department);
    if (courseBatch) {
      for (let i = 0; i < course.weeklyHours; i++) {
        sessions.push({ course, batch: courseBatch });
      }
    }
  });
  return sessions;
};

/**
 * A utility to pause execution, allowing the UI to update.
 */
const yieldToEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));


// --- CORE GENETIC ALGORITHM LOGIC ---

export const runOptimization = async (
  input: OptimizerInput,
  updateProgress: (progress: number) => void
): Promise<OptimizationResult[]> => {
  
  const { courses, faculty, rooms, batches, constraints } = input;
  let solutions: OptimizationResult[] = [];

  updateProgress(5);
  await yieldToEventLoop();

  // 1. Prepare data for optimization
  const classSessions = createClassSessions(courses, batches);
  const enabledHardConstraints = constraints.filter(c => c.type === 'hard' && c.enabled);
  const enabledSoftConstraints = constraints.filter(c => c.type === 'soft' && c.enabled);

  // 2. Initialize population
  let population = initializePopulation(classSessions, faculty, rooms, batches, POPULATION_SIZE);

  // 3. Evolve population
  for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
    // a. Calculate fitness for each individual
    const fitnessScores = population.map(individual => calculateFitness(individual, enabledHardConstraints, enabledSoftConstraints, input));

    // b. Create new population
    let newPopulation = [];

    for (let i = 0; i < POPULATION_SIZE; i++) {
      // i. Select parents
      const parent1 = tournamentSelection(population, fitnessScores);
      const parent2 = tournamentSelection(population, fitnessScores);
      
      // ii. Crossover
      let child = crossover(parent1, parent2);
      
      // iii. Mutate
      if (Math.random() < MUTATION_RATE) {
        child = mutate(child, faculty, rooms, batches);
      }

      newPopulation.push(child);
    }

    population = newPopulation;
    
    updateProgress(5 + (generation / MAX_GENERATIONS) * 90);
    await yieldToEventLoop();
  }

  // 4. Get best solution
  const bestIndividual = population.reduce((best, current) => {
    return calculateFitness(current, enabledHardConstraints, enabledSoftConstraints, input) > calculateFitness(best, enabledHardConstraints, enabledSoftConstraints, input) ? current : best;
  });

  const bestTimetable = individualToTimetable(bestIndividual);
  const bestScore = calculateScore(bestTimetable, enabledSoftConstraints, input);
  const bestConflicts = countHardConflicts(bestIndividual, enabledHardConstraints, input);

  solutions.push({
    id: 1,
    name: "Generated Schedule",
    timetable: bestTimetable,
    score: bestScore,
    conflicts: bestConflicts, 
    utilization: 0, 
    facultyBalance: 0,
    studentGaps: 0,
  });

  updateProgress(100);
  return solutions;
};


// --- GENETIC ALGORITHM OPERATORS ---

const initializePopulation = (sessions: any[], faculty: any[], rooms: any[], batches: any[], size: number) => {
  let population = [];
  for (let i = 0; i < size; i++) {
    let individual = [];
    for (const session of sessions) {
      const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
      const randomSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
      const randomFaculty = faculty[Math.floor(Math.random() * faculty.length)];
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      
      individual.push({
        ...session,
        day: randomDay,
        slot: randomSlot,
        faculty: randomFaculty,
        room: randomRoom,
      });
    }
    population.push(individual);
  }
  return population;
};


const calculateFitness = (individual: any[], hardConstraints: any[], softConstraints: any[], inputData: any) => {
  let fitness = 100;
  
  // Penalize hard constraint violations
  fitness -= countHardConflicts(individual, hardConstraints, inputData) * 10;
  
  // Penalize soft constraint violations
  const timetable = individualToTimetable(individual);
  fitness -= (100 - calculateScore(timetable, softConstraints, inputData));
  
  return Math.max(0, fitness);
};


const tournamentSelection = (population: any[], fitnessScores: number[]) => {
  let best = null;
  let bestFitness = -1;

  for (let i = 0; i < TOURNAMENT_SIZE; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    if (fitnessScores[randomIndex] > bestFitness) {
      bestFitness = fitnessScores[randomIndex];
      best = population[randomIndex];
    }
  }
  return best;
};


const crossover = (parent1: any[], parent2: any[]) => {
  const crossoverPoint = Math.floor(Math.random() * parent1.length);
  const child = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
  return child;
};

const mutate = (individual: any[], faculty: any[], rooms: any[], batches: any[]) => {
  const mutationPoint = Math.floor(Math.random() * individual.length);
  
  const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
  const randomSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
  const randomFaculty = faculty[Math.floor(Math.random() * faculty.length)];
  const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];

  individual[mutationPoint] = {
    ...individual[mutationPoint],
    day: randomDay,
    slot: randomSlot,
    faculty: randomFaculty,
    room: randomRoom,
  }

  return individual;
};


// --- CONFLICT CHECKING AND SCORING ---

const countHardConflicts = (individual: any[], hardConstraints: any[], inputData: any) => {
  let conflicts = 0;
  const timetable = individualToTimetable(individual);
  const facultyLoad = {};

  for (const day of DAYS) {
    for (const slot of TIME_SLOTS) {
      const classesInSlot = timetable[day][slot];
      for (const assignment of classesInSlot) {
        for (const constraint of hardConstraints) {
          if (!checkConsistency(constraint.name, assignment, day, slot, timetable, facultyLoad)) {
            conflicts++;
          }
        }
      }
    }
  }
  return conflicts;
}

const checkConsistency = (
  constraintName: string,
  assignment: ScheduledClass,
  day: string,
  slot: string,
  timetable: Timetable,
  facultyLoad: Record<string, number>
): boolean => {
  const { course, faculty, room, batch } = assignment;
  const classesInSlot = timetable[day][slot];

  switch (constraintName) {
    case 'No Faculty Double Booking':
      return !classesInSlot.some(c => c.faculty.id === faculty.id && c !== assignment);

    case 'No Room Double Booking':
      return !classesInSlot.some(c => c.room.id === room.id && c !== assignment);
      
    case 'No Batch Double Booking':
      return !classesInSlot.some(c => c.batch.id === batch.id && c !== assignment);

    case 'Room Capacity Check':
      return room.capacity >= batch.studentCount;
      
    case 'Faculty Workload': // Assumed hard constraint
      return (facultyLoad[faculty.id] || 0) < faculty.maxLoad;

    default:
      return true; // Unknown constraints are ignored
  }
};


const calculateScore = (
  timetable: Timetable,
  softConstraints: Constraint[],
  inputData: OptimizerInput
): number => {
  let totalPenalty = 0;

  for (const constraint of softConstraints) {
      if (!constraint.enabled) continue;
      
      let penalty = 0;
      const weight = constraint.priority / 10.0;

      switch(constraint.name) {
          case 'Faculty Preferred Hours':
              // Simplified: 'Morning' is before lunch
              for(const day of DAYS) {
                  for(const slot of TIME_SLOTS) {
                      timetable[day][slot].forEach(c => {
                          const isMorning = TIME_SLOTS.indexOf(slot) < TIME_SLOTS.indexOf(LUNCH_SLOT);
                          if (
                              (c.faculty.preferences.includes('Morning slots') && !isMorning) ||
                              (c.faculty.preferences.includes('Afternoon slots') && isMorning)
                          ) {
                              penalty += 1;
                          }
                      });
                  }
              }
              break;
          
          case 'Minimize Student Gaps':
              // This is computationally expensive. Simplified version:
              let gaps = 0;
              for (const batch of inputData.batches) {
                  for (const day of DAYS) {
                      const batchSlots = TIME_SLOTS
                          .map((slot, index) => timetable[day][slot].some(c => c.batch.id === batch.id) ? index : -1)
                          .filter(index => index !== -1);
                      
                      for (let i = 0; i < batchSlots.length - 1; i++) {
                          const gap = batchSlots[i+1] - batchSlots[i] - 1;
                          if (gap > 0) {
                              gaps += gap;
                          }
                      }
                  }
              }
              penalty = gaps;
              break;
      }
      totalPenalty += penalty * weight;
  }
  
  // Score starts at 100 and decreases with penalties
  return Math.max(0, 100 - totalPenalty);
};


const individualToTimetable = (individual: any[]): Timetable => {
  const timetable = Object.fromEntries(DAYS.map(day => [day, Object.fromEntries(TIME_SLOTS.map(slot => [slot, []]))]));
  for (const assignment of individual) {
    timetable[assignment.day][assignment.slot].push(assignment);
  }
  return timetable;
}