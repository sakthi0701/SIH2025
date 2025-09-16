// src/lib/optimizer.ts

// --- UPDATED TYPE DEFINITIONS ---
import { Department, Course, Faculty, Room, Batch, Constraint } from '../context/DataContext';

// The input now takes the top-level data structures.
export interface OptimizerInput {
  departments: Department[];
  rooms: Room[];
  constraints: Constraint[];
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
// **IMPROVEMENT**: Create a list of slots available for scheduling, excluding lunch.
const SCHEDULABLE_SLOTS = TIME_SLOTS.filter(slot => slot !== LUNCH_SLOT);


// --- GENETIC ALGORITHM CONFIGURATION ---
const POPULATION_SIZE = 50;
const MAX_GENERATIONS = 100;
const MUTATION_RATE = 0.02; // **IMPROVEMENT**: This is now a per-gene mutation chance.
const TOURNAMENT_SIZE = 5;
const ELITISM_COUNT = 2; // **IMPROVEMENT**: Keep the top 2 individuals each generation.


// --- REWRITTEN HELPER FUNCTIONS ---

/**
 * Creates a list of all class sessions that need to be scheduled for a given semester.
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

  // 1. Prepare data for optimization
  const classSessions = createClassSessions(departments, input.targetSemester);
  const allFaculty = getAllFaculty(departments);
  const enabledHardConstraints = constraints.filter(c => c.type === 'hard' && c.enabled);
  const enabledSoftConstraints = constraints.filter(c => c.type === 'soft' && c.enabled);

  if (classSessions.length === 0 || allFaculty.length === 0 || rooms.length === 0) {
      throw new Error("Insufficient data for optimization. Please add departments, regulations, courses, batches, faculty, and rooms.");
  }

  // 2. Initialize population
  let population = initializePopulation(classSessions, allFaculty, rooms, POPULATION_SIZE);

  // 3. Evolution loop
  for (let generation = 0; generation < MAX_GENERATIONS; generation++) {
    const fitnessScores = population.map(individual => calculateFitness(individual, enabledHardConstraints, enabledSoftConstraints, input));
    
    let newPopulation = [];

    // **IMPROVEMENT: Elitism** - carry over the best individuals
    const sortedPopulation = population
        .map((ind, i) => ({ individual: ind, score: fitnessScores[i] }))
        .sort((a, b) => b.score - a.score);

    for (let i = 0; i < ELITISM_COUNT; i++) {
        newPopulation.push(sortedPopulation[i].individual);
    }
    
    // Fill the rest of the new population with offspring
    for (let i = 0; i < POPULATION_SIZE - ELITISM_COUNT; i++) {
      const parent1 = tournamentSelection(population, fitnessScores);
      const parent2 = tournamentSelection(population, fitnessScores);
      let child = crossover(parent1, parent2);
      child = mutate(child, allFaculty, rooms); // Mutation now happens on every new child
      newPopulation.push(child);
    }

    population = newPopulation;
    updateProgress(5 + (generation / MAX_GENERATIONS) * 90);
    await yieldToEventLoop();
  }

  // 4. Get best solution
  const finalFitnessScores = population.map(individual => calculateFitness(individual, enabledHardConstraints, enabledSoftConstraints, input));
  const bestIndividual = population[finalFitnessScores.indexOf(Math.max(...finalFitnessScores))];

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
      const suitableFaculty = allFaculty.filter(f => f.assignedCourses.includes(session.course.id));
      
      // **IMPROVEMENT**: Handle cases with no suitable faculty gracefully.
      const randomFaculty = suitableFaculty.length > 0 
        ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)] 
        : null; // Assign null if no one can teach it; this will be penalized.
      
      const randomDay = DAYS[Math.floor(Math.random() * DAYS.length)];
      const randomSlot = SCHEDULABLE_SLOTS[Math.floor(Math.random() * SCHEDULABLE_SLOTS.length)];
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
  fitness += (score - 100); // Add or subtract points based on soft constraints
  
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

// **IMPROVEMENT**: Using Uniform Crossover for better gene mixing.
const crossover = (parent1: any[], parent2: any[]): any[] => {
    return parent1.map((gene, index) => {
        return Math.random() < 0.5 ? gene : parent2[index];
    });
};

// **IMPROVEMENT**: Mutating a small percentage of genes for better exploration.
const mutate = (individual: any[], allFaculty: Faculty[], rooms: Room[]): any[] => {
    return individual.map(session => {
        if (Math.random() < MUTATION_RATE) {
            const suitableFaculty = allFaculty.filter(f => f.assignedCourses.includes(session.course.id));
            const newFaculty = suitableFaculty.length > 0 
                ? suitableFaculty[Math.floor(Math.random() * suitableFaculty.length)]
                : null;

            return {
                ...session,
                day: DAYS[Math.floor(Math.random() * DAYS.length)],
                slot: SCHEDULABLE_SLOTS[Math.floor(Math.random() * SCHEDULABLE_SLOTS.length)],
                room: rooms[Math.floor(Math.random() * rooms.length)],
                faculty: newFaculty,
            };
        }
        return session;
    });
};


// --- CONFLICT CHECKING & SCORING (ADAPTED) ---

const countHardConflicts = (individual: any[], hardConstraints: Constraint[], inputData: OptimizerInput): number => {
    let conflicts = 0;
    const timetable = individualToTimetable(individual);
    
    // Check for double bookings (faculty, room, batch)
    for (const day of DAYS) {
        for (const slot of SCHEDULABLE_SLOTS) {
            const classesInSlot = timetable[day][slot];
            if (classesInSlot.length <= 1) continue;

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
            }
        }
    }
    
    const facultyLoad: Record<string, number> = {};
    const allFaculty = getAllFaculty(inputData.departments);

    for(const c of individual) {
        // **IMPROVEMENT**: Penalize unassigned faculty
        if (!c.faculty) {
            conflicts++;
            continue;
        }

        facultyLoad[c.faculty.id] = (facultyLoad[c.faculty.id] || 0) + 1;

        // Check room capacity
        if (c.room.capacity < c.batch.studentCount) conflicts++;
    }

    // Check faculty workload
    for(const fac of allFaculty) {
        if((facultyLoad[fac.id] || 0) > fac.maxLoad) conflicts++;
    }

    return conflicts;
}

// **IMPROVEMENT**: Real implementation of soft constraint scoring.
const calculateScore = (timetable: Timetable, softConstraints: Constraint[], inputData: OptimizerInput): number => {
    let score = 0; // Start with a neutral score

    // Penalize gaps in batch schedules
    const GAP_PENALTY = 5;
    for (const department of inputData.departments) {
        for (const batch of department.batches) {
            for (const day of DAYS) {
                const classIndices = SCHEDULABLE_SLOTS
                    .map((slot, index) => timetable[day][slot].some(c => c.batch.id === batch.id) ? index : -1)
                    .filter(index => index !== -1)
                    .sort((a, b) => a - b);

                if (classIndices.length > 1) {
                    for (let i = 0; i < classIndices.length - 1; i++) {
                        const gap = classIndices[i+1] - classIndices[i] - 1;
                        if (gap > 0) {
                            score -= gap * GAP_PENALTY;
                        }
                    }
                }
            }
        }
    }
    
    // You can add more soft constraint checks here, e.g., faculty preferences
    // For each satisfied preference, `score += POINTS;`

    // Return a score based on a 100-point scale
    return 100 + score;
};

const individualToTimetable = (individual: any[]): Timetable => {
    // Initialize with all time slots, including lunch, for a complete view.
    const timetable: Timetable = Object.fromEntries(DAYS.map(day => [day, Object.fromEntries(TIME_SLOTS.map(slot => [slot, []]))]));
    
    for (const assignment of individual) {
        if(assignment.day && assignment.slot) { // Ensure assignment is valid
            timetable[assignment.day][assignment.slot].push(assignment);
        }
    }
    return timetable;
}