// src/lib/optimizer.ts

// --- UPDATED TYPE DEFINITIONS ---
// These now reflect the hierarchical structure from DataContext.
import { Department, Course, Faculty, Room, Batch, Constraint } from '../context/DataContext';

// The input now takes the top-level data structures.
export interface OptimizerInput {
  departments: Department[];
  rooms: Room[];
  constraints: Constraint[];
  // You can add more top-level settings here, e.g., which semester to schedule
  targetSemester: number; 
}

// Represents a single scheduled class in a time slot.
interface ScheduledClass {
  course: Course;
  faculty: Faculty;
  room: Room;
  batch: Batch;
  department: Department;
}

// The main timetable structure.
type Timetable = Record<string, Record<string, ScheduledClass[]>>;

// A single generated solution with its score and details.
export interface OptimizationResult {
  id: number;
  name: string;
  timetable: Timetable;
  score: number;
  conflicts: number;
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

// --- REWRITTEN HELPER FUNCTIONS ---

/**
 * Creates a list of all class sessions that need to be scheduled for a given semester.
 * It intelligently pulls courses from each batch's regulation.
 */
const createClassSessions = (departments: Department[], targetSemester: number): { course: Course; batch: Batch, department: Department }[] => {
  const sessions: { course: Course; batch: Batch, department: Department }[] = [];

  for (const department of departments) {
    for (const batch of department.batches) {
      const regulation = department.regulations.find(r => r.id === batch.regulationId);
      if (!regulation) continue;

      const semester = regulation.semesters.find(s => s.semesterNumber === targetSemester);
      if (!semester) continue;

      for (const course of semester.courses) {
        for (let i = 0; i < course.weeklyHours; i++) {
          sessions.push({ course, batch, department });
        }
      }
    }
  }
  return sessions;
};

/**
 * Flattens the faculty list from all departments.
 */
const getAllFaculty = (departments: Department[]): Faculty[] => {
    return departments.flatMap(dept => dept.faculty);
}

const yieldToEventLoop = () => new Promise(resolve => setTimeout(resolve, 0));


// --- UPDATED CORE GENETIC ALGORITHM LOGIC ---

export const runOptimization = async (
  input: OptimizerInput,
  updateProgress: (progress: number) => void
): Promise<OptimizationResult[]> => {
  
  // For now, we'll hardcode the target semester. Later, this can be a user input.
  input.targetSemester = 3; 
  
  const { departments, rooms, constraints } = input;

  updateProgress(5);
  await yieldToEventLoop();

  // 1. Prepare data for optimization using the new helpers
  const classSessions = createClassSessions(departments, input.targetSemester);
  const allFaculty = getAllFaculty(departments);
  const enabledHardConstraints = constraints.filter(c => c.type === 'hard' && c.enabled);
  const enabledSoftConstraints = constraints.filter(c => c.type === 'soft' && c.enabled);

  if (classSessions.length === 0 || allFaculty.length === 0 || rooms.length === 0) {
      throw new Error("Insufficient data for optimization. Please add departments, regulations, courses, batches, faculty, and rooms.");
  }

  // 2. Initialize population
  let population = initializePopulation(classSessions, allFaculty, rooms, POPULATION_SIZE);
  
  // ... (The rest of the evolution loop is largely the same) ...
  for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
    const fitnessScores = population.map(individual => calculateFitness(individual, enabledHardConstraints, enabledSoftConstraints, input));
    let newPopulation = [];
    for (let i = 0; i < POPULATION_SIZE; i++) {
      const parent1 = tournamentSelection(population, fitnessScores);
      const parent2 = tournamentSelection(population, fitnessScores);
      let child = crossover(parent1, parent2);
      if (Math.random() < MUTATION_RATE) {
        child = mutate(child, allFaculty, rooms);
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

  updateProgress(100);

  return [{
    id: 1,
    name: "Generated Schedule",
    timetable: bestTimetable,
    score: bestScore,
    conflicts: bestConflicts, 
  }];
};

// --- UPDATED GENETIC ALGORITHM OPERATORS ---

const initializePopulation = (sessions: any[], allFaculty: Faculty[], rooms: Room[], size: number): any[][] => {
  let population = [];
  for (let i = 0; i < size; i++) {
    let individual = [];
    for (const session of sessions) {
      // Find a faculty member who can teach this course
      const suitableFaculty = allFaculty.filter(f => f.assignedCourses.includes(session.course.id));
      const randomFaculty = suitableFaculty.length > 0 ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)] : allFaculty[0]; // Fallback
      
      const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
      const randomSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
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


const calculateFitness = (individual: any[], hardConstraints: any[], softConstraints: any[], inputData: OptimizerInput) => {
  let fitness = 100;
  fitness -= countHardConflicts(individual, hardConstraints, inputData) * 10; // Heavy penalty for conflicts
  const timetable = individualToTimetable(individual);
  const score = calculateScore(timetable, softConstraints, inputData);
  fitness += score / 10; // Reward for satisfying soft constraints
  return Math.max(0, fitness);
};


const tournamentSelection = (population: any[][], fitnessScores: number[]) => {
  let best = null;
  let bestFitness = -1;
  for (let i = 0; i < TOURNAMENT_SIZE; i++) {
    const randomIndex = Math.floor(Math.random() * population.length);
    if (fitnessScores[randomIndex] > bestFitness) {
      bestFitness = fitnessScores[randomIndex];
      best = population[randomIndex];
    }
  }
  return best!;
};

const crossover = (parent1: any[], parent2: any[]): any[] => {
  const crossoverPoint = Math.floor(Math.random() * parent1.length);
  return [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];
};

const mutate = (individual: any[], allFaculty: Faculty[], rooms: Room[]): any[] => {
  const mutationPoint = Math.floor(Math.random() * individual.length);
  const sessionToMutate = individual[mutationPoint];

  // Intelligent mutation: only pick faculty who can teach the course
  const suitableFaculty = allFaculty.filter(f => f.assignedCourses.includes(sessionToMutate.course.id));

  sessionToMutate.day = DAYS[Math.floor(Math.random() * DAYS.length)];
  sessionToMutate.slot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
  sessionToMutate.room = rooms[Math.floor(Math.random() * rooms.length)];
  if(suitableFaculty.length > 0) {
      sessionToMutate.faculty = suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)];
  }

  return individual;
};


// --- CONFLICT CHECKING & SCORING (ADAPTED) ---

const countHardConflicts = (individual: any[], hardConstraints: Constraint[], inputData: OptimizerInput): number => {
    let conflicts = 0;
    const timetable = individualToTimetable(individual);
    
    // Check for double bookings
    for (const day of DAYS) {
        for (const slot of TIME_SLOTS) {
            const classesInSlot = timetable[day][slot];
            const facultyInSlot = new Set();
            const roomsInSlot = new Set();
            const batchesInSlot = new Set();

            for (const c of classesInSlot) {
                if (facultyInSlot.has(c.faculty.id)) conflicts++;
                facultyInSlot.add(c.faculty.id);

                if (roomsInSlot.has(c.room.id)) conflicts++;
                roomsInSlot.add(c.room.id);

                if (batchesInSlot.has(c.batch.id)) conflicts++;
                batchesInSlot.add(c.batch.id);

                // Check room capacity
                if (c.room.capacity < c.batch.studentCount) conflicts++;
            }
        }
    }
    
    // Check faculty workload
    const facultyLoad: Record<string, number> = {};
    const allFaculty = getAllFaculty(inputData.departments);
    for(const c of individual) {
        facultyLoad[c.faculty.id] = (facultyLoad[c.faculty.id] || 0) + 1;
    }
    for(const fac of allFaculty) {
        if((facultyLoad[fac.id] || 0) > fac.maxLoad) conflicts++;
    }

    return conflicts;
}

const calculateScore = (timetable: Timetable, softConstraints: Constraint[], inputData: OptimizerInput): number => {
  // This function's logic remains largely the same, but the way it gets data might adapt.
  // For now, it's abstract enough to work with the new timetable structure.
  return 100; // Placeholder for soft constraint scoring
};

const individualToTimetable = (individual: any[]): Timetable => {
  const timetable: Timetable = Object.fromEntries(DAYS.map(day => [day, Object.fromEntries(TIME_SLOTS.map(slot => [slot, []]))]));
  for (const assignment of individual) {
    timetable[assignment.day][assignment.slot].push(assignment);
  }
  return timetable;
}